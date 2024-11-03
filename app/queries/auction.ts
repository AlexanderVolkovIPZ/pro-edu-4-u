'use client';

import { Auction } from '@prisma/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { AUCTION } from './query-keys';

export function useCreateAuction<T extends Pick<Auction, 'title'>>(): UseMutationResult<
  AxiosResponse<Auction>,
  Error,
  T
> {
  return useMutation<AxiosResponse<Auction>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, data);
      return response;
    },
  });
}

export function useUpdateAuction<T>(auctionId: string): UseMutationResult<AxiosResponse<T>, Error, T> {
  return useMutation<AxiosResponse<T>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`, data);
      return response;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [AUCTION, auctionId] });
    },
  });
}

export function useAuction<T>(auctionId: string): UseQueryResult<AxiosResponse<T>, Error> {
  return useQuery<AxiosResponse<T>, Error>({
    queryKey: [AUCTION, auctionId],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}`);
      return response;
    },
  });
}
