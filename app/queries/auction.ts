'use client';

import { Auction } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

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

export function useUpdatedAuction<T>(): UseMutationResult<AxiosResponse<T>, Error, T> {
  return useMutation<AxiosResponse<T>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auction`, data);
      return response;
    },
  });
}
