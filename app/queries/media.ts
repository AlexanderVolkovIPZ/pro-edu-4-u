import { MediaKind, MediaRecord } from '@/app/_shared/types/media';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { CreateFileType, DeleteFileType, ReorderFileType } from '../types';
import { LOT } from './query-keys';

const mediaUrl = (kind: MediaKind, auctionId: string, lotId: string) =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auction/${auctionId}/lot/${lotId}/${kind}`;

/**
 * Mutations for a lot's media. Photos and videos expose identical endpoints,
 * so one factory serves both kinds.
 */
export function useMediaMutations(kind: MediaKind, auctionId: string, lotId: string) {
  const url = mediaUrl(kind, auctionId, lotId);
  const invalidateLot = () => queryClient.invalidateQueries({ queryKey: [LOT, auctionId, lotId] });

  const create = useMutation<MediaRecord[], Error, CreateFileType<MediaRecord>>({
    mutationFn: async (data) => (await axios.post<MediaRecord[]>(url, data)).data,
    onSettled: invalidateLot,
  });

  const remove = useMutation<MediaRecord, Error, DeleteFileType>({
    mutationFn: async (data) => (await axios.delete<MediaRecord>(url, { data })).data,
    onSettled: invalidateLot,
  });

  const reorder = useMutation<MediaRecord[], Error, ReorderFileType>({
    mutationFn: async (data) => (await axios.patch<MediaRecord[]>(`${url}/reorder`, data)).data,
    onSettled: invalidateLot,
  });

  return { create, remove, reorder };
}
