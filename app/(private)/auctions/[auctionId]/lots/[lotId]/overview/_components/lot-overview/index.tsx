'use client';

import { LOT_STATUSES } from '@/app/constants';
import { useLotDate } from '@/app/hooks/use-lot-date';
import { useAuction } from '@/app/queries/auction';
import { AuctionWithRelationsType } from '@/app/types';
import Container from '@/components/container';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';
import Header from './header';
import LeftColumn from './left-column';
import RightColumn from './right-column';

type LotOverviewProps = {
  auctionId: string;
  lotId: string;
};

const LotOverview = ({ auctionId, lotId }: LotOverviewProps) => {
  const { data: auctionData, isFetched: isAuctionFetched } = useAuction<AuctionWithRelationsType>(auctionId);
  const lotData = auctionData?.lot.find((lot) => lot.id === lotId);

  const { startDate, endDate, timeStartLeft } = useLotDate({
    auctionStartDate: auctionData?.startDate,
    auctionEndDate: auctionData?.endDate,
    position: lotData?.position,
    lotsCount: auctionData?.lot.length,
  });

  const isLotDateInfoLoaded = startDate && endDate && timeStartLeft;

  const currentDate = new Date();
  const isLotTimeStarted = dayjs(startDate).isBefore(currentDate);
  const isLotTimeFinished = dayjs(currentDate).isAfter(endDate);
  const timeLotLeft = dayjs(endDate).isAfter(currentDate) ? dayjs(endDate).diff(currentDate, 'seconds') : 0;

  const isLotBidProcessInProgress = isLotTimeStarted && !isLotTimeFinished && !lotData?.isSold;
  const isLotBidProcessIsFinished = isLotTimeStarted && (isLotTimeFinished || !!lotData?.isSold);

  const status = isLotBidProcessInProgress
    ? LOT_STATUSES.IN_PROGRESS
    : isLotBidProcessIsFinished
      ? LOT_STATUSES.COMPLETED
      : LOT_STATUSES.UPCOMING;

  if (isAuctionFetched && !lotData) {
    return (
      <Container>
        <NotFound />
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <main className='mt-2 grid lg:grid-cols-2 gap-4'>
        {isAuctionFetched && lotData && isLotDateInfoLoaded ? (
          <>
            <LeftColumn
              auctionId={auctionId}
              lotId={lotId}
              startDate={startDate}
              endDate={endDate}
              timeStartLeft={timeStartLeft}
            />

            <RightColumn
              lotInfo={{
                id: lotData.id,
                auctionId,
                startBid: lotData.startBid,
                buyNowBid: lotData.buyNowBid,
                minBidIncrement: lotData.minBidIncrement,
                description: lotData.description,
                categories: lotData.lotCategory,
                details: lotData.lotDetail,
                timeLotLeft: timeLotLeft,
                bids: lotData.bid,
                isSold: lotData.isSold,
                status,
                title: lotData.title,
              }}
            />
          </>
        ) : (
          <>
            <div className='space-y-4'>
              <Skeleton className='h-[286px]' />
              <Skeleton className='h-40' />
            </div>
            <Skeleton className='h-full min-h-96' />
          </>
        )}
      </main>
    </Container>
  );
};

export default LotOverview;
