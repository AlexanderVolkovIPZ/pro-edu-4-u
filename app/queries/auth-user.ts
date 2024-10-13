'use client';

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

export function useCreateUser<T>(): UseMutationResult<AxiosResponse<T>, Error, T> {
  return useMutation<AxiosResponse<T>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`, data);
      return response;
    },
  });
}

export function useChangePassword<T>(): UseMutationResult<AxiosResponse<T>, Error, T> {
  return useMutation<AxiosResponse<T>, Error, T>({
    mutationFn: async (data: T) => {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/change-password`, data);
      return response;
    },
  });
}
