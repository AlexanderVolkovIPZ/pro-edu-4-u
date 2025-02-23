'use client';

import { Auction, Lot } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import getReorderedLots from '../actions/get-reordered-lots';
import { queryClient } from '../providers/query-client-provider';
import { AuctionWithLotsType, AuctionWithRelationsType, LotWithRelationsType } from '../types';
import { AUCTION, LOT } from './query-keys';

export function useCreateLot<T extends Pick<Lot, 'title' | 'auctionId'>>(
  auctionId: string
): UseMutationResult<Lot, Error, T, { previousAuction?: AuctionWithRelationsType }> {
  return useMutation<Lot, Error, T, { previousAuction?: AuctionWithRelationsType }>({
    mutationFn: async (data: T) => {
      const response = await axios.post<Lot>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot`, data);
      return response.data;
    },

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [AUCTION, auctionId] });

      const previousAuction = queryClient.getQueryData<AuctionWithRelationsType>([AUCTION, auctionId]);
      if (!previousAuction) return;

      const previousLots = previousAuction?.lot;
      const previousLotsMaxPosition = previousLots?.reduce((max, lot) => Math.max(max, lot.position), 0) ?? 1;

      const tempLot: LotWithRelationsType = {
        id: 'temp-id',
        auctionId: newData.auctionId,
        title: newData.title,
        position: previousLotsMaxPosition,
        description: null,
        startBid: null,
        buyNowBid: null,
        minBidIncrement: null,
        isSold: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        bid: [],
        lotCategory: [],
        lotDetail: [],
        photo: [],
        video: [],
      };

      queryClient.setQueryData<AuctionWithRelationsType>([AUCTION, auctionId], {
        ...previousAuction,
        lot: [...previousLots, tempLot],
      });

      return { previousAuction };
    },

    onError: (_error, _newData, context) => {
      if (context?.previousAuction !== undefined) {
        queryClient.setQueryData([AUCTION, auctionId], context.previousAuction);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}

export function useUpdateLot<T extends Partial<Lot>>(
  auctionId: string,
  lotId: string
): UseMutationResult<Lot, Error, T, { previousLot: Lot }> {
  return useMutation<Lot, Error, T, { previousLot: Lot }>({
    mutationFn: async (data: T) => {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`,
        data
      );
      return response.data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [LOT, auctionId, lotId] });

      const previousLot = queryClient.getQueryData<Lot>([LOT, auctionId, lotId]);
      if (!previousLot) return;

      queryClient.setQueryData<Lot | undefined>([LOT, auctionId, lotId], (oldLot) => {
        return oldLot ? { ...oldLot, ...newData } : undefined;
      });

      return { previousLot };
    },
    onError: (_error, _newData, context) => {
      if (context?.previousLot !== undefined) {
        queryClient.setQueryData([LOT, auctionId, lotId], context.previousLot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useDeleteLot(auctionId: string, lotId: string): UseMutationResult<Lot, Error, void> {
  return useMutation<Lot, Error, void>({
    mutationFn: async () => {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`);
      return response.data;
    },
  });
}

export function useLot<T extends LotWithRelationsType>(auctionId: string, lotId: string): UseQueryResult<T, Error> {
  return useQuery<T, Error, T>({
    queryKey: [LOT, auctionId, lotId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}`);
      return response.data;
    },
  });
}

export function useLots<T extends LotWithRelationsType[]>(auctionId: string): UseQueryResult<T, Error> {
  return useQuery<T, Error, T>({
    queryKey: [LOT, auctionId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot`);
      return response.data;
    },
  });
}

type ReorderLotsType = {
  draggableId: string;
  newPosition: number;
};

export function useReorderLots(auctionId: string): UseMutationResult<Lot[], Error, ReorderLotsType> {
  return useMutation<Lot[], Error, ReorderLotsType>({
    mutationFn: async ({ draggableId, newPosition }: ReorderLotsType) => {
      const response = await axios.patch<Lot[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/reorder`,
        {
          id: draggableId,
          position: newPosition,
        }
      );
      return response.data;
    },
    onMutate: async ({ draggableId, newPosition }) => {
      await queryClient.cancelQueries({ queryKey: [AUCTION, auctionId] });

      const previousAuction = queryClient.getQueryData<AuctionWithLotsType>([AUCTION, auctionId]);
      if (!previousAuction) return;

      const lots = getReorderedLots({
        lotId: draggableId,
        newPosition: newPosition,
        lots: previousAuction.lot,
      });

      queryClient.setQueryData([AUCTION, auctionId], (oldQueryData: Auction) => {
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
