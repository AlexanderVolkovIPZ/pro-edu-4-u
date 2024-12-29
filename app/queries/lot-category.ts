import { LotCategory } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { LOT_CATEGORY } from './query-keys';
import { queryClient } from '../providers/query-client-provider';
import { CreateLotCategoriesType } from '../types';

export function useLotCategories(lotId: string): UseQueryResult<LotCategory[], Error> {
  return useQuery<LotCategory[], Error>({
    queryKey: [LOT_CATEGORY, lotId],
    queryFn: async () => {
      const response = await axios.get<LotCategory[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/lot-category?lotId=${lotId}`
      );
      return response.data;
    },
  });
}

export function useCreateLotCategories<T extends CreateLotCategoriesType>(): UseMutationResult<LotCategory, Error, T> {
  return useMutation<LotCategory, Error, T>({
    mutationFn: async (data) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lot-category`, data);
      return response.data;
    },
    onSettled: (data, error, variables) => {
      if (variables.lotId) {
        queryClient.invalidateQueries({ queryKey: [LOT_CATEGORY, variables.lotId] });
      }
    },
  });
}
