import prismaDb from '@/lib/prismadb';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const DAY_MS = 1000 * 60 * 60 * 24;
const PERIOD_DAYS = 30;

export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) {
    return current === 0 ? 0 : current * 100;
  }

  return ((current - previous) / previous) * 100;
};

export class StatsService {
  constructor(private readonly db: PrismaClient = prismaDb) {}

  /** Growth of auctions, lots and users over the last 30 days, plus sales per day for the requested period. */
  async getAdminStats(days: number, now: number = Date.now()) {
    const salesSince = new Date(now - DAY_MS * days);
    const currentPeriodStart = new Date(now - DAY_MS * PERIOD_DAYS);
    const previousPeriodStart = new Date(now - DAY_MS * PERIOD_DAYS * 2);

    const previousPeriod = { gte: previousPeriodStart, lte: currentPeriodStart };
    const currentPeriod = { gte: currentPeriodStart };

    const [sales, auctionsPrevious, auctionsCurrent, lotsPrevious, lotsCurrent, usersPrevious, usersCurrent] =
      await Promise.all([
        this.db.bid.findMany({
          where: { isPaid: true, isWinner: true, updatedAt: { gte: salesSince } },
          select: { createdAt: true },
        }),
        this.db.auction.count({ where: { isPublished: true, createdAt: previousPeriod } }),
        this.db.auction.count({ where: { isPublished: true, createdAt: currentPeriod } }),
        this.db.lot.count({ where: { auction: { isPublished: true }, createdAt: previousPeriod } }),
        this.db.lot.count({ where: { auction: { isPublished: true }, createdAt: currentPeriod } }),
        this.db.user.count({ where: { createdAt: previousPeriod } }),
        this.db.user.count({ where: { createdAt: currentPeriod } }),
      ]);

    const salesPerDay: Record<string, number> = {};
    for (const sale of sales) {
      const date = dayjs(sale.createdAt).format('YYYY-MM-DD');
      salesPerDay[date] = (salesPerDay[date] || 0) + 1;
    }

    return {
      statInfo: {
        auctions: { count: auctionsCurrent, growth: calculateGrowth(auctionsCurrent, auctionsPrevious) },
        lots: { count: lotsCurrent, growth: calculateGrowth(lotsCurrent, lotsPrevious) },
        users: { count: usersCurrent, growth: calculateGrowth(usersCurrent, usersPrevious) },
      },
      salesInfo: salesPerDay,
    };
  }
}

export const statsService = new StatsService();
