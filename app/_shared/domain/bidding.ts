import { getLotTimeStatus, LotSchedule } from './lot-schedule';

/** Bidding closes when no new bid arrives within this period after the last one. */
export const BID_SILENCE_MS = 15_000;

export const BID_REJECTION_CODES = [
  'UNAUTHORIZED',
  'INVALID_PAYLOAD',
  'LOT_NOT_FOUND',
  'LOT_SOLD',
  'AUCTION_NOT_ACTIVE',
  'BIDDING_NOT_STARTED',
  'BIDDING_ENDED',
  'OWN_LOT',
  'ALREADY_TOP_BIDDER',
  'AMOUNT_TOO_LOW',
  'AMOUNT_TAKEN',
] as const;

export type BidRejectionCode = (typeof BID_REJECTION_CODES)[number];

export type TopBid = { amount: number; bidderId: string; createdAt: Date | string | number };

export type BidContext = {
  lot: { isSold: boolean; startBid: number | null; minBidIncrement: number | null };
  auction: { isPublished: boolean; isApproved: boolean };
  schedule: LotSchedule;
  topBid: TopBid | null;
  bidderId: string;
  isOwner: boolean;
  amount: number;
  now?: number;
};

/** The smallest amount that can be placed next. */
export function getMinimumBid(
  lot: { startBid: number | null; minBidIncrement: number | null },
  topBid: Pick<TopBid, 'amount'> | null
): number {
  if (!topBid) return lot.startBid ?? 0;
  return topBid.amount + (lot.minBidIncrement ?? 0);
}

/**
 * Business rules for placing a bid. Returns the reason a bid must be rejected
 * or `null` when the bid is acceptable. Pure: the same function runs on the
 * server (authoritative) and can be used on the client for early feedback.
 */
export function validateBid(context: BidContext): BidRejectionCode | null {
  const { lot, auction, schedule, topBid, bidderId, isOwner, amount, now = Date.now() } = context;

  if (lot.isSold) return 'LOT_SOLD';
  if (!auction.isPublished || !auction.isApproved) return 'AUCTION_NOT_ACTIVE';

  const timeStatus = getLotTimeStatus(schedule, now);
  if (timeStatus === 'UPCOMING') return 'BIDDING_NOT_STARTED';
  if (timeStatus === 'COMPLETED') return 'BIDDING_ENDED';

  if (isOwner) return 'OWN_LOT';
  if (topBid?.bidderId === bidderId) return 'ALREADY_TOP_BIDDER';
  if (amount < getMinimumBid(lot, topBid)) return 'AMOUNT_TOO_LOW';

  return null;
}

/**
 * Bidding for a lot is over when the last bid has been "silent" long enough
 * or the lot's time slot has ended.
 */
export function isFinalizationDue(
  topBid: Pick<TopBid, 'createdAt'>,
  schedule: LotSchedule,
  now: number = Date.now()
): boolean {
  const isSilenceOver = now - +new Date(topBid.createdAt) >= BID_SILENCE_MS;
  const isSlotOver = now >= schedule.endsAt;

  return isSilenceOver || isSlotOver;
}
