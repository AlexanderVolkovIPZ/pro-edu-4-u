import { Lot } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

type UseLotDateProps = {
  auctionStartDate: string;
  auctionEndDate: string;
  position: Lot['position'];
  lotsCount: number;
};

export type TimeLeftType = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS = 60 * 1000;

export const useLotDate = ({ auctionStartDate, auctionEndDate, position, lotsCount }: UseLotDateProps) => {
  const auctionPeriodWithoutBufferTime =
    +new Date(auctionEndDate) - +new Date(auctionStartDate) - ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS * (lotsCount - 1);
  const oneLotPeriod = Math.floor(auctionPeriodWithoutBufferTime / lotsCount);

  const calculateTimeLeft = useCallback(() => {
    if (!auctionStartDate || !auctionEndDate || position <= 0 || lotsCount <= 0) {
      return {
        timeStartLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        timeEndLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        startDate: '',
        endDate: '',
      };
    }

    const now = +new Date();
    const auctionDateStart = +new Date(auctionStartDate) - now;
    const lotDateStart = auctionDateStart + (position - 1) * (oneLotPeriod + ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS);
    const lotDateEnd = lotDateStart + oneLotPeriod;

    const timeStartLeft: TimeLeftType = {
      days: Math.max(0, Math.floor(lotDateStart / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((lotDateStart / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((lotDateStart / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((lotDateStart / 1000) % 60)),
    };

    const timeEndLeft: TimeLeftType = {
      days: Math.max(0, Math.floor(lotDateEnd / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((lotDateEnd / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((lotDateEnd / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((lotDateEnd / 1000) % 60)),
    };

    const startDate = new Date(
      +new Date(auctionStartDate) + (ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS + oneLotPeriod) * (position - 1)
    ).toISOString();

    const endDate = new Date(
      +new Date(auctionStartDate) + (ONE_MINUTE_BUFFER_TIME_BETWEEN_LOTS + oneLotPeriod) * (position - 1) + oneLotPeriod
    ).toISOString();

    return {
      timeStartLeft,
      timeEndLeft,
      startDate,
      endDate,
    };
  }, [auctionEndDate, auctionStartDate, lotsCount, oneLotPeriod, position]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

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
