import { Shipping, BidType } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';

export function useCreatePayment<
  TVariables = {
    lots: string[];
    shippingInfo: Omit<Shipping, 'id' | 'createdAt' | 'updatedAt' | 'lotId' | 'userId' | 'status'>;
    bidType: BidType;
  },
  TData = { url: string },
>(): UseMutationResult<TData, Error, TVariables> {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      const response = await axios.post<TData>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment`, data);
      return response.data;
    },
  });
}
