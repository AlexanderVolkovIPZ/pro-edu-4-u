import getAuthUser from '@/app/actions/get-auth-user';
import { UserRole } from '@prisma/client';
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== UserRole.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const { days } = searchParams;

    const salesPeriod = new Date(Date.now() - 1000 * 60 * 60 * 24 * Number(days));
    const salesData = await prismaDb?.bid.findMany({
      where: { isPaid: true, createdAt: { gte: salesPeriod } },
      select: { createdAt: true },
    });

    const salesPerDay: Record<string, number> = {};
    salesData?.forEach((sale) => {
      const date = dayjs(sale.createdAt).format('YYYY-MM-DD');
      salesPerDay[date] = (salesPerDay[date] || 0) + 1;
    });

    const comparePeriod = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 2);
    const statsPeriod = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 1);

    const auctionsPreviosPeriodCount =
      (await prismaDb?.auction.count({
        where: { isPublished: true, createdAt: { gte: comparePeriod, lte: statsPeriod } },
      })) ?? 0;
    const auctionsCurrentPeriodCount =
      (await prismaDb?.auction.count({
        where: { isPublished: true, createdAt: { gte: statsPeriod } },
      })) ?? 0;
    const growthAuctionsCount = calculateGrowth(auctionsCurrentPeriodCount, auctionsPreviosPeriodCount);

    const lotsPreviosPeriodCount =
      (await prismaDb?.lot.count({
        where: { isSold: false, auction: { isPublished: true }, createdAt: { gte: comparePeriod, lte: statsPeriod } },
      })) ?? 0;
    const lotsCurrentPeriodCount =
      (await prismaDb?.lot.count({
        where: { isSold: false, auction: { isPublished: true }, createdAt: { gte: statsPeriod } },
      })) ?? 0;
    const growthLotsCount = calculateGrowth(lotsCurrentPeriodCount, lotsPreviosPeriodCount);

    const userPreviosPeriodCount =
      (await prismaDb?.user.count({ where: { createdAt: { gte: comparePeriod, lte: statsPeriod } } })) ?? 0;
    const userCurrentPeriodCount = (await prismaDb?.user.count({ where: { createdAt: { gte: statsPeriod } } })) ?? 0;
    const growthUserCount = calculateGrowth(userCurrentPeriodCount, userPreviosPeriodCount);

    const result = {
      statInfo: {
        auctions: {
          count: auctionsCurrentPeriodCount,
          growth: growthAuctionsCount,
        },
        lots: {
          count: lotsCurrentPeriodCount,
          growth: growthLotsCount,
        },
        users: {
          count: userCurrentPeriodCount,
          growth: growthUserCount,
        },
      },
      salesInfo: salesPerDay,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET_STATS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

const calculateGrowth = (current: number, previous: number) => {
  if (previous > 0) {
    return current > previous ? (current * 100) / previous : -((current * 100) / previous);
  }

  return current * 100;
};
