import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { STATS_ADMIN } from './query-keys';

type StatsAdminResult = {
  statInfo: Record<string, { count: number; growth: number }>;
  salesInfo: Record<string, number>;
};

export function useStatsAdmin({
  days,
  options,
}: {
  days: number;
  options?: Omit<UseQueryOptions<StatsAdminResult, Error>, 'queryKey'>;
}): UseQueryResult<StatsAdminResult, Error> {
  return useQuery<StatsAdminResult, Error>({
    queryKey: [STATS_ADMIN, days],
    queryFn: async () => {
      const response = await axios.get<StatsAdminResult>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats/admin`, {
        params: {
          days,
        },
      });

      return response.data;
    },
    ...options,
  });
}
