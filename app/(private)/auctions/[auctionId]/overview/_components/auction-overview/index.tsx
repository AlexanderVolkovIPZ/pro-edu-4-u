'use client';

import { useAuction } from '@/app/queries/auction';
import { AuctionWithRelationsType } from '@/app/types';
import Container from '@/components/container';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import AuctionDetails from './auction-details';
import Header from './header';
import LotsList from './lot-list';

type AuctionOverviewProps = {
  auctionId: string;
};

const AuctionOverview = ({ auctionId }: AuctionOverviewProps) => {
  const { data: auction, isFetched: isAuctionFetched } = useAuction<AuctionWithRelationsType>(auctionId);

  if (isAuctionFetched && !auction) {
    return (
      <Container>
        <NotFound />
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <main className='mt-2'>
        {isAuctionFetched ? (
          <>
            <AuctionDetails auction={auction} />
            <LotsList auction={auction} />
          </>
        ) : (
          <div className='flex flex-col gap-y-4 overflow-hidden'>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className='h-40' key={index} />
            ))}
          </div>
        )}
      </main>
    </Container>
  );
};

export default AuctionOverview;
