import { Auction, Bid } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { AUCTION, BID } from './query-keys';
import { AuctionWithRelationsType, LotWithRelationsType } from '../types';
import { queryClient } from '../providers/query-client-provider';

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
    onMutate: async ({ payloadBidId, data }) => {
      queryClient.cancelQueries({ queryKey: [AUCTION, auctionId] });
      queryClient.cancelQueries({ queryKey: [BID] });

      const previousAuction = queryClient.getQueryData<AuctionWithRelationsType>([AUCTION, auctionId]);

      if (!previousAuction) return;

      queryClient.setQueryData<AuctionWithRelationsType>([AUCTION, auctionId], (oldAuction) => {
        return oldAuction
          ? {
              ...oldAuction,
              lot: oldAuction.lot.map((lot) => ({
                ...lot,
                bid: lot.bid.map((bid) => (bid.id === payloadBidId ? { ...bid, ...data } : bid)),
              })),
            }
          : undefined;
      });

      return previousAuction;
    },
    onError: (_error, _newData, context) => {
      if (context) {
        queryClient.setQueryData([AUCTION, auctionId], context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
      queryClient.invalidateQueries({ queryKey: [BID] });
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
  filters?: Partial<Omit<Bid, 'createdAt'> & { createdAt: string; lotsId?: string[] }>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey'>
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [BID, filters],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bid`, {
        params: {
          ...filters,
          ...(filters?.lotsId ? { lotsId: JSON.stringify(filters.lotsId) } : {}),
        },
      });
      return response.data;
    },
    ...options,
  });
}
