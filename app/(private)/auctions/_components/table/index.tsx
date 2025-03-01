'use client';

import { useAuctionsByFilter } from '@/app/queries/auction';
import { AuctionWithRelationsType, LotWithRelationsType } from '@/app/types';
import { getAuctionStatus } from '@/app/utils/get-auction-status';
import { CardContent } from '@/components/ui/card';
import { Table as TableComponent } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { useSortAuctions } from '../_hooks/use-sort-auctions';
import Body from './body';
import Footer from './footer';
import Header from './header';

export type ExtendedAuction = Omit<AuctionWithRelationsType, 'lot'> & {
  lot: (LotWithRelationsType & {
    _count: {
      bid: number;
    };
  })[];
};

const Table = () => {
  const [page, setPage] = useState(1);
  const { data: { auctions = [], total = 0, totalPages = 0 } = {}, isLoading: isLoadingData } =
    useAuctionsByFilter<ExtendedAuction>({
      filters: {
        page,
        limit: 5,
      },
      options: {
        staleTime: 1000 * 60 * 10,
      },
    });

  const auctionsToDisplay =
    auctions?.map((auction) => ({
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
    })) || [];

  const { setSortBy, setSortDirection, sortedAuctions, sortBy, sortDirection } = useSortAuctions({
    auctions: auctionsToDisplay,
  });

  const onSort = (column: keyof typeof sortDirection) => {
    if (sortBy.includes(column)) {
      setSortDirection((prevDirection) => ({
        ...prevDirection,
        [column]: prevDirection[column] === 'asc' ? 'desc' : 'asc',
      }));

      setSortBy((prevSortBy) => prevSortBy.filter((item) => item !== column).concat(column));
    } else {
      setSortBy((prevSortBy) => [...prevSortBy, column]);
      setSortDirection((prevDirection) => ({ ...prevDirection, [column]: 'asc' }));
    }
  };

  const renderSortIcon = (column: keyof typeof sortDirection) => {
    if (!sortBy.includes(column)) return <ChevronDown className='ml-1 h-4 w-4 text-gray-400' />;

    return sortDirection[column] === 'asc' ? (
      <ChevronUp className='ml-1 h-4 w-4 text-indigo-600' />
    ) : (
      <ChevronDown className='ml-1 h-4 w-4 text-indigo-600' />
    );
  };

  return (
    <CardContent className='p-0 mt-4'>
      <div className='bg-white rounded-lg overflow-hidden border'>
        <TableComponent className='min-w-full divide-y divide-gray-200'>
          <Header onSort={onSort} renderSortIcon={renderSortIcon} />
          <Body isLoading={isLoadingData} auctions={sortedAuctions} />
          <Footer page={page} totalPages={totalPages} totalCount={total} setPage={setPage} isLoading={isLoadingData} />
        </TableComponent>
      </div>
    </CardContent>
  );
};

export default Table;
