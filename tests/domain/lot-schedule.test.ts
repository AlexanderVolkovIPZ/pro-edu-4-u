import { getLotSchedule, getLotTimeStatus, LOT_BUFFER_MS } from '@/app/_shared/domain/lot-schedule';
import { describe, expect, it } from 'vitest';

const HOUR = 60 * 60 * 1000;
const start = Date.UTC(2025, 5, 7, 10, 0, 0);

describe('getLotSchedule', () => {
  it('gives the whole period to a single lot', () => {
    const schedule = getLotSchedule({
      auctionStartDate: start,
      auctionEndDate: start + HOUR,
      position: 1,
      lotsCount: 1,
    });

    expect(schedule).toEqual({ startsAt: start, endsAt: start + HOUR, slotMs: HOUR });
  });

  it('splits the period evenly and keeps a buffer between lots', () => {
    const end = start + 3 * HOUR + 2 * LOT_BUFFER_MS;

    const first = getLotSchedule({ auctionStartDate: start, auctionEndDate: end, position: 1, lotsCount: 3 });
    const second = getLotSchedule({ auctionStartDate: start, auctionEndDate: end, position: 2, lotsCount: 3 });
    const third = getLotSchedule({ auctionStartDate: start, auctionEndDate: end, position: 3, lotsCount: 3 });

    expect(first.slotMs).toBe(HOUR);
    expect(first.endsAt).toBe(start + HOUR);
    expect(second.startsAt).toBe(first.endsAt + LOT_BUFFER_MS);
    expect(third.endsAt).toBe(end);
  });

  it('accepts ISO strings and Date objects', () => {
    const fromStrings = getLotSchedule({
      auctionStartDate: new Date(start).toISOString(),
      auctionEndDate: new Date(start + HOUR).toISOString(),
      position: 1,
      lotsCount: 1,
    });
    const fromDates = getLotSchedule({
      auctionStartDate: new Date(start),
      auctionEndDate: new Date(start + HOUR),
      position: 1,
      lotsCount: 1,
    });

    expect(fromStrings).toEqual(fromDates);
  });

  it('never produces a negative slot', () => {
    const schedule = getLotSchedule({
      auctionStartDate: start,
      auctionEndDate: start + 1000,
      position: 1,
      lotsCount: 5,
    });

    expect(schedule.slotMs).toBe(0);
    expect(schedule.endsAt).toBe(schedule.startsAt);
  });
});

describe('getLotTimeStatus', () => {
  const schedule = { startsAt: start, endsAt: start + HOUR, slotMs: HOUR };

  it('is UPCOMING before the slot, IN_PROGRESS inside it and COMPLETED after it', () => {
    expect(getLotTimeStatus(schedule, start - 1)).toBe('UPCOMING');
    expect(getLotTimeStatus(schedule, start)).toBe('IN_PROGRESS');
    expect(getLotTimeStatus(schedule, start + HOUR - 1)).toBe('IN_PROGRESS');
    expect(getLotTimeStatus(schedule, start + HOUR)).toBe('COMPLETED');
  });
});
