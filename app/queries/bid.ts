import { Auction, Bid } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { BID } from './query-keys';
import { LotWithRelationsType } from '../types';

export function useUpdateBid<T extends Partial<Omit<Bid, 'id' | 'createdAt'>>>(
  auctionId: string,
  lotId: string,
  bidId?: string
): UseMutationResult<Bid, Error, { payloadBidId?: string; data: T }> {
  return useMutation<Bid, Error, { payloadBidId?: string; data: T }>({
    mutationFn: async ({ payloadBidId, data }) => {
      const finalBidId = bidId || payloadBidId;
      if (!finalBidId) {
        throw new Error('bidId is required');
      }

      const response = await axios.patch<Bid>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/bid/${finalBidId}`,
        data
      );
      return response.data;
    },
  });
}

export function useBidsByFilter<
  T extends (Bid & {
    lot: LotWithRelationsType & {
      auction: Auction;
    };
  })[],
>(
  filters?: Partial<Omit<Bid, 'createdAt'> & { createdAt: string }>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey'>
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [BID, filters],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bid`, {
        params: filters,
      });
      return response.data;
    },
    ...options,
  });
}
