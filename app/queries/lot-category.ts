import { LotCategory } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateLotCategoriesType } from '../types';
import { LOT, LOT_CATEGORY } from './query-keys';

export function useLotCategories(auctionId: string, lotId: string): UseQueryResult<LotCategory[], Error> {
  return useQuery<LotCategory[], Error>({
    queryKey: [LOT_CATEGORY, lotId],
    queryFn: async () => {
      const response = await axios.get<LotCategory[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/lot-category`
      );
      return response.data;
    },
  });
}

export function useCreateLotCategories(
  auctionId: string,
  lotId: string
): UseMutationResult<LotCategory, Error, CreateLotCategoriesType> {
  return useMutation<LotCategory, Error, CreateLotCategoriesType>({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/lot-category`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT_CATEGORY, lotId] });
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}
