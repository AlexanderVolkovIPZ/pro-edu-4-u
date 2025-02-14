import { useCallback, useState } from 'react';
import { BidInfo } from '../_shared/types';
import { BID_INCREMENT_STORAGE_KEY, IS_AUTO_BID } from '../_shared/constants';

export const useBidState = (initialBids: BidInfo[], startBid: number, minBidIncrement: number) => {
  const [bids, setBids] = useState<BidInfo[]>(initialBids);
  const [currentBid, setCurrentBid] = useState(bids.at(0)?.amount);
  const [isBidSent, setIsBidSent] = useState(false);

  const [isAutoBid, setIsAutoBid] = useState(!!localStorage.getItem(IS_AUTO_BID));

  const storedIncrement = localStorage.getItem(BID_INCREMENT_STORAGE_KEY);
  const isNumber = storedIncrement && Number.isInteger(+storedIncrement);
  const isValidStoredIncrement = isNumber && +storedIncrement >= minBidIncrement;
  const initialBidIncrement = isValidStoredIncrement ? +storedIncrement : minBidIncrement;

  const [bidIncrement, setBidIncrement] = useState(initialBidIncrement);

  const calculateNextBid = useCallback(() => {
    if (!currentBid) return startBid;
    return currentBid + bidIncrement;
  }, [bidIncrement, currentBid, startBid]);

  return {
    bids,
    setBids,
    currentBid,
    setCurrentBid,
    isBidSent,
    setIsBidSent,
    isAutoBid,
    setIsAutoBid,
    bidIncrement,
    setBidIncrement,
    calculateNextBid,
  };
};
