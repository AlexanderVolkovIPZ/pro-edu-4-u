'use client';

import { useCallback, useEffect, useState } from 'react';
import { Status } from '@prisma/client';

type CountdownTimerProps = {
  targetDate: string;
  status: Status;
};

type TimeLeftType = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

const CountdownTimer = ({ targetDate, status }: CountdownTimerProps) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeftType>(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!(interval in timeLeft)) return;
    const key = interval as keyof TimeLeftType;

    timerComponents.push(
      <span key={interval} className='inline-flex flex-col items-center mx-1'>
        <span className='text-xl font-bold rounded-sm text-slate-700'>
          {timeLeft[key]?.toString().padStart(2, '0')}
        </span>
        <span className='text-[8px] text-slate-500 uppercase'>{interval}</span>
      </span>
    );
  });

  const getAuctionLabel = () => {
    if (status === Status.COMPLETED) return <span className='text-green-600 font-bold'>Auction is completed</span>;
    if (status === Status.IN_PROGRESS) return <span className='text-green-600 font-bold'>Auction is started</span>;

    return timerComponents;
  };

  return <div className='flex justify-center items-center gap-x-1'>{getAuctionLabel()}</div>;
};

export default CountdownTimer;
