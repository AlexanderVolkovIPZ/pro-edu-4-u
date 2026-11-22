import { Status } from '@prisma/client';

type DateLike = Date | string | number | null | undefined;

type Period = {
  startDate?: DateLike;
  endDate?: DateLike;
};

/**
 * Single source of truth for the "time status" of auctions and lots.
 *
 *  - `COMPLETED`   when the period is over or the subject is already closed
 *  - `UPCOMING`    before the period starts (or when no period is defined)
 *  - `IN_PROGRESS` otherwise
 */
export function getPeriodStatus(period: Period, isClosed = false, now: number = Date.now()): Status {
  if (isClosed) return Status.COMPLETED;
  if (!period.startDate || !period.endDate) return Status.UPCOMING;

  const start = +new Date(period.startDate);
  const end = +new Date(period.endDate);

  if (now >= end) return Status.COMPLETED;
  if (now < start) return Status.UPCOMING;

  return Status.IN_PROGRESS;
}

export function getAuctionStatus(auction: Period & { isAllLotsSold: boolean }, now: number = Date.now()): Status {
  return getPeriodStatus(auction, auction.isAllLotsSold, now);
}

export function getLotStatus(lot: Period & { isSold?: boolean }, now: number = Date.now()): Status {
  return getPeriodStatus(lot, !!lot.isSold, now);
}
