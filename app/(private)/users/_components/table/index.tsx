'use client';

import { useGetUsers } from '@/app/queries/auth-user';
import { AuctionWithRelationsType, LotWithRelationsType } from '@/app/types';
import { CardContent } from '@/components/ui/card';
import { Table as TableComponent } from '@/components/ui/table';
import { Annoyed, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import EmptyPage from '../../../../../components/empty-page';
import { useSortUsers } from '../../_hooks/use-sort-users';
import Body from './body';
import Header from './header';
import Footer from '@/app/(private)/_shared/components/table/footer';
import { useQueryParams } from '@/app/hooks/use-query-params';

export type ExtendedAuction = Omit<AuctionWithRelationsType, 'lot'> & {
  lot: (LotWithRelationsType & {
    _count: {
      bid: number;
    };
  })[];
};

const Table = () => {
  const router = useRouter();
  const { params, setParams } = useQueryParams({
    page: 1,
    limit: 5,
  });
  const { data: { users = [], total = 0, totalPages = 0, limit = 0 } = {}, isFetching: isUserDataFetching } =
    useGetUsers({
      filters: {
        page: params.page,
        limit: params.limit,
      },
      options: {},
    });

  const { setSortBy, setSortDirection, sortedUsers, sortBy, sortDirection } = useSortUsers({
    users: users.map((user) => ({
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified ?? '',
    })),
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

  if (!isUserDataFetching && !users.length)
    return (
      <EmptyPage
        icon={Annoyed}
        title='Your Table is Empty'
        description='Looks like you haven’t had any created user.'
        buttonTitle='Go to Home'
        onClick={() => router.push('/')}
      />
    );

  return (
    <CardContent className='p-0 mt-4' id='root'>
      <div className='bg-white rounded-lg overflow-hidden border'>
        <TableComponent className='min-w-full divide-y divide-gray-200'>
          <Header onSort={onSort} renderSortIcon={renderSortIcon} />
          <Body isLoading={isUserDataFetching} users={sortedUsers} />
          <Footer
            page={params.page}
            totalPages={totalPages}
            totalCount={total}
            setPage={(page) => setParams({ ...params, page })}
            isLoading={isUserDataFetching}
            entitiesName='users'
            perPageCount={limit}
          />
        </TableComponent>
      </div>
    </CardContent>
  );
};

export default Table;
