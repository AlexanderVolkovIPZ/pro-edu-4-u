'use client';

import Footer from '@/app/(private)/_shared/components/table/footer';
import { useQueryParams } from '@/app/hooks/use-query-params';
import { useAuctionsByFilter } from '@/app/queries/auction';
import { AuctionWithRelationsType, LotWithRelationsType } from '@/app/types';
import { getAuctionStatus } from '@/app/utils/get-auction-status';
import { CardContent } from '@/components/ui/card';
import { Table as TableComponent } from '@/components/ui/table';
import { Annoyed, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EmptyPage from '../../../../../components/empty-page';
import { useSortAuctions } from '../_hooks/use-sort-auctions';
import Body from './body';
import Header from './header';

const ASC = 'asc';
const DESC = 'desc';

export type ExtendedAuction = Omit<AuctionWithRelationsType, 'lot'> & {
  lot: (LotWithRelationsType & {
    _count: {
      bid: number;
    };
  })[];
};

const Table = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { params, setParams } = useQueryParams({
    page: 1,
    limit: 5,
  });
  const { data: { auctions = [], total = 0, totalPages = 0, limit = 0 } = {}, isFetching } =
    useAuctionsByFilter<ExtendedAuction>({
      filters: {
        page: params.page,
        limit: params.limit,
        loadForCurrentUser: true,
      },
      options: {
        staleTime: 1000 * 60 * 3,
      },
    });

  const auctionsToDisplay =
    auctions
      ?.map((auction) => ({
        id: auction.id,
        title: auction.title,
        isPublished: auction.isPublished,
        status: getAuctionStatus({
          startDate: auction.startDate,
          endDate: auction.endDate,
          isAllLotsSold: auction.lot.every(({ isSold }) => isSold),
        }),
        startDate: auction.startDate,
        endDate: auction.endDate,
        createdAt: auction.createdAt,
        lotCount: auction.lot.length,
        bidCount: auction.lot.reduce((acc, { _count }) => acc + _count.bid, 0),
        isApproved: auction.isApproved,
      }))
      .sort((a, b) => Number(b.isApproved) - Number(a.isApproved)) || [];

  const { setSortBy, setSortDirection, sortedAuctions, sortBy, sortDirection } = useSortAuctions({
    auctions: auctionsToDisplay,
  });

  const onSort = (column: keyof typeof sortDirection) => {
    if (sortBy.includes(column)) {
      setSortDirection((prevDirection) => ({
        ...prevDirection,
        [column]: prevDirection[column] === ASC ? DESC : ASC,
      }));

      setSortBy((prevSortBy) => prevSortBy.filter((item) => item !== column).concat(column));
    } else {
      setSortBy((prevSortBy) => [...prevSortBy, column]);
      setSortDirection((prevDirection) => ({ ...prevDirection, [column]: ASC }));
    }
  };

  const renderSortIcon = (column: keyof typeof sortDirection) => {
    if (!sortBy.includes(column)) return <ChevronDown className='ml-1 h-4 w-4 text-gray-400' />;

    return sortDirection[column] === ASC ? (
      <ChevronUp className='ml-1 h-4 w-4 text-indigo-600' />
    ) : (
      <ChevronDown className='ml-1 h-4 w-4 text-indigo-600' />
    );
  };

  if (!isFetching && !auctions.length)
    return (
      <EmptyPage
        icon={Annoyed}
        title={t('common.your_table_is_empty')}
        description={`${t('all_auctions.looks_like_you_have_nor_created_any_auction_yet')}.`}
        buttonTitle={t('all_auctions.go_to_auction_create_page')}
        onClick={() => router.push('/auctions/create')}
      />
    );

  return (
    <CardContent className='p-0 mt-4'>
      <div className='bg-white rounded-lg overflow-hidden border'>
        <TableComponent className='min-w-full divide-y divide-gray-200'>
          <Header onSort={onSort} renderSortIcon={renderSortIcon} />
          <Body isLoading={isFetching} auctions={sortedAuctions} />
          <Footer
            page={params.page}
            totalPages={totalPages}
            totalCount={total}
            setPage={(page) => setParams({ ...params, page })}
            isLoading={isFetching}
            entitiesName={t('all_auctions.auctions')}
            perPageCount={limit}
          />
        </TableComponent>
      </div>
    </CardContent>
  );
};

export default Table;
