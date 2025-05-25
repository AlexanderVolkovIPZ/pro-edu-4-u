import { Bid, Lot, Photo, Shipping, User, UserAuction } from '@prisma/client';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { ORDER } from './query-keys';

export type OrderWithStringDates = Pick<
  Shipping,
  'id' | 'firstName' | 'lastName' | 'phone' | 'city' | 'address' | 'postalCode' | 'status' | 'email'
> & {
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id'>;
  lot: Pick<Lot, 'id' | 'title'> & {
    auction: {
      id: string;
      userAuction: Pick<UserAuction, 'userId' | 'role'>;
    };
  };
};
export type QueryData<T> = { orders: T[]; total: number; totalPages: number; page: number; limit: number };

export function useOrdersByFilter<T extends OrderWithStringDates>({
  filters,
  options,
}: {
  filters?: {
    page?: number;
    limit?: number;
    tab?: string;
  };
  options?: Omit<UseQueryOptions<QueryData<T>, Error>, 'queryKey'>;
}): UseQueryResult<QueryData<T>, Error> {
  return useQuery({
    queryKey: [ORDER, filters],
    queryFn: async () => {
      const response = await axios.get<QueryData<T>>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`, {
        params: {
          ...filters,
        },
      });
      return response.data;
    },
    ...options,
  });
}

type OrderWithRelationsType = Omit<Shipping, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'name'>;
  lot: Pick<Lot, 'id' | 'title' | 'auctionId'> & {
    photo: Photo[];
    bid: Bid[];
  };
};
export function useOrder<T extends OrderWithRelationsType>(orderId: string): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [ORDER, orderId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${orderId}`);
      return response.data;
    },
    staleTime: 1000 * 60,
    enabled: !!orderId,
  });
}
