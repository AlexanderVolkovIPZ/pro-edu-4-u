'use client';

import { useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { USER } from './query-keys';
import { User } from '@prisma/client';
import { queryClient } from '../providers/query-client-provider';

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

type GetUsersType = {
  users: (Pick<User, 'id' | 'name' | 'email' | 'role'> & { createdAt: string; emailVerified: string | null })[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export function useGetUsers({
  filters,
  options,
}: {
  filters: {
    page?: number;
    limit?: number;
  };
  options?: Omit<UseQueryOptions<GetUsersType, Error>, 'queryKey'>;
}): UseQueryResult<GetUsersType, Error> {
  return useQuery<GetUsersType, Error>({
    queryKey: [USER],
    queryFn: async () => {
      const response = await axios.get<GetUsersType>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user`, {
        params: filters,
      });
      return response.data;
    },
    ...options,
  });
}

export function useUpdateUser<T extends Partial<Omit<User, 'id'>> & { id: string }>(): UseMutationResult<
  AxiosResponse<User>,
  Error,
  T,
  { previousData?: GetUsersType }
> {
  return useMutation<AxiosResponse<User>, Error, T, { previousData?: GetUsersType }>({
    mutationFn: async (data: T) => {
      const response = await axios.patch<User>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${data.id}`, data);
      return response;
    },
    onMutate: async (data: T) => {
      await queryClient.cancelQueries({ queryKey: [USER] });

      const previousData = queryClient.getQueryData<GetUsersType>([USER]);

      queryClient.setQueryData<GetUsersType>([USER], (oldData) => {
        if (!oldData) return oldData;

        const updatedUsers = oldData.users.map((user) => (user.id === data.id ? { ...user, ...data } : user));

        return {
          ...oldData,
          users: updatedUsers,
        };
      });

      return { previousData };
    },
    onError: (error, data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<GetUsersType>([USER], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USER] });
    },
  });
}

export function useDeleteUser<T extends Pick<User, 'id'>>(): UseMutationResult<
  AxiosResponse<User>,
  Error,
  T,
  { previousData?: GetUsersType }
> {
  return useMutation<AxiosResponse<User>, Error, T, { previousData?: GetUsersType }>({
    mutationFn: async (data: T) => {
      const response = await axios.delete<User>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${data.id}`);
      return response;
    },
    onMutate: async (data: T) => {
      await queryClient.cancelQueries({ queryKey: [USER] });

      const previousData = queryClient.getQueryData<GetUsersType>([USER]);

      queryClient.setQueryData<GetUsersType>([USER], (oldData) => {
        if (!oldData) return oldData;

        const updatedUsers = oldData.users.filter((user) => user.id !== data.id);

        return {
          ...oldData,
          users: updatedUsers,
        };
      });

      return { previousData };
    },
    onError: (error, data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<GetUsersType>([USER], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USER] });
    },
  });
}
