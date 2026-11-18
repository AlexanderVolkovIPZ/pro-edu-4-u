import { BID_SILENCE_MS } from '@/app/_shared/domain/bidding';
import { getLotSchedule } from '@/app/_shared/domain/lot-schedule';
import prismaDb from '@/lib/prismadb';
import { BidType, Prisma, PrismaClient } from '@prisma/client';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { ListBidsQuery } from '../schemas/bid.schema';

export type PlaceBidCommand = { auctionId: string; lotId: string; amount: number };
export type LotRef = { auctionId: string; lotId: string };

export class BidService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy
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
   * Places a bid on behalf of the user. The bidder, type and winner / payment
   * flags are controlled by the server and cannot be supplied by the client.
   */
  async place(user: Principal, { auctionId, lotId, amount }: PlaceBidCommand) {
    const lot = await this.db.lot.findFirst({
      where: { id: lotId, auctionId },
      select: { id: true, isSold: true },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    if (lot.isSold) {
      throw HttpError.conflict('Lot is already sold');
    }

    return this.db.bid.create({
      data: { lotId: lot.id, bidderId: user.id, amount, type: BidType.BIDDING },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  /**
   * Finalizes bidding for a lot: the highest bid becomes the winner and the
   * lot is marked as sold. Whether bidding is actually over is decided here,
   * from the auction schedule and the time of the last bid. Idempotent.
   */
  async finalizeLot({ auctionId, lotId }: LotRef, now: number = Date.now()) {
    const lot = await this.db.lot.findFirst({
      where: { id: lotId, auctionId },
      include: {
        auction: { include: { _count: { select: { lot: true } } } },
        bid: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

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

    const isSilenceOver = now - +topBid.createdAt >= BID_SILENCE_MS;
    const isSlotOver = now >= schedule.endsAt;

    if (!isSilenceOver && !isSlotOver) {
      throw HttpError.conflict('Bidding is still in progress');
    }

    const [, updatedLot] = await this.db.$transaction([
      this.db.bid.update({ where: { id: topBid.id }, data: { isWinner: true } }),
      this.db.lot.update({ where: { id: lot.id }, data: { isSold: true } }),
    ]);

    return updatedLot;
  }
}

export const bidService = new BidService();
