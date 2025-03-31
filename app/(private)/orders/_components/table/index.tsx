'use client';

import Footer from '@/app/(private)/_shared/components/table/footer';
import { OrderWithStringDates } from '@/app/queries/order';
import { AuctionWithRelationsType, LotWithRelationsType } from '@/app/types';
import { CardContent } from '@/components/ui/card';
import { Table as TableComponent } from '@/components/ui/table';
import { Annoyed, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import EmptyPage from '../../../../../components/empty-page';
import { useSortOrders } from '../../_hooks/use-sort-orders';
import Body from './body';
import Header from './header';

export type ExtendedAuction = Omit<AuctionWithRelationsType, 'lot'> & {
  lot: (LotWithRelationsType & {
    _count: {
      bid: number;
    };
  })[];
};

type TableParams = {
  orders: OrderWithStringDates[];
  isFetching: boolean;
  limit: number;
  total: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
};

const Table = ({
  orders,
  isFetching,
  limit,
  total,
  totalPages,
  page,
  setPage,
}: TableParams & {
  limit: number;
  total: number;
  totalPages: number;
}) => {
  const router = useRouter();

  const { setSortBy, setSortDirection, sortedOrders, sortBy, sortDirection } = useSortOrders({
    orders,
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

  if (!isFetching && !orders.length)
    return (
      <EmptyPage
        icon={Annoyed}
        title='Your Table is Empty'
        description='Looks like you haven’t had an order yet.'
        buttonTitle='Go to Home page'
        onClick={() => router.push('/')}
      />
    );

  return (
    <CardContent className='p-0 mt-4'>
      <div className='bg-white rounded-lg overflow-hidden border'>
        <TableComponent className='min-w-full divide-y divide-gray-200'>
          <Header onSort={onSort} renderSortIcon={renderSortIcon} />
          <Body isLoading={isFetching} orders={sortedOrders} />
          <Footer
            page={page}
            totalPages={totalPages}
            totalCount={total}
            setPage={setPage}
            isLoading={isFetching}
            entitiesName='orders'
            perPageCount={limit}
          />
        </TableComponent>
      </div>
    </CardContent>
  );
};

export default Table;
