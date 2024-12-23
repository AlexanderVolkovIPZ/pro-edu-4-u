import { Video } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateVideoType, DeleteVideoType, ReorderVideoType } from '../types';
import { LOT } from './query-keys';

export function useCreateVideo(auctionId: string, lotId: string): UseMutationResult<Video[], Error, CreateVideoType> {
  return useMutation<Video[], Error, CreateVideoType>({
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

export function useDeleteVideo(auctionId: string, lotId: string): UseMutationResult<Video, Error, DeleteVideoType> {
  return useMutation<Video, Error, DeleteVideoType>({
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

export function useReorderVideo(auctionId: string, lotId: string): UseMutationResult<Video[], Error, ReorderVideoType> {
  return useMutation<Video[], Error, ReorderVideoType>({
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
