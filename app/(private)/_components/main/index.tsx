'use client';

import { useQueryParams } from '@/app/hooks/use-query-params';
import { useAuctionsByFilter } from '@/app/queries/auction';
import { AuctionWithRelationsType } from '@/app/types';
import Container from '@/components/container';
import EmptyPage from '@/components/empty-page';
import Pagination from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Annoyed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuctionCard from './auction-card';
import Header from './header';

const PAGE_ITEMS_LIMIT = 8;

const Main = () => {
  const router = useRouter();
  const { params, setParams } = useQueryParams({
    isPublished: true,
    page: 1,
    limit: PAGE_ITEMS_LIMIT,
  });
  const { data: { auctions = [], total, totalPages } = {}, isFetched } = useAuctionsByFilter<AuctionWithRelationsType>({
    filters: {
      isPublished: params.isPublished,
      page: params.page,
      limit: params.limit,
    },
    options: {
      staleTime: 1000 * 60 * 3,
    },
  });

  const handlePageChange = (newPage: number) => {
    setParams({ ...params, page: newPage });
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
            currentPage={params.page}
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
