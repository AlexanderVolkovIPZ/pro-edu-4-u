'use client';

import { BidCreatedPayload } from '@/app/_shared/socket/events';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useFinalizeLot } from '@/app/queries/lot';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BidType, Status } from '@prisma/client';
import { Bolt, Gavel } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LotStatus } from '../_shared/types';
import { useAutoBid } from './_hooks/use-auto-bid';
import { useBidState } from './_hooks/use-bid-state';
import { useLotBiddingSocket } from './_hooks/use-lot-bidding-socket';
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
const FINALIZE_RETRY_DELAY_MS = 1000;
const MAX_FINALIZE_ATTEMPTS = 5;

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
  const authUser = useContext(AuthUserContext);
  const { t } = useTranslation();

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
  const { mutateAsync: finalizeLot } = useFinalizeLot(auctionId, lotId);

  const [status, setStatus] = useState(defaultStatus);
  const [inputValue, setInputValue] = useState(calculateNextBid());

  const isLotInProgress = status === Status.IN_PROGRESS;
  const isLotUpcoming = status === Status.UPCOMING;

  const bidToSend = Math.max(inputValue, calculateNextBid());
  const isLastBidByMe = bids.at(0)?.bidderId === authUser?.id;

  const toBidInfo = useCallback(
    (bid: BidCreatedPayload): BidInfo => ({
      id: bid.id,
      amount: bid.amount,
      bidderName: bid.user.name || t('bid_process.anonymous'),
      bidderId: bid.user.id,
      createdAt: new Date(bid.createdAt).toISOString(),
      type: BidType.BIDDING,
      isWinner: bid.isWinner,
    }),
    [t]
  );

  const markWinner = useCallback(
    (winnerBidId: string) => {
      setStatus(Status.COMPLETED);
      setBids((prevBids) => prevBids.map((bid) => (bid.id === winnerBidId ? { ...bid, isWinner: true } : bid)));
    },
    [setBids]
  );

  const { placeBid, isConnected } = useLotBiddingSocket(
    { auctionId, lotId },
    {
      onBidCreated: (newBid) => {
        setBids((prevBids) => [toBidInfo(newBid), ...prevBids]);
        setCurrentBid(newBid.amount);
        setIsBidSent(false);
      },
      onBidRejected: ({ code }) => {
        setIsBidSent(false);
        toast.error(t(`toast.error.bid_rejected.${code}`, { defaultValue: t('toast.error.something_went_wrong') }));
      },
      onLotFinalized: ({ winnerBidId }) => markWinner(winnerBidId),
    }
  );

  const sendBid = useCallback(
    (amount: number): boolean => {
      if (!placeBid(amount)) {
        toast.error(<span data-testid='bid-error'>{t('toast.error.you_are_not_connected_to_the_server')}</span>);
        return false;
      }

      setIsBidSent(true);
      return true;
    },
    [placeBid, setIsBidSent, t]
  );

  useAutoBid({
    enabled: isAutoBid,
    bids,
    myUserId: authUser?.id,
    isLotInProgress,
    nextBidAmount: currentBid ? currentBid + bidIncrement : startBid,
    placeBid: sendBid,
  });

  // When the bidding goes silent (or the time slot ends) the client asks the
  // server to close the lot. The server validates the request and decides the
  // winner; it also closes lots on its own, so this is only a nudge. It also
  // covers lots whose slot ended while no server was around to close them.
  // Requests are throttled: at most one per top bid, retried after a delay.
  const finalizeRequestedFor = useRef<string | null>(null);
  const nextFinalizeAttemptAt = useRef(0);
  const finalizeAttempts = useRef(0);
  useEffect(() => {
    const topBid = bids.at(0);
    if (!topBid) return;

    const needsFinalization = isLotInProgress
      ? progressValue >= PROGRESS_VALUE_MAX || lotTimeLeft <= 0
      : status === Status.COMPLETED && !topBid.isWinner;

    if (
      !needsFinalization ||
      finalizeRequestedFor.current === topBid.id ||
      Date.now() < nextFinalizeAttemptAt.current ||
      finalizeAttempts.current >= MAX_FINALIZE_ATTEMPTS
    ) {
      return;
    }

    finalizeRequestedFor.current = topBid.id;
    finalizeAttempts.current += 1;

    finalizeLot().then(
      () => markWinner(topBid.id),
      () => {
        // Not due yet according to the server (e.g. a newer bid arrived); retry after a pause.
        finalizeRequestedFor.current = null;
        nextFinalizeAttemptAt.current = Date.now() + FINALIZE_RETRY_DELAY_MS;
      }
    );
  }, [bids, finalizeLot, isLotInProgress, lotTimeLeft, markWinner, progressValue, status]);

  const onBid = () => {
    if (currentBid && bidToSend <= currentBid) {
      toast.error(<span data-testid='bid-error'>{t('toast.error.the_bid_must_be_higher_than_the_current_bid')}</span>);
      return;
    }

    sendBid(bidToSend);
  };

  const onToggleAutoBid = () => {
    const next = !isAutoBid;
    if (next) {
      localStorage.setItem(IS_AUTO_BID, 'true');
      // Enabling auto-bid immediately takes the lead if somebody else holds it.
      if (!isLastBidByMe && !isBidSent && isLotInProgress) {
        sendBid(bidToSend);
      }
    } else {
      localStorage.removeItem(IS_AUTO_BID);
    }

    setIsAutoBid(next);
  };

  return (
    <div className='space-y-3'>
      {!isConnected && <ConnectionLabel />}

      <StatusBadge status={status} />

      {isLotInProgress && (
        <>
          <CountdownTimer lotTimeLeft={lotTimeLeft} progress={progressValue} />
          <div className='space-y-4'>
            <h2 className='text-2xl font-extrabold text-center text-rose-500 tracking-tight'>
              {t('bid_process.place_your_winning_bid')}
            </h2>

            <div className='space-y-4'>
              {isAutoBid ? (
                <BidIncrementSlider
                  label={t('bid_process.bid_increment')}
                  minBidIncrement={minBidIncrement}
                  maxBidIncrement={minBidIncrement * 5}
                  bidIncrement={bidIncrement}
                  setBidIncrement={setBidIncrement}
                />
              ) : (
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
              )}
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
                data-testid='bid-submit'
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

      {!isLotUpcoming && bids.length > 0 && (
        <BidHistory
          isCompleted={status === Status.COMPLETED}
          bids={bids.filter((bid) => bid.type !== BidType.INSTANT)}
        />
      )}
    </div>
  );
};

export default BidProcessInfo;
