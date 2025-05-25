import { Status } from '@prisma/client';
import { useState } from 'react';

type AuctionInfoType = {
  id: string;
  title: string;
  isPublished: boolean;
  status: Status;
  startDate: string;
  endDate: string;
  createdAt: string;
  lotCount: number;
  bidCount: number;
}[];

type SortAuctionType = {
  auctions: AuctionInfoType;
};

export const useSortAuctions = ({ auctions }: SortAuctionType) => {
  const [sortBy, setSortBy] = useState(['createdAt']);
  const [sortDirection, setSortDirection] = useState<Record<string, 'asc' | 'desc'>>({
    title: 'desc',
    startDate: 'desc',
    endDate: 'desc',
    lotCount: 'desc',
    bidCount: 'desc',
    createdAt: 'desc',
  });

  const sortedAuctions = auctions.sort((a, b) => {
    const startDateA = new Date(a.startDate);
    const startDateB = new Date(b.startDate);
    const endDateA = new Date(a.endDate);
    const endDateB = new Date(b.endDate);
    const createdDateA = new Date(a.createdAt);
    const createdDateB = new Date(b.createdAt);

    const lastField = sortBy[sortBy.length - 1];

    if (sortBy.includes('title') && lastField === 'title') {
      return sortDirection['title'] === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    } else if (sortBy.includes('lotCount') && lastField === 'lotCount') {
      return sortDirection['lotCount'] === 'asc' ? a.lotCount - b.lotCount : b.lotCount - a.lotCount;
    } else if (sortBy.includes('startDate') && lastField === 'startDate') {
      const dateA = a.startDate ? startDateA.getTime() : 0;
      const dateB = b.startDate ? startDateB.getTime() : 0;

      return sortDirection['startDate'] === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy.includes('endDate') && lastField === 'endDate') {
      const dateA = a.endDate ? endDateA.getTime() : 0;
      const dateB = b.endDate ? endDateB.getTime() : 0;

      return sortDirection['endDate'] === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy.includes('createdAt') && lastField === 'createdAt') {
      return sortDirection['createdAt'] === 'asc'
        ? createdDateA.getTime() - createdDateB.getTime()
        : createdDateB.getTime() - createdDateA.getTime();
    } else if (sortBy.includes('bidCount') && lastField === 'bidCount') {
      return sortDirection['bidCount'] === 'asc' ? a.bidCount - b.bidCount : b.bidCount - a.bidCount;
    }

    return 0;
  });

  return { sortedAuctions, sortBy, setSortBy, sortDirection, setSortDirection };
};
