'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { SocketContext } from '@/app/providers/socket-provider';
import { useUpdateBid } from '@/app/queries/bid';
import { useUpdateLot } from '@/app/queries/lot';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BidType, Status } from '@prisma/client';
import { Bolt, Gavel } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LotStatus } from '../_shared/types';
import { useBidState } from './_hooks/use-bid-state';
import { useProgressTimer } from './_hooks/use-progress-timer';
import { IS_AUTO_BID } from './_shared/constants';
import { BidInfo } from './_shared/types';
import BidHistory from './bid-history';
import { BidIncrementSlider } from './bid-increment-slider';
import { BidInput } from './bid-input';
import ConnectionLabel from './connection-label';
import CountdownTimer from './countdown-timer';
import { StatusBadge } from './status-badge';

const PROGRESS_VALUE_MAX = 100;

type BidProcessInfoProps = {
  lotId: string;
  startBid: number;
  auctionId: string;
  lotTimeLeft: number;
  initialBids?: BidInfo[];
  minBidIncrement: number;
  status: LotStatus;
};

const BidProcessInfo = ({
  initialBids = [],
  lotTimeLeft,
  lotId,
  minBidIncrement,
  status: defaultStatus,
  auctionId,
  startBid,
}: BidProcessInfoProps) => {
  const { socket, isConnected: isSocketConnected } = useContext(SocketContext);
  const authUser = useContext(AuthUserContext);

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

  const { mutateAsync: updateBid } = useUpdateBid(auctionId, lotId, undefined);
  const { mutateAsync: updateLot } = useUpdateLot(auctionId, lotId);

  const { t } = useTranslation();

  const [status, setStatus] = useState(defaultStatus);
  const [inputValue, setInputValue] = useState(calculateNextBid());

  const isLotInProgress = status === Status.IN_PROGRESS;
  const isLotUpcoming = status === Status.UPCOMING;

  const bidToSend = Math.max(inputValue, calculateNextBid());
  const isLastBidByMe = bids.at(0)?.bidderId === authUser?.id;

  const bidTimeout = useRef<NodeJS.Timeout | null>(null);

  const isUserConnected = socket && isSocketConnected;

  useEffect(() => {
    if (progressValue >= PROGRESS_VALUE_MAX && bids.length) {
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

      setStatus(Status.COMPLETED);
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
          bidderName: newBid.user.name || t('bid_process.anonymous'),
          bidderId: newBid.user.id,
          createdAt: new Date(newBid.createdAt).toISOString(),
          type: BidType.BIDDING,
          isWinner: newBid.isWinner,
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

    if (bidTimeout.current) {
      clearTimeout(bidTimeout.current);
    }

    return () => {
      socket.off('bidCreated');
    };
  }, [authUser?.id, bidIncrement, isAutoBid, lotId, setBids, setCurrentBid, setIsBidSent, socket, t]);

  const onBid = () => {
    if (!isUserConnected) {
      toast.error(t('toast.error.you_are_not_connected_to_the_server'));
      return;
    }

    if (currentBid && bidToSend <= currentBid) {
      toast.error(t('toast.error.the_bid_must_be_higher_than_the_current_bid'));
      return;
    }

    socket.emit('newBid', {
      lotId,
      amount: bidToSend,
      userId: authUser?.id || '',
    });

    setIsBidSent(true);
  };

  const onMakeBidIfPossible = () => {
    if (!isLastBidByMe && !isBidSent && isLotInProgress) {
      onBid();
      return true;
    }
    return false;
  };

  const onToggleAutoBid = () => {
    setIsAutoBid((prev) => {
      const newAutoBidState = !prev;

      if (!newAutoBidState) {
        localStorage.removeItem(IS_AUTO_BID);

        return false;
      }

      localStorage.setItem(IS_AUTO_BID, 'true');

      if (!isLastBidByMe && isLotInProgress) {
        onMakeBidIfPossible();
      }

      return true;
    });
  };

  return (
    <div className='space-y-3'>
      {!isUserConnected && <ConnectionLabel />}

      <StatusBadge status={status} />

      {isLotInProgress && (
        <>
          <CountdownTimer lotTimeLeft={lotTimeLeft} progress={progressValue} />
          <div className='space-y-4'>
            <h2 className='text-2xl font-extrabold text-center text-rose-500 tracking-tight'>
              {t('bid_process.place_your_winning_bid')}
            </h2>

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
                label={t('bid_process.bid_increment')}
                minBidIncrement={minBidIncrement}
                maxBidIncrement={minBidIncrement * 5}
                bidIncrement={bidIncrement}
                setBidIncrement={setBidIncrement}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Button
                variant='outline'
                className={cn(
                  'w-full relative uppercase font-bold py-4 transition-all duration-200',
                  isAutoBid
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'opacity-85 hover:opacity-100 hover:border-amber-200'
                )}
                onClick={onToggleAutoBid}
                disabled={isBidSent}
              >
                <Bolt className={cn('h-5 w-5 mr-2', isAutoBid ? 'text-amber-500' : 'text-slate-400')} />
                {t('bid_process.auto_bid')}
                {isBidSent && isAutoBid && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Spinner color='text-amber-500' />
                  </div>
                )}
              </Button>

              <Button
                variant='default'
                className='w-full relative uppercase font-bold py-4 bg-green-600 hover:bg-green-500 shadow-md hover:shadow-lg transition-all duration-200'
                onClick={onBid}
                disabled={!isLotInProgress || isBidSent || isLastBidByMe || isAutoBid}
              >
                <Gavel className='h-5 w-5 mr-2' />
                {t('bid_process.bid')} ${bidToSend}
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

      {!isLotUpcoming && <BidHistory bids={bids.filter((bid) => bid.type !== BidType.INSTANT)} />}
    </div>
  );
};

export default BidProcessInfo;
