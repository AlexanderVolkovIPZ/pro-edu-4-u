'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { SocketContext } from '@/app/providers/socket-provider';
import { useUpdateBid } from '@/app/queries/bid';
import { useUpdateLot } from '@/app/queries/lot';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LotStatus } from '../_shared/types';
import { useBidState } from './_hooks/use-bid-state';
import { useProgressTimer } from './_hooks/use-progress-timer';
import { IS_AUTO_BID } from './_shared/constants';
import { BidInfo } from './_shared/types';
import BidHistory from './bid-history';
import { BidIncrementSlider } from './bid-increment-slider';
import { BidInput } from './bid-input';
import CountdownTimer from './countdown-timer';
import { StatusBadge } from './status-badge';

interface BidProcessInfoProps {
  lotId: string;
  startBid: number;
  auctionId: string;
  lotTimeLeft: number;
  initialBids?: BidInfo[];
  minBidIncrement: number;
  status: LotStatus;
}

const BidProcessInfo = ({
  initialBids = [],
  lotTimeLeft,
  lotId,
  minBidIncrement,
  status: defaultStatus,
  auctionId,
  startBid,
}: BidProcessInfoProps) => {
  const authUser = useContext(AuthUserContext);
  const { socket, isConnected: isSocketConnected } = useContext(SocketContext);

  const { mutateAsync: updateBid } = useUpdateBid(auctionId, lotId, undefined);
  const { mutateAsync: updateLot } = useUpdateLot(auctionId, lotId);

  const {
    bids,
    setBids,
    currentBid,
    setCurrentBid,
    isBidSent,
    setIsBidSent,
    isAutoBid,
    setIsAutoBid,
    setBidIncrement,
    bidIncrement,
    calculateNextBid,
  } = useBidState(initialBids, startBid, minBidIncrement);
  const { progressValue } = useProgressTimer(bids);

  const [status, setStatus] = useState(defaultStatus);
  const [inputValue, setInputValue] = useState(calculateNextBid());
  const isLotInProgress = status === 'IN_PROGRESS';
  const isLotUpcoming = status === 'UPCOMING';

  const bidToSend = Math.max(inputValue, calculateNextBid());

  const isLastBidByMe = bids.at(0)?.bidderId === authUser?.id;

  useEffect(() => {
    if (progressValue >= 100 && bids.length) {
      const maxBidId = bids.at(0)?.id;
      if (!maxBidId) {
        return;
      }

      (async () => {
        await updateLot({ isSold: true });
      })();

      (async () => {
        updateBid({
          payloadBidId: maxBidId,
          data: { isWinner: true },
        });
      })();

      setStatus('COMPLETED');
    }
  }, [bids, progressValue, updateBid, updateLot]);

  useEffect(() => {
    if (!socket) return;

    socket.on('bidCreated', (newBid) => {
      const isCurrentUser = newBid.user.id === authUser?.id;

      setBids((prevBids) => [
        {
          id: newBid.id,
          amount: newBid.amount,
          bidderName: newBid.user.name || 'Anonymous',
          bidderId: newBid.user.id,
          createdAt: new Date(newBid.createdAt).toISOString(),
        },
        ...prevBids,
      ]);

      setCurrentBid(newBid.amount);
      setIsBidSent(false);

      if (!isCurrentUser && isAutoBid) {
        setIsBidSent(true);
        const nextBid = newBid.amount + bidIncrement;
        socket.emit('newBid', {
          lotId,
          amount: nextBid,
          userId: authUser?.id || '',
        });
      }
    });

    return () => {
      socket.off('bidCreated');
    };
  }, [authUser?.id, bidIncrement, isAutoBid, lotId, setBids, setCurrentBid, setIsBidSent, socket]);

  const onBid = () => {
    if (!socket) {
      toast.error('You are not connected to the server.');
      return;
    }

    if (currentBid && bidToSend <= currentBid) {
      toast.error('Your bid must be higher than the current bid.');
      return;
    }

    if (!isSocketConnected) {
      toast.error('You are not connected to the server.');
      return;
    }

    socket.emit('newBid', {
      lotId,
      amount: bidToSend,
      userId: authUser?.id || '',
    });

    setIsBidSent(true);
  };

  return (
    <div className='space-y-3'>
      <StatusBadge status={status} />
      {isLotInProgress && (
        <>
          <CountdownTimer lotTimeLeft={lotTimeLeft} progress={progressValue} />
          <div className='space-y-4'>
            <h2 className='text-2xl font-extrabold text-center text-rose-500 tracking-tight'>Place Your Winning Bid</h2>

            <div className='space-y-4'>
              <BidInput
                value={inputValue}
                onChange={(e) => {
                  const value = +e.target.value;
                  if (!Number.isNaN(value)) setInputValue(value);
                }}
                onIncrease={() => setInputValue((prev) => prev + 1)}
                onDecrease={() => setInputValue((prev) => prev - 1)}
                min={calculateNextBid()}
              />

              <BidIncrementSlider
                minBidIncrement={minBidIncrement}
                maxBidIncrement={minBidIncrement * 5}
                bidIncrement={bidIncrement}
                setBidIncrement={setBidIncrement}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Button
                variant='outline'
                className={cn('w-full relative', !isAutoBid && 'opacity-30')}
                onClick={() =>
                  setIsAutoBid((prev) => {
                    if (prev) {
                      localStorage.removeItem(IS_AUTO_BID);
                      return false;
                    }

                    localStorage.setItem(IS_AUTO_BID, 'true');
                    return true;
                  })
                }
                disabled={isBidSent}
              >
                AUTO BID
                {isBidSent && isAutoBid && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Spinner color='text-red-500' />
                  </div>
                )}
              </Button>

              <Button
                variant='default'
                className='w-full relative bg-green-600 hover:bg-green-500'
                onClick={onBid}
                // disabled={status !== 'IN_PROGRESS' || isBidSent || isAutoBid}
                disabled={status !== 'IN_PROGRESS' || isBidSent || isLastBidByMe || isAutoBid}
              >
                BID ${bidToSend}
                {isBidSent && !isAutoBid && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Spinner />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      {!isLotUpcoming && <BidHistory bids={bids} />}
    </div>
  );
};

export default BidProcessInfo;
