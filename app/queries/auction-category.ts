import { AuctionCategory } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { AUCTION_CATEGORY } from './query-keys';
import { queryClient } from '../providers/query-client-provider';
import { CreateAuctionCategoriesType } from '../types';

export function useAuctionCategories(auctionId: string): UseQueryResult<AuctionCategory[], Error> {
  return useQuery<AuctionCategory[], Error>({
    queryKey: [AUCTION_CATEGORY, auctionId],
    queryFn: async () => {
      const response = await axios.get<AuctionCategory[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction-category?auctionId=${auctionId}`
      );
      return response.data;
    },
  });
}

export function useCreateAuctionCategories<T extends CreateAuctionCategoriesType>(): UseMutationResult<
  AuctionCategory,
  Error,
  T
> {
  return useMutation<AuctionCategory, Error, T>({
    mutationFn: async (data) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction-category`, data);
      return response.data;
    },
    onSettled: (data, error, variables) => {
      if (variables.auctionId) {
        queryClient.invalidateQueries({ queryKey: [AUCTION_CATEGORY, variables.auctionId] });
      }
    },
  });
}
