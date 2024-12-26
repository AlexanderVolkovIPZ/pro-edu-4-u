import { AuctionCategory } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { AUCTION } from './query-keys';
import { queryClient } from '../providers/query-client-provider';
import { CreateAuctionCategoriesType } from '../types';

export function useAuctionCategories(auctionId: string): UseQueryResult<AuctionCategory[], Error> {
  return useQuery<AuctionCategory[], Error>({
    queryKey: ['auction-category'],
    queryFn: async () => {
      const response = await axios.get<AuctionCategory[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction-category?auctionId=${auctionId}`
      );
      return response.data;
    },
  });
}

export function useCreateAuctionCategories<T = CreateAuctionCategoriesType>(): UseMutationResult<
  AuctionCategory,
  Error,
  T
> {
  return useMutation<AuctionCategory, Error, T>({
    mutationFn: async (data) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction-category`, data);
      return response.data;
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, data?.auctionId] });
    },
  });
}
