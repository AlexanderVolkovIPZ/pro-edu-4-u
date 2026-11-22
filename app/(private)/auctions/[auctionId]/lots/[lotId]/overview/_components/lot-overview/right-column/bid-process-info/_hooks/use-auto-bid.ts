import { useEffect, useRef } from 'react';
import { BidInfo } from '../_shared/types';

type UseAutoBidProps = {
  enabled: boolean;
  bids: BidInfo[];
  myUserId?: string;
  isLotInProgress: boolean;
  /** Amount to place when the user is outbid. */
  nextBidAmount: number;
  /** Returns `false` when the bid could not be sent (e.g. socket not connected). */
  placeBid: (amount: number) => boolean;
};

const topBidKey = (bids: BidInfo[]) => bids.at(0)?.id ?? 'no-bids';

/**
 * Auto-bid: whenever somebody else *outbids* the user, place the next bid.
 * Only bids that arrive after auto-bid was enabled count (enabling it or
 * opening the page never bids by itself), and each incoming bid is answered
 * at most once, so a rejected auto-bid never turns into a retry loop.
 */
export function useAutoBid({ enabled, bids, myUserId, isLotInProgress, nextBidAmount, placeBid }: UseAutoBidProps) {
  const handledTopBidKey = useRef<string | null>(null);
  const wasEnabled = useRef(false);

  useEffect(() => {
    if (!enabled) {
      wasEnabled.current = false;
      handledTopBidKey.current = null;
      return;
    }

    const key = topBidKey(bids);

    if (!wasEnabled.current) {
      // Just enabled (or mounted with auto-bid on): the current top bid is the baseline.
      wasEnabled.current = true;
      handledTopBidKey.current = key;
      return;
    }

    const topBid = bids.at(0);
    if (!isLotInProgress || topBid?.bidderId === myUserId || handledTopBidKey.current === key) return;

    // Mark as handled only when the bid actually left, so a disconnected socket can retry.
    if (placeBid(nextBidAmount)) {
      handledTopBidKey.current = key;
    }
  }, [enabled, bids, myUserId, isLotInProgress, nextBidAmount, placeBid]);
}
