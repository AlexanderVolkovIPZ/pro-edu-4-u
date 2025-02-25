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

const ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS = 60 * 1000;

const calculateTime = (timeInMs: number): TimeLeftType => ({
  days: Math.max(0, Math.floor(timeInMs / (1000 * 60 * 60 * 24))),
  hours: Math.max(0, Math.floor((timeInMs / (1000 * 60 * 60)) % 24)),
  minutes: Math.max(0, Math.floor((timeInMs / 1000 / 60) % 60)),
  seconds: Math.max(0, Math.floor((timeInMs / 1000) % 60)),
});

export const useLotDate = (props: UseLotDateProps) => {
  const { auctionStartDate, auctionEndDate, position, lotsCount } = props;

  const calculateTimeLeft = useCallback(() => {
    if (!auctionStartDate || !auctionEndDate || !position || !lotsCount) {
      return {};
    }

    const now = +new Date();
    const startTimestamp = +new Date(auctionStartDate);
    const endTimestamp = +new Date(auctionEndDate);
    const auctionPeriodWithoutBufferTime =
      endTimestamp - startTimestamp - ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS * (lotsCount - 1);
    const oneLotPeriod = Math.floor(auctionPeriodWithoutBufferTime / lotsCount);

    const lotDateStart = startTimestamp - now + (position - 1) * (oneLotPeriod + ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS);
    const lotDateEnd = lotDateStart + oneLotPeriod;

    return {
      timeStartLeft: calculateTime(lotDateStart),
      timeEndLeft: calculateTime(lotDateEnd),
      startDate: new Date(
        startTimestamp + (ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS + oneLotPeriod) * (position - 1)
      ).toISOString(),
      endDate: new Date(
        startTimestamp + (ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS + oneLotPeriod) * (position - 1) + oneLotPeriod
      ).toISOString(),
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
