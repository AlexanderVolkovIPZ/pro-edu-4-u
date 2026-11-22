import { BID_SILENCE_MS } from '@/app/_shared/domain/bidding';
import { AccessPolicy } from '@/server/auth/access-policy';
import { HttpError } from '@/server/http/http-error';
import { FinalizationScheduler } from '@/server/realtime/finalization-scheduler';
import { RealtimePublisher } from '@/server/realtime/publisher';
import { BidRejectedError, BidService } from '@/server/services/bid.service';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const HOUR = 60 * 60 * 1000;
const start = Date.UTC(2025, 5, 7, 10, 0, 0);
const now = start + 10 * 60 * 1000;

const owner = { id: 'owner-id', role: UserRole.USER };
const bidder = { id: 'bidder-id', role: UserRole.USER };
const other = { id: 'other-id', role: UserRole.USER };

const lotRef = { auctionId: 'auction-id', lotId: 'lot-id' };

function makeLot(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lot-id',
    position: 1,
    isSold: false,
    startBid: 100,
    minBidIncrement: 10,
    auction: {
      isPublished: true,
      isApproved: true,
      startDate: new Date(start),
      endDate: new Date(start + HOUR),
      _count: { lot: 1 },
      userAuction: [{ userId: owner.id }],
    },
    bid: [],
    ...overrides,
  };
}

function makeDb() {
  const db = {
    lot: { findFirst: vi.fn(), update: vi.fn((args) => ({ kind: 'lot.update', args })) },
    bid: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn((args) => ({ kind: 'bid.update', args })),
    },
    $transaction: vi.fn(),
  };

  return db;
}

describe('BidService.place', () => {
  let db: ReturnType<typeof makeDb>;
  let publisher: RealtimePublisher;
  let scheduler: FinalizationScheduler;
  let service: BidService;

  beforeEach(() => {
    db = makeDb();
    publisher = { bidCreated: vi.fn(), lotFinalized: vi.fn() };
    scheduler = new FinalizationScheduler();
    vi.spyOn(scheduler, 'schedule');
    service = new BidService(db as unknown as PrismaClient, new AccessPolicy(), publisher, scheduler);
  });

  it('creates the bid for the current user, broadcasts it and arms the finalization timer', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot());
    db.bid.create.mockImplementation(async ({ data }) => ({
      id: 'bid-1',
      ...data,
      createdAt: new Date(now),
      user: { id: bidder.id, name: 'B' },
    }));

    const bid = await service.place(bidder, { ...lotRef, amount: 100 }, now);

    expect(db.bid.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { lotId: 'lot-id', bidderId: bidder.id, amount: 100, type: 'BIDDING' } })
    );
    expect(publisher.bidCreated).toHaveBeenCalledWith(bid);
    expect(scheduler.schedule).toHaveBeenCalledWith('lot-id', BID_SILENCE_MS + 100, expect.any(Function));
    scheduler.cancel('lot-id');
  });

  it('arms the timer for the end of the slot when that comes first', async () => {
    const lateNow = start + HOUR - 5000;
    db.lot.findFirst.mockResolvedValue(makeLot());
    db.bid.create.mockImplementation(async ({ data }) => ({
      id: 'bid-1',
      ...data,
      createdAt: new Date(lateNow),
      user: { id: bidder.id, name: 'B' },
    }));

    await service.place(bidder, { ...lotRef, amount: 100 }, lateNow);

    expect(scheduler.schedule).toHaveBeenCalledWith('lot-id', 5000 + 100, expect.any(Function));
    scheduler.cancel('lot-id');
  });

  it('rejects the owner of the lot', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot());

    await expect(service.place(owner, { ...lotRef, amount: 100 }, now)).rejects.toMatchObject({ code: 'OWN_LOT' });
    expect(db.bid.create).not.toHaveBeenCalled();
  });

  it('rejects amounts below the top bid plus the increment', async () => {
    db.lot.findFirst.mockResolvedValue(
      makeLot({ bid: [{ amount: 200, bidderId: other.id, createdAt: new Date(now) }] })
    );

    await expect(service.place(bidder, { ...lotRef, amount: 205 }, now)).rejects.toMatchObject({
      code: 'AMOUNT_TOO_LOW',
    });
  });

  it('rejects bids before the lot slot starts', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot());

    await expect(service.place(bidder, { ...lotRef, amount: 100 }, start - 1)).rejects.toMatchObject({
      code: 'BIDDING_NOT_STARTED',
    });
  });

  it('reports a missing lot with 404', async () => {
    db.lot.findFirst.mockResolvedValue(null);

    const error = await service.place(bidder, { ...lotRef, amount: 100 }, now).catch((e) => e);

    expect(error).toBeInstanceOf(BidRejectedError);
    expect(error.status).toBe(404);
  });

  it('maps a unique-constraint violation to AMOUNT_TAKEN', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot());
    db.bid.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' })
    );

    await expect(service.place(bidder, { ...lotRef, amount: 100 }, now)).rejects.toMatchObject({
      code: 'AMOUNT_TAKEN',
    });
    expect(publisher.bidCreated).not.toHaveBeenCalled();
  });
});

describe('BidService.finalizeLot', () => {
  let db: ReturnType<typeof makeDb>;
  let publisher: RealtimePublisher;
  let service: BidService;

  beforeEach(() => {
    db = makeDb();
    publisher = { bidCreated: vi.fn(), lotFinalized: vi.fn() };
    service = new BidService(db as unknown as PrismaClient, new AccessPolicy(), publisher, new FinalizationScheduler());
  });

  it('refuses to finalize while bidding is still in progress', async () => {
    db.lot.findFirst.mockResolvedValue(
      makeLot({ bid: [{ id: 'bid-1', amount: 200, bidderId: other.id, createdAt: new Date(now) }] })
    );

    await expect(service.finalizeLot(lotRef, now + 1000)).rejects.toMatchObject({ status: 409 });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('marks the top bid as the winner and the lot as sold once the bidding is silent', async () => {
    const topBid = { id: 'bid-1', amount: 200, bidderId: other.id, createdAt: new Date(now) };
    db.lot.findFirst.mockResolvedValue(makeLot({ bid: [topBid] }));
    db.$transaction.mockResolvedValue([
      { ...topBid, isWinner: true },
      { id: 'lot-id', isSold: true },
    ]);

    const lot = await service.finalizeLot(lotRef, now + BID_SILENCE_MS);

    expect(lot).toEqual({ id: 'lot-id', isSold: true });
    expect(db.bid.update).toHaveBeenCalledWith({ where: { id: 'bid-1' }, data: { isWinner: true } });
    expect(db.lot.update).toHaveBeenCalledWith({ where: { id: 'lot-id' }, data: { isSold: true } });
    expect(publisher.lotFinalized).toHaveBeenCalledWith({ ...lotRef, winnerBidId: 'bid-1', winnerId: other.id });
  });

  it('is idempotent for sold lots', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot({ isSold: true }));

    await service.finalizeLot(lotRef, now);

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(publisher.lotFinalized).not.toHaveBeenCalled();
  });

  it('rejects lots without bids', async () => {
    db.lot.findFirst.mockResolvedValue(makeLot());

    await expect(service.finalizeLot(lotRef, now + HOUR)).rejects.toBeInstanceOf(HttpError);
  });
});

describe('BidService.list', () => {
  it('forces regular users to their own bids and lets administrators choose', async () => {
    const db = makeDb();
    db.bid.findMany.mockResolvedValue([]);
    const service = new BidService(db as unknown as PrismaClient, new AccessPolicy());

    await service.list(bidder, { bidderId: other.id, isWinner: true });
    expect(db.bid.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bidderId: bidder.id, isWinner: true } })
    );

    await service.list({ id: 'admin', role: UserRole.ADMIN }, { bidderId: other.id });
    expect(db.bid.findMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { bidderId: other.id } }));
  });
});
