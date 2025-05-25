import { OrderWithStringDates } from '@/app/queries/order';
import { useState } from 'react';

type SortAuctionType = {
  orders: OrderWithStringDates[];
};

export const useSortOrders = ({ orders }: SortAuctionType) => {
  const [sortBy, setSortBy] = useState(['createdAt']);
  const [sortDirection, setSortDirection] = useState<Record<string, 'asc' | 'desc'>>({
    createdAt: 'desc',
    name: 'desc',
    status: 'desc',
  });

  const sortedOrders = orders.sort((a, b) => {
    const lastField = sortBy[sortBy.length - 1];

    if (sortBy.includes('createdAt') && lastField === 'createdAt') {
      const createdDateA = new Date(a.createdAt).getTime();
      const createdDateB = new Date(b.createdAt).getTime();

      return sortDirection['createdAt'] === 'asc' ? createdDateA - createdDateB : createdDateB - createdDateA;
    } else if (sortBy.includes('name') && lastField === 'name') {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) {
        return sortDirection['name'] === 'asc' ? lastNameCompare : -lastNameCompare;
      }
      const firstNameCompare = a.firstName.localeCompare(b.firstName);
      return sortDirection['name'] === 'asc' ? firstNameCompare : -firstNameCompare;
    } else if (sortBy.includes('status') && lastField === 'status') {
      return sortDirection['status'] === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }

    return 0;
  });

  return { sortedOrders, sortBy, setSortBy, sortDirection, setSortDirection };
};
