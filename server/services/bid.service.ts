import { BID_SILENCE_MS, BidRejectionCode, isFinalizationDue, validateBid } from '@/app/_shared/domain/bidding';
import { getLotSchedule } from '@/app/_shared/domain/lot-schedule';
import prismaDb from '@/lib/prismadb';
import { AuctionRole, BidType, Prisma, PrismaClient } from '@prisma/client';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { FinalizationScheduler, finalizationScheduler } from '../realtime/finalization-scheduler';
import { RealtimePublisher, realtimePublisher } from '../realtime/publisher';
import { ListBidsQuery } from '../schemas/bid.schema';

export type PlaceBidCommand = { auctionId: string; lotId: string; amount: number };
export type LotRef = { auctionId: string; lotId: string };

const STILL_IN_PROGRESS = 'Bidding is still in progress';
/** Extra time after the due moment so the timer never fires a hair too early. */
const FINALIZATION_MARGIN_MS = 100;
const FINALIZATION_RETRY_MS = 1000;

const REJECTION_MESSAGES: Record<BidRejectionCode, string> = {
  UNAUTHORIZED: 'You must be signed in to bid',
  INVALID_PAYLOAD: 'Invalid bid payload',
  LOT_NOT_FOUND: 'Lot not found',
  LOT_SOLD: 'Lot is already sold',
  AUCTION_NOT_ACTIVE: 'Auction is not published or approved',
  BIDDING_NOT_STARTED: 'Bidding for this lot has not started yet',
  BIDDING_ENDED: 'Bidding for this lot has ended',
  OWN_LOT: 'You cannot bid on your own lot',
  ALREADY_TOP_BIDDER: 'Your bid is already the highest one',
  AMOUNT_TOO_LOW: 'The bid must exceed the current bid by the minimum increment',
  AMOUNT_TAKEN: 'Somebody has just placed the same bid, try again',
};

/** A bid broke one of the bidding rules. Carries a machine-readable code. */
export class BidRejectedError extends HttpError {
  readonly code: BidRejectionCode;

  constructor(code: BidRejectionCode) {
    super(code === 'LOT_NOT_FOUND' ? 404 : 409, REJECTION_MESSAGES[code], { code });
    this.name = 'BidRejectedError';
    this.code = code;
  }
}

const lotForBiddingInclude = {
  auction: {
    include: {
      _count: { select: { lot: true } },
      userAuction: { where: { role: AuctionRole.OWNER }, select: { userId: true } },
    },
  },
  bid: { orderBy: { amount: 'desc' }, take: 1 },
} satisfies Prisma.LotInclude;

export class BidService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy,
    private readonly publisher: RealtimePublisher = realtimePublisher,
    private readonly scheduler: FinalizationScheduler = finalizationScheduler
  ) {}

  /** Regular users may only list their own bids; administrators may list anyone's. */
  async list(user: Principal, { lotId, lotsId, bidderId, isWinner, isPaid }: ListBidsQuery) {
    const where: Prisma.BidWhereInput = {
      bidderId: this.policy.isAdmin(user) ? bidderId : user.id,
      ...(lotId && { lotId }),
      ...(lotsId?.length && { lotId: { in: lotsId } }),
      ...(isWinner !== undefined && { isWinner }),
      ...(isPaid !== undefined && { isPaid }),
    };

    return this.db.bid.findMany({
      where,
      include: {
        lot: {
          include: {
            photo: true,
            video: true,
            auction: true,
            lotCategory: { include: { category: true } },
          },
        },
      },
    });
  }

  /**
   * Places a bid on behalf of the user after checking every bidding rule.
   * Used by both the REST endpoint and the WebSocket gateway. On success the
   * bid is broadcast and the finalization timer of the lot is re-armed.
   */
  async place(user: Principal, { auctionId, lotId, amount }: PlaceBidCommand, now: number = Date.now()) {
    const lot = await this.db.lot.findFirst({ where: { id: lotId, auctionId }, include: lotForBiddingInclude });
    if (!lot) {
      throw new BidRejectedError('LOT_NOT_FOUND');
    }

    const { auction } = lot;
    if (!auction.startDate || !auction.endDate) {
      throw new BidRejectedError('AUCTION_NOT_ACTIVE');
    }

    const schedule = getLotSchedule({
      auctionStartDate: auction.startDate,
      auctionEndDate: auction.endDate,
      position: lot.position,
      lotsCount: auction._count.lot,
    });

    const rejection = validateBid({
      lot,
      auction,
      schedule,
      topBid: lot.bid[0] ?? null,
      bidderId: user.id,
      isOwner: auction.userAuction.some(({ userId }) => userId === user.id),
      amount,
      now,
    });

    if (rejection) {
      throw new BidRejectedError(rejection);
    }

    let bid;
    try {
      bid = await this.db.bid.create({
        data: { lotId: lot.id, bidderId: user.id, amount, type: BidType.BIDDING },
        include: { user: { select: { id: true, name: true } } },
      });
    } catch (error) {
      // The (lotId, amount) pair is unique: a concurrent bid with the same amount won.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BidRejectedError('AMOUNT_TAKEN');
      }
      throw error;
    }

    this.publisher.bidCreated(bid);

    const dueAt = Math.min(+bid.createdAt + BID_SILENCE_MS, schedule.endsAt);
    this.scheduleFinalization({ auctionId, lotId }, dueAt - now + FINALIZATION_MARGIN_MS);

    return bid;
  }

  /**
   * Arms the server-side finalization timer. If the server finds the lot not
   * due yet when the timer fires (clock drift, latency), the timer is re-armed
   * instead of leaving the lot open.
   */
  private scheduleFinalization(ref: LotRef, delayMs: number): void {
    this.scheduler.schedule(ref.lotId, delayMs, async () => {
      try {
        await this.finalizeLot(ref);
      } catch (error) {
        if (error instanceof HttpError && error.status === 409 && error.message === STILL_IN_PROGRESS) {
          this.scheduleFinalization(ref, FINALIZATION_RETRY_MS);
          return;
        }
        throw error;
      }
    });
  }

  /**
   * Finalizes bidding for a lot: the highest bid becomes the winner and the
   * lot is marked as sold. Whether bidding is actually over is decided here,
   * from the auction schedule and the time of the last bid. Idempotent.
   */
  async finalizeLot({ auctionId, lotId }: LotRef, now: number = Date.now()) {
    const lot = await this.db.lot.findFirst({ where: { id: lotId, auctionId }, include: lotForBiddingInclude });
    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    if (lot.isSold) {
      return lot;
    }

    const [topBid] = lot.bid;
    if (!topBid) {
      throw HttpError.conflict('There are no bids for this lot');
    }

    const { auction } = lot;
    if (!auction.startDate || !auction.endDate) {
      throw HttpError.conflict('Auction has no schedule');
    }

    const schedule = getLotSchedule({
      auctionStartDate: auction.startDate,
      auctionEndDate: auction.endDate,
      position: lot.position,
      lotsCount: auction._count.lot,
    });

    if (!isFinalizationDue(topBid, schedule, now)) {
      throw HttpError.conflict(STILL_IN_PROGRESS);
    }

    const [winnerBid, updatedLot] = await this.db.$transaction([
      this.db.bid.update({ where: { id: topBid.id }, data: { isWinner: true } }),
      this.db.lot.update({ where: { id: lot.id }, data: { isSold: true } }),
    ]);

    this.scheduler.cancel(lot.id);
    this.publisher.lotFinalized({ auctionId, lotId, winnerBidId: winnerBid.id, winnerId: winnerBid.bidderId });

    return updatedLot;
  }
}

export const bidService = new BidService();
