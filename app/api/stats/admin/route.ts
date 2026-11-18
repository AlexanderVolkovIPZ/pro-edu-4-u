import { parseQuery, withAuth } from '@/server/http';
import { adminStatsQuerySchema } from '@/server/schemas/stats.schema';
import { statsService } from '@/server/services';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request }) => {
    const { days } = parseQuery(request, adminStatsQuerySchema);
    const stats = await statsService.getAdminStats(days);

    return NextResponse.json(stats);
  },
  { role: UserRole.ADMIN, label: 'GET_STATS' }
);
