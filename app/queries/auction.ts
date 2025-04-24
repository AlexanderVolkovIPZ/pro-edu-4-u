'use client';

import { Auction } from '@prisma/client';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION] });
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

type QueryData<T> = {
  auctions: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  maxLotPriceExisted: number;
  minLotPriceExisted: number;
  lotCategoriesExistedNames: string[];
};

export function useAuctionsByFilter<T extends AuctionWithStringDates>({
  filters,
  options,
}: {
  filters?: Partial<AuctionWithStringDates> & {
    page?: number;
    limit?: number;
    loadForCurrentUser?: boolean;
    minLotPrice?: number;
    maxLotPrice?: number;
    categories?: string;
  };
  options?: Omit<UseQueryOptions<QueryData<T>, Error>, 'queryKey'>;
}): UseQueryResult<QueryData<T>, Error> {
  return useQuery({
    queryKey: [AUCTION, JSON.stringify(filters)],
    queryFn: async () => {
      const response = await axios.get<QueryData<T>>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, {
        params: {
          ...filters,
        },
      });
      return response.data;
    },
    ...options,
  });
}

export function useDeleteAuction({
  options,
}: {
  options?: Omit<
    UseMutationOptions<Auction, Error, string, { previousAuctions?: QueryData<AuctionWithStringDates> }>,
    'mutationFn'
  >;
}): UseMutationResult<Auction, Error, string, { previousAuctions?: QueryData<AuctionWithStringDates> }> {
  return useMutation<Auction, Error, string, { previousAuctions?: QueryData<AuctionWithStringDates> }>({
    mutationFn: async (auctionId) => {
      const response = await axios.delete<Auction>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`);
      return response.data;
    },
    onMutate: async (auctionId) => {
      await queryClient.cancelQueries({ queryKey: [AUCTION] });

      const previousAuctions = queryClient.getQueryData<QueryData<AuctionWithStringDates>>([AUCTION]);
      queryClient.setQueryData<AuctionWithStringDates[]>([AUCTION], (oldAuctions) =>
        oldAuctions ? oldAuctions.filter((auction) => auction.id !== auctionId) : []
      );

      return { previousAuctions };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousAuctions) {
        queryClient.setQueryData([AUCTION], context.previousAuctions);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION] });
    },
    ...options,
  });
}
