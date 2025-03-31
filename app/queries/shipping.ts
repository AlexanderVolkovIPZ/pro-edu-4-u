import { Shipping } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../providers/query-client-provider';
import { OrderWithStringDates, QueryData } from './order';
import { ORDER } from './query-keys';

export function useUpdateShipping<
  T extends Partial<
    Omit<Shipping, 'createdAt' | 'updatedAt'> & {
      startDate?: string;
      endDate?: string;
    }
  >,
>(): UseMutationResult<Shipping, Error, T> {
  return useMutation({
    mutationFn: async (data: T) => {
      const response = await axios.patch<Shipping>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/shipping/${data.id}`, data);
      return response.data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [ORDER] });

      const previousOrdersData = queryClient.getQueryData<QueryData<OrderWithStringDates>>([ORDER]);
      console.log(previousOrdersData);
      if (!previousOrdersData) return;

      queryClient.setQueryData<QueryData<OrderWithStringDates>>([ORDER, JSON.stringify({ page: 1 })], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          orders: oldData.orders.map((order) => (order.id === newData.id ? { ...order, ...newData } : order)),
        };
      });

      return { previousOrdersData };
    },

    onError: (_error, _newData, context) => {
      if (context?.previousOrdersData) {
        queryClient.setQueryData([ORDER, JSON.stringify({ page: 1 })], context.previousOrdersData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER] });
    },
  });
}
