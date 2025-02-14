import { UserAuction } from '@prisma/client';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { USER_AUCTION } from './query-keys';
import axios from 'axios';

export function useUserAuctionsByFilter<T extends UserAuction[]>(
  auctionId: string,
  filters?: Partial<Omit<UserAuction, 'createdAt'> & { createdAt: string }>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey'>
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [USER_AUCTION, auctionId, filters],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/user-auction`, {
        params: filters,
      });
      return response.data;
    },
    enabled: Boolean(auctionId),
    ...options,
  });
}
