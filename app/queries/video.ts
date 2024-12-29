import { Video } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateFileType, DeleteFileType, ReorderFileType } from '../types';
import { LOT } from './query-keys';

export function useCreateVideo(
  auctionId: string,
  lotId: string
): UseMutationResult<Video[], Error, CreateFileType<Video>> {
  return useMutation<Video[], Error, CreateFileType<Video>>({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/video`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useDeleteVideo(auctionId: string, lotId: string): UseMutationResult<Video, Error, DeleteFileType> {
  return useMutation<Video, Error, DeleteFileType>({
    mutationFn: async (data) => {
      const response = await axios.delete<Video>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/video`,
        { data }
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}

export function useReorderVideo(auctionId: string, lotId: string): UseMutationResult<Video[], Error, ReorderFileType> {
  return useMutation<Video[], Error, ReorderFileType>({
    mutationFn: async (data) => {
      const response = await axios.patch<Video[]>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/video/reorder`,
        data
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });
    },
  });
}
