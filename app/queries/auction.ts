'use client';

import { Auction } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { AUCTION } from './query-keys';

export function useCreateAuction<T extends Pick<Auction, 'title'>>(): UseMutationResult<Auction, Error, T> {
  return useMutation<Auction, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.post<Auction>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, data);
      return response.data;
    },
  });
}

export function useUpdateAuction<
  T extends Partial<
    Omit<Auction, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
      startDate: string;
      endDate: string;
    }
  >,
>(auctionId: string): UseMutationResult<Auction, Error, T> {
  return useMutation<Auction, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.patch<Auction>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`, data);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}

export function useAuction<T>(auctionId: string): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: [AUCTION, auctionId],
    queryFn: async () => {
      const response = await axios.get<T>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`);
      return response.data;
    },
  });
}

export function useAuctionByFilter<T extends Auction>(filters: Partial<T>): UseQueryResult<AxiosResponse<T>, Error> {
  return useQuery<AxiosResponse<T>, Error>({
    queryKey: [AUCTION, filters],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, {
        params: filters,
      });
      return response;
    },
  });
}
