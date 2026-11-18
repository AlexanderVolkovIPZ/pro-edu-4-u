import prismaDb from '@/lib/prismadb';
import { parseQuery, withAuth } from '@/server/http';
import { adminStatsQuerySchema } from '@/server/schemas/stats.schema';
import { UserRole } from '@prisma/client';
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';

const DAY_MS = 1000 * 60 * 60 * 24;

export const GET = withAuth(
  async ({ request }) => {
    const { days } = parseQuery(request, adminStatsQuerySchema);

    const salesPeriod = new Date(Date.now() - DAY_MS * days);
    const salesData = await prismaDb.bid.findMany({
      where: { isPaid: true, isWinner: true, updatedAt: { gte: salesPeriod } },
      select: { createdAt: true },
    });

    const salesPerDay: Record<string, number> = {};
    salesData.forEach((sale) => {
      const date = dayjs(sale.createdAt).format('YYYY-MM-DD');
      salesPerDay[date] = (salesPerDay[date] || 0) + 1;
    });

    const comparePeriod = new Date(Date.now() - DAY_MS * 30 * 2);
    const statsPeriod = new Date(Date.now() - DAY_MS * 30);

    const [
      auctionsPreviousPeriodCount,
      auctionsCurrentPeriodCount,
      lotsPreviousPeriodCount,
      lotsCurrentPeriodCount,
      userPreviousPeriodCount,
      userCurrentPeriodCount,
    ] = await Promise.all([
      prismaDb.auction.count({ where: { isPublished: true, createdAt: { gte: comparePeriod, lte: statsPeriod } } }),
      prismaDb.auction.count({ where: { isPublished: true, createdAt: { gte: statsPeriod } } }),
      prismaDb.lot.count({
        where: { auction: { isPublished: true }, createdAt: { gte: comparePeriod, lte: statsPeriod } },
      }),
      prismaDb.lot.count({ where: { auction: { isPublished: true }, createdAt: { gte: statsPeriod } } }),
      prismaDb.user.count({ where: { createdAt: { gte: comparePeriod, lte: statsPeriod } } }),
      prismaDb.user.count({ where: { createdAt: { gte: statsPeriod } } }),
    ]);

    return NextResponse.json({
      statInfo: {
        auctions: {
          count: auctionsCurrentPeriodCount,
          growth: calculateGrowth(auctionsCurrentPeriodCount, auctionsPreviousPeriodCount),
        },
        lots: {
          count: lotsCurrentPeriodCount,
          growth: calculateGrowth(lotsCurrentPeriodCount, lotsPreviousPeriodCount),
        },
        users: {
          count: userCurrentPeriodCount,
          growth: calculateGrowth(userCurrentPeriodCount, userPreviousPeriodCount),
        },
      },
      salesInfo: salesPerDay,
    });
  },
  { role: UserRole.ADMIN, label: 'GET_STATS' }
);

const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) return 0;

    return current * 100;
  }

  return ((current - previous) / previous) * 100;
};
