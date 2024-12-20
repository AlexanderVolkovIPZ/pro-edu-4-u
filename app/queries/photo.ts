import { Photo } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { LOT } from './query-keys';
import { CreatePhotoType, DeletePhotoType, ReorderPhotoType } from '../types';

export function useCreatePhoto(auctionId: string, lotId: string): UseMutationResult<Photo[], Error, CreatePhotoType> {
  return useMutation<Photo[], Error, CreatePhotoType>({
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

export function useDeletePhoto(auctionId: string, lotId: string): UseMutationResult<Photo, Error, DeletePhotoType> {
  return useMutation<Photo, Error, DeletePhotoType>({
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

export function useReorderPhoto(auctionId: string, lotId: string): UseMutationResult<Photo[], Error, ReorderPhotoType> {
  return useMutation<Photo[], Error, ReorderPhotoType>({
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
