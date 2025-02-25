import { Photo } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateFileType, DeleteFileType, ReorderFileType } from '../types';
import { LOT } from './query-keys';

export function useCreatePhoto(
  auctionId: string,
  lotId: string
): UseMutationResult<Photo[], Error, CreateFileType<Photo>> {
  return useMutation<Photo[], Error, CreateFileType<Photo>>({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/photo`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useDeletePhoto(auctionId: string, lotId: string): UseMutationResult<Photo, Error, DeleteFileType> {
  return useMutation<Photo, Error, DeleteFileType>({
    mutationFn: async (data) => {
      const response = await axios.delete<Photo>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/photo`,
        { data }
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useReorderPhoto(auctionId: string, lotId: string): UseMutationResult<Photo[], Error, ReorderFileType> {
  return useMutation<Photo[], Error, ReorderFileType>({
    mutationFn: async (data) => {
      const response = await axios.patch<Photo[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/photo/reorder`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}
