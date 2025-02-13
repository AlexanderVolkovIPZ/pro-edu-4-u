import { useEffect, useState } from 'react';
import { BidInfo } from '../_shared/types';

const FULL_PROGRESS_TIME = 15000;

export const useProgressTimer = (bids: BidInfo[]) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const latestBidTime = bids.at(0)?.createdAt ? +new Date(bids[0].createdAt) : 0;
    const timeDifference = currentTime - latestBidTime;
    const progress = Math.ceil(((timeDifference % FULL_PROGRESS_TIME) * 100) / FULL_PROGRESS_TIME);
    setProgressValue(progress);
  }, [bids, currentTime]);

  return { progressValue };
};
