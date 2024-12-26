'use client';

import { Lot, Photo, Video } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import getReorderedLots from '../actions/get-reordered-lots';
import { queryClient } from '../providers/query-client-provider';
import { AUCTION, LOT } from './query-keys';
import { AuctionDataType } from '../types';

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

export function useUpdateLot<T extends Partial<Lot>>(
  auctionId: string,
  lotId: string
): UseMutationResult<Lot, Error, T> {
  return useMutation<Lot, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useLot<T extends Lot & { photo: Photo[]; video: Video[] }>(
  auctionId: string,
  lotId: string
): UseQueryResult<T, Error> {
  return useQuery<T, Error, T>({
    queryKey: [LOT, auctionId, lotId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`);
      return response.data;
    },
  });
}

type ReorderLotsType = AuctionDataType & { draggableId: string; newPosition: number };
export function useReorderLots(auctionId: string): UseMutationResult<AuctionDataType, Error, ReorderLotsType> {
  return useMutation<AuctionDataType, Error, ReorderLotsType>({
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

      const previousAuction = queryClient.getQueryData<AuctionDataType>([AUCTION, auctionId]);
      const lots = getReorderedLots({
        lotId: draggableId,
        newPosition: newPosition,
        lots: lot,
      });

      queryClient.setQueryData([AUCTION, auctionId], (oldQueryData: AuctionDataType) => {
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
