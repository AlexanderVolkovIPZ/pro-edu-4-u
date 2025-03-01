'use client';

import { Auction } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { AuctionWithStringDates } from '../types';
import { AUCTION } from './query-keys';

export function useCreateAuction<T extends Pick<Auction, 'title'>>(): UseMutationResult<Auction, Error, T> {
  return useMutation<Auction, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.post<Auction>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, data);
      return response.data;
    },
  });
}

export function useUpdateAuction<
  T extends Partial<
    Omit<Auction, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
      startDate: string;
      endDate: string;
    }
  >,
>(auctionId: string): UseMutationResult<Auction, Error, T, { previousAuction?: Auction }> {
  return useMutation<Auction, Error, T, { previousAuction: Auction }>({
    mutationFn: async (data: T) => {
      const response = await axios.patch<Auction>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`, data);
      return response.data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [AUCTION, auctionId] });

      const previousAuction = queryClient.getQueryData<Auction>([AUCTION, auctionId]);
      if (!previousAuction) return;

      queryClient.setQueryData<Auction | undefined>([AUCTION, auctionId], (oldAuction) =>
        oldAuction ? { ...oldAuction, ...newData } : undefined
      );

      return { previousAuction };
    },

    onError: (_error, _newData, context) => {
      if (context?.previousAuction) {
        queryClient.setQueryData([AUCTION, auctionId], context.previousAuction);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}

export function useAuction<T extends AuctionWithStringDates>(auctionId: string): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [AUCTION, auctionId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`);
      return response.data;
    },
    staleTime: 1000 * 60,
    enabled: !!auctionId,
  });
}

type QueryData<T> = { auctions: T[]; total: number; totalPages: number; page: number; limit: number };

export function useAuctionsByFilter<T extends AuctionWithStringDates>({
  filters,
  options,
}: {
  filters?: Partial<AuctionWithStringDates> & {
    page?: number;
    limit?: number;
  };
  options?: Omit<UseQueryOptions<QueryData<T>, Error>, 'queryKey'>;
}): UseQueryResult<QueryData<T>, Error> {
  return useQuery({
    queryKey: [AUCTION, JSON.stringify(filters)],
    queryFn: async () => {
      const response = await axios.get<{
        auctions: T[];
        total: number;
        totalPages: number;
        page: number;
        limit: number;
      }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, {
        params: {
          ...filters,
        },
      });
      return response.data;
    },
    ...options,
  });
}
