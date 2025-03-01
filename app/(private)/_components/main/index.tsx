'use client';

import { useAuctionsByFilter } from '@/app/queries/auction';
import Container from '@/components/container';
import { Skeleton } from '@/components/ui/skeleton';
import AuctionCard from './auction-card';
import Header from './header';
import { AuctionWithRelationsType } from '@/app/types';

const Main = () => {
  const { data: { auctions = [] } = {}, isFetched } = useAuctionsByFilter<AuctionWithRelationsType>({
    filters: {
      isPublished: true,
    },
  });

  return (
    <Container>
      <Header />
      <main className='flex flex-wrap gap-3 lg:gap-4 mt-2'>
        {isFetched ? (
          auctions.map((auction) => <AuctionCard auction={auction} key={auction.id} />)
        ) : (
          <>
            {[...Array(8)].map((_, index) => (
              <Skeleton className='h-96 w-60' key={index} />
            ))}
          </>
        )}
      </main>
    </Container>
  );
};

export default Main;
