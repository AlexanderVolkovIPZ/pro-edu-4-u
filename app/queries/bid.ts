import { Auction, Bid } from '@prisma/client';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { LotWithRelationsType } from '../types';
import { BID } from './query-keys';

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
