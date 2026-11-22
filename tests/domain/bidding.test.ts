import {
  BID_SILENCE_MS,
  BidContext,
  getMinimumBid,
  isFinalizationDue,
  validateBid,
} from '@/app/_shared/domain/bidding';
import { describe, expect, it } from 'vitest';

const start = Date.UTC(2025, 5, 7, 10, 0, 0);
const HOUR = 60 * 60 * 1000;
const schedule = { startsAt: start, endsAt: start + HOUR, slotMs: HOUR };

const baseContext: BidContext = {
  lot: { isSold: false, startBid: 100, minBidIncrement: 10 },
  auction: { isPublished: true, isApproved: true },
  schedule,
  topBid: null,
  bidderId: 'bidder',
  isOwner: false,
  amount: 100,
  now: start + 1000,
};

const withContext = (overrides: Partial<BidContext>): BidContext => ({ ...baseContext, ...overrides });

describe('getMinimumBid', () => {
  it('is the start bid when there are no bids yet', () => {
    expect(getMinimumBid({ startBid: 100, minBidIncrement: 10 }, null)).toBe(100);
    expect(getMinimumBid({ startBid: null, minBidIncrement: 10 }, null)).toBe(0);
  });

  it('is the top bid plus the minimum increment otherwise', () => {
    expect(getMinimumBid({ startBid: 100, minBidIncrement: 10 }, { amount: 250 })).toBe(260);
    expect(getMinimumBid({ startBid: 100, minBidIncrement: null }, { amount: 250 })).toBe(250);
  });
});

describe('validateBid', () => {
  it('accepts a first bid equal to the start bid', () => {
    expect(validateBid(baseContext)).toBeNull();
  });

  it('rejects bids on sold lots and inactive auctions', () => {
    expect(validateBid(withContext({ lot: { ...baseContext.lot, isSold: true } }))).toBe('LOT_SOLD');
    expect(validateBid(withContext({ auction: { isPublished: true, isApproved: false } }))).toBe('AUCTION_NOT_ACTIVE');
    expect(validateBid(withContext({ auction: { isPublished: false, isApproved: true } }))).toBe('AUCTION_NOT_ACTIVE');
  });

  it('rejects bids outside of the lot time slot', () => {
    expect(validateBid(withContext({ now: start - 1 }))).toBe('BIDDING_NOT_STARTED');
    expect(validateBid(withContext({ now: start + HOUR }))).toBe('BIDDING_ENDED');
  });

  it('rejects the owner of the lot', () => {
    expect(validateBid(withContext({ isOwner: true }))).toBe('OWN_LOT');
  });

  it('rejects a bidder who already holds the top bid', () => {
    const topBid = { amount: 150, bidderId: 'bidder', createdAt: start };

    expect(validateBid(withContext({ topBid, amount: 200 }))).toBe('ALREADY_TOP_BIDDER');
  });

  it('rejects amounts below the minimum bid', () => {
    const topBid = { amount: 150, bidderId: 'other', createdAt: start };

    expect(validateBid(withContext({ topBid, amount: 159 }))).toBe('AMOUNT_TOO_LOW');
    expect(validateBid(withContext({ topBid, amount: 160 }))).toBeNull();
    expect(validateBid(withContext({ amount: 99 }))).toBe('AMOUNT_TOO_LOW');
  });

  it('checks the rules in order of severity', () => {
    const context = withContext({ lot: { ...baseContext.lot, isSold: true }, isOwner: true, amount: 1 });

    expect(validateBid(context)).toBe('LOT_SOLD');
  });
});

describe('isFinalizationDue', () => {
  const topBid = { createdAt: start + 10 * 60 * 1000 };

  it('is due once the last bid has been silent long enough', () => {
    expect(isFinalizationDue(topBid, schedule, +topBid.createdAt + BID_SILENCE_MS - 1)).toBe(false);
    expect(isFinalizationDue(topBid, schedule, +topBid.createdAt + BID_SILENCE_MS)).toBe(true);
  });

  it('is due when the slot ended, even right after a bid', () => {
    const lateBid = { createdAt: schedule.endsAt - 1 };

    expect(isFinalizationDue(lateBid, schedule, schedule.endsAt)).toBe(true);
  });
});
