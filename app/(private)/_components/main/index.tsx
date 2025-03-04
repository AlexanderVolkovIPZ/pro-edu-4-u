'use client';

import { useAuctionsByFilter } from '@/app/queries/auction';
import { AuctionWithRelationsType } from '@/app/types';
import Container from '@/components/container';
import EmptyPage from '@/components/empty-page';
import Pagination from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Annoyed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuctionCard from './auction-card';
import Header from './header';

const PAGE_ITEMS_LIMIT = 8;

const Main = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: { auctions = [], total, totalPages } = {}, isFetched } = useAuctionsByFilter<AuctionWithRelationsType>({
    filters: {
      isPublished: true,
      page: currentPage,
      limit: PAGE_ITEMS_LIMIT,
    },
    options: {
      staleTime: 1000 * 60 * 3,
    },
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isFetched && !auctions.length) {
    return (
      <Container>
        <EmptyPage
          icon={Annoyed}
          title='Auctions not found'
          description='Looks like it hasn’t been created auctions yet.'
          buttonTitle='Create first auction'
          onClick={() => router.push('/auctions/create')}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <main className='mt-2 flex flex-col'>
        <div className='flex flex-wrap gap-3 lg:gap-4 flex-grow'>
          {isFetched ? (
            auctions.map((auction) => <AuctionCard auction={auction} key={auction.id} />)
          ) : (
            <>
              {Array.from({ length: PAGE_ITEMS_LIMIT }).map((_, index) => (
                <Skeleton className='h-96 w-60' key={index} />
              ))}
            </>
          )}
        </div>

        {isFetched && (
          <Pagination
            className='mt-4'
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
            showSummary={false}
            itemsPerPage={PAGE_ITEMS_LIMIT}
            totalItems={total || 0}
          />
        )}
      </main>
    </Container>
  );
};

export default Main;
