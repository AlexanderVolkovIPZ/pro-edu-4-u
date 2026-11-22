/**
 * Pure scheduling rules for lots inside an auction.
 *
 * The auction period is split evenly between its lots, with a fixed buffer
 * between consecutive lots. The same function is used by the client (timers,
 * countdowns) and by the server (bid validation, finalization), so both sides
 * always agree on when a lot is open for bidding.
 */

export const LOT_BUFFER_MS = 60 * 1000;

export type LotSchedule = {
  /** Timestamp (ms) when bidding for the lot opens. */
  startsAt: number;
  /** Timestamp (ms) when bidding for the lot closes. */
  endsAt: number;
  /** Duration of a single lot slot (ms). */
  slotMs: number;
};

type ScheduleInput = {
  auctionStartDate: Date | string | number;
  auctionEndDate: Date | string | number;
  position: number;
  lotsCount: number;
};

export function getLotSchedule({ auctionStartDate, auctionEndDate, position, lotsCount }: ScheduleInput): LotSchedule {
  const start = +new Date(auctionStartDate);
  const end = +new Date(auctionEndDate);
  const count = Math.max(1, lotsCount);

  const periodWithoutBuffers = end - start - LOT_BUFFER_MS * (count - 1);
  const slotMs = Math.max(0, Math.floor(periodWithoutBuffers / count));

  const startsAt = start + (slotMs + LOT_BUFFER_MS) * (position - 1);
  const endsAt = startsAt + slotMs;

  return { startsAt, endsAt, slotMs };
}

export type LotTimeStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export function getLotTimeStatus(schedule: LotSchedule, now: number = Date.now()): LotTimeStatus {
  if (now < schedule.startsAt) return 'UPCOMING';
  if (now >= schedule.endsAt) return 'COMPLETED';
  return 'IN_PROGRESS';
}
