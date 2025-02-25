import { LotDetail } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateLotDetailsType } from '../types';
import { LOT, LOT_DETAIL } from './query-keys';

export function useLotDetails(auctionId: string, lotId: string): UseQueryResult<LotDetail[], Error> {
  return useQuery<LotDetail[], Error>({
    queryKey: [LOT_DETAIL, lotId],
    queryFn: async () => {
      const response = await axios.get<LotDetail[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/lot-detail`
      );
      return response.data;
    },
  });
}

export function useCreateLotDetails(
  auctionId: string,
  lotId: string
): UseMutationResult<LotDetail[], Error, CreateLotDetailsType> {
  return useMutation<LotDetail[], Error, CreateLotDetailsType>({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/lot-detail`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}
