'use client';

import { useState, useEffect, useCallback } from 'react';

type CountdownTimerProps = {
  targetDate: Date;
};

type TimeLeftType = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
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
          {timeLeft[key]?.toString().length === 1 ? `0${timeLeft[key]}` : timeLeft[key]}
        </span>
        <span className='text-[8px] text-slate-500 uppercase'>{interval}</span>
      </span>
    );
  });

  return (
    <div className='flex justify-center items-center gap-x-1'>
      {timerComponents.length ? timerComponents : <span className='text-green-600 font-bold'>Auction has started</span>}
    </div>
  );
};

export default CountdownTimer;
