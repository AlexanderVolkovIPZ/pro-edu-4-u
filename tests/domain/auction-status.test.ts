import { getAuctionStatus, getLotStatus, getPeriodStatus } from '@/app/_shared/domain/auction-status';
import { Status } from '@prisma/client';
import { describe, expect, it } from 'vitest';

const start = Date.UTC(2025, 5, 7, 10, 0, 0);
const end = start + 60 * 60 * 1000;

describe('getPeriodStatus', () => {
  it('is UPCOMING when the period is not defined', () => {
    expect(getPeriodStatus({}, false, start)).toBe(Status.UPCOMING);
    expect(getPeriodStatus({ startDate: start }, false, start)).toBe(Status.UPCOMING);
  });

  it('follows the timeline', () => {
    expect(getPeriodStatus({ startDate: start, endDate: end }, false, start - 1)).toBe(Status.UPCOMING);
    expect(getPeriodStatus({ startDate: start, endDate: end }, false, start)).toBe(Status.IN_PROGRESS);
    expect(getPeriodStatus({ startDate: start, endDate: end }, false, end)).toBe(Status.COMPLETED);
  });

  it('is COMPLETED as soon as the subject is closed, whatever the time', () => {
    expect(getPeriodStatus({ startDate: start, endDate: end }, true, start - 1)).toBe(Status.COMPLETED);
  });
});

describe('getAuctionStatus / getLotStatus', () => {
  it('treats an auction with all lots sold as completed', () => {
    expect(getAuctionStatus({ startDate: start, endDate: end, isAllLotsSold: true }, start + 1)).toBe(Status.COMPLETED);
    expect(getAuctionStatus({ startDate: start, endDate: end, isAllLotsSold: false }, start + 1)).toBe(
      Status.IN_PROGRESS
    );
  });

  it('treats a sold lot as completed', () => {
    expect(getLotStatus({ startDate: start, endDate: end, isSold: true }, start + 1)).toBe(Status.COMPLETED);
    expect(getLotStatus({ startDate: start, endDate: end }, start + 1)).toBe(Status.IN_PROGRESS);
  });
});
