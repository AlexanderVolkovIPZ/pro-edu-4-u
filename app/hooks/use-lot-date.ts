import { getLotSchedule } from '@/app/_shared/domain/lot-schedule';
import { Lot } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

type UseLotDateProps = {
  auctionStartDate?: string;
  auctionEndDate?: string;
  position?: Lot['position'];
  lotsCount?: number;
};

export type TimeLeftType = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTime = (timeInMs: number): TimeLeftType => ({
  days: Math.max(0, Math.floor(timeInMs / (1000 * 60 * 60 * 24))),
  hours: Math.max(0, Math.floor((timeInMs / (1000 * 60 * 60)) % 24)),
  minutes: Math.max(0, Math.floor((timeInMs / 1000 / 60) % 60)),
  seconds: Math.max(0, Math.floor((timeInMs / 1000) % 60)),
});

/**
 * Countdown helpers for a lot. The actual schedule comes from the shared
 * domain module, so the client and the server agree on when a lot opens.
 */
export const useLotDate = (props: UseLotDateProps) => {
  const { auctionStartDate, auctionEndDate, position, lotsCount } = props;

  const calculateTimeLeft = useCallback(() => {
    if (!auctionStartDate || !auctionEndDate || !position || !lotsCount) {
      return {};
    }

    const now = Date.now();
    const { startsAt, endsAt } = getLotSchedule({ auctionStartDate, auctionEndDate, position, lotsCount });

    return {
      timeStartLeft: calculateTime(startsAt - now),
      timeEndLeft: calculateTime(endsAt - now),
      startDate: new Date(startsAt).toISOString(),
      endDate: new Date(endsAt).toISOString(),
    };
  }, [auctionEndDate, auctionStartDate, lotsCount, position]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return {
    timeStartLeft: timeLeft.timeStartLeft,
    timeEndLeft: timeLeft.timeEndLeft,
    startDate: timeLeft.startDate,
    endDate: timeLeft.endDate,
  };
};
