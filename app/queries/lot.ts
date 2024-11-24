'use client';

import { Lot } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { AuctionData } from '../(private)/auctions/[auctionId]/_shared/types';
import getReorderedLots from '../actions/get-reordered-lots';
import { queryClient } from '../providers/query-client-provider';
import { AUCTION, LOT } from './query-keys';

export function useCreateLot<T extends Pick<Lot, 'title' | 'auctionId'>>(
  auctionId: string
): UseMutationResult<Lot, Error, T> {
  return useMutation<Lot, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.post<Lot>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot`, data);
      return response.data;
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, data?.auctionId] });
    },
  });
}

export function useUpdateLot<T extends Lot>(
  auctionId: string,
  lotId: string
): UseMutationResult<AxiosResponse<T>, Error, T> {
  return useMutation<AxiosResponse<T>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`,
        data
      );
      return response;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, lotId] });
    },
  });
}

export function useLot<T>(lotId: string): UseQueryResult<AxiosResponse<T>, Error> {
  return useQuery<AxiosResponse<T>, Error>({
    queryKey: [LOT, lotId],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lot/${lotId}`);
      return response;
    },
  });
}

type ReorderLotsType = AuctionData & { draggableId: string; newPosition: number };
export function useReorderLots(auctionId: string): UseMutationResult<AuctionData, Error, ReorderLotsType> {
  return useMutation<AuctionData, Error, ReorderLotsType>({
    mutationFn: async ({ draggableId, newPosition }: ReorderLotsType) => {
      const response = await axios.patch<ReorderLotsType>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/reorder`,
        {
          id: draggableId,
          position: newPosition,
        }
      );
      return response.data;
    },
    onMutate: async ({ draggableId, newPosition, lot }) => {
      await queryClient.cancelQueries({ queryKey: [AUCTION, auctionId] });

      const previousAuction = queryClient.getQueryData<AuctionData>([AUCTION, auctionId]);
      const lots = getReorderedLots({
        lotId: draggableId,
        newPosition: newPosition,
        lots: lot,
      });

      queryClient.setQueryData([AUCTION, auctionId], (oldQueryData: AuctionData) => {
        return {
          ...oldQueryData,
          lot: [...lots],
        };
      });

      return { ...previousAuction };
    },
    onError: (error, variables, context) => {
      if (context) {
        queryClient.setQueryData([AUCTION, auctionId], {
          ...context,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}
