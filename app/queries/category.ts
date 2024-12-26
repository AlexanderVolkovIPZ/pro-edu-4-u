import { Category } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

export function useCategory(): UseQueryResult<Category[], Error> {
  return useQuery<Category[], Error>({
    queryKey: ['category'],
    queryFn: async () => {
      const response = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`);
      return response.data;
    },
  });
}
