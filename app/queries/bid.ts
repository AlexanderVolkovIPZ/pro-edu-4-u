import { Bid } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';

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

    onSettled: () => {
      //   queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}
