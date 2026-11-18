import prismaDb from '@/lib/prismadb';
import { parseBody, parseQuery, withAuth } from '@/server/http';
import { isAdmin } from '@/server/auth/policies';
import { createAuctionSchema, listAuctionsQuerySchema } from '@/server/schemas/auction.schema';
import { Auction, AuctionRole, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export const POST = withAuth(
  async ({ request, authUser }) => {
    const { title } = await parseBody(request, createAuctionSchema);

    const auction = await prismaDb.auction.create({
      data: {
        title,
        userAuction: {
          create: { userId: authUser.id, role: AuctionRole.OWNER },
        },
      },
    });

    return NextResponse.json(auction);
  },
  { label: 'CREATE_AUCTION' }
);

export const GET = withAuth(
  async ({ request, authUser }) => {
    const { page, limit, loadForCurrentUser, minLotPrice, maxLotPrice, categories } = parseQuery(
      request,
      listAuctionsQuerySchema
    );

    const userAuctions = await prismaDb.userAuction.findMany({
      where: loadForCurrentUser && !isAdmin(authUser) ? { userId: authUser.id } : {},
      select: { auctionId: true },
    });

    const filters: Prisma.AuctionWhereInput = {
      id: {
        in: userAuctions.map((userAuction) => userAuction.auctionId),
      },
    };

    const lotConditions: Prisma.LotWhereInput[] = [];

    if (minLotPrice !== undefined || maxLotPrice !== undefined) {
      lotConditions.push({
        startBid: {
          ...(minLotPrice !== undefined && { gte: minLotPrice }),
          ...(maxLotPrice !== undefined && { lte: maxLotPrice }),
        },
      });
    }

    if (categories?.length) {
      lotConditions.push({
        lotCategory: {
          some: {
            category: {
              name: {
                in: categories,
              },
            },
          },
        },
      });
    }

    const include = {
      lot: {
        include: {
          photo: {
            orderBy: {
              position: 'asc',
            },
          },
          video: {
            orderBy: {
              position: 'asc',
            },
          },
          lotCategory: {
            include: {
              category: true,
            },
          },
          bid: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
          _count: {
            select: {
              bid: true,
            },
          },
        },
      },
      _count: {
        select: {
          lot: true,
        },
      },
      userAuction: true,
    } satisfies Prisma.AuctionInclude;

    const now = new Date();
    const pageSize = limit;
    const currentPage = page;
    const skip = (currentPage - 1) * pageSize;

    const mergedConditions: Prisma.LotWhereInput = Object.assign({}, ...lotConditions);

    const auctionsCondition: { where: Prisma.AuctionWhereInput }[] = [
      //ACTIVE AUCTIONS
      {
        where: {
          ...filters,
          startDate: { lte: now },
          endDate: { gt: now },
          isPublished: true,
          isApproved: true,
          lot: { some: { AND: [{ isSold: false }, mergedConditions] } },
        },
      },

      // UPCOMING AUCTIONS
      {
        where: {
          ...filters,
          startDate: { gt: now },
          endDate: { gt: now },
          isPublished: true,
          isApproved: true,
          lot: { some: { AND: [{ isSold: false }, mergedConditions] } },
        },
      },

      // ENDED AUCTIONS
      {
        where: {
          ...filters,
          isPublished: true,
          isApproved: true,
          OR: [{ lot: { every: { isSold: true } } }, { endDate: { lt: now } }],
          ...(lotConditions.length > 0 && {
            lot: {
              some: {
                AND: mergedConditions,
              },
            },
          }),
        },
      },

      // DRAFT AUCTIONS
      {
        where: {
          ...filters,
          OR: [
            { isPublished: false, isApproved: false },
            { isPublished: true, isApproved: false },
          ],
        },
      },
    ];

    const [activeCount, upcomingCount, endedCount, draftCount] = await Promise.all(
      auctionsCondition.map((condition) => prismaDb.auction.count({ where: condition.where }))
    );

    let totalCount = activeCount + upcomingCount + endedCount;
    if (loadForCurrentUser) {
      totalCount += draftCount;
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    const auctionsToDisplay: Auction[] = [];
    let remaining = pageSize;
    let currentSkip = skip;

    if (loadForCurrentUser && remaining > 0 && currentSkip < draftCount) {
      const draftAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[3].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...draftAuctions);
      remaining -= draftAuctions.length;
      currentSkip = Math.max(0, currentSkip - draftCount);
    } else {
      currentSkip = Math.max(0, currentSkip - draftCount);
    }

    if (remaining > 0 && currentSkip < activeCount) {
      const activeAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[0].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...activeAuctions);
      remaining -= activeAuctions.length;
      currentSkip = Math.max(0, currentSkip - activeCount);
    } else {
      currentSkip = Math.max(0, currentSkip - activeCount);
    }

    if (remaining > 0 && currentSkip < upcomingCount) {
      const upcomingAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[1].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...upcomingAuctions);
      remaining -= upcomingAuctions.length;
      currentSkip = Math.max(0, currentSkip - upcomingCount);
    } else {
      currentSkip = Math.max(0, currentSkip - upcomingCount);
    }

    if (remaining > 0 && currentSkip < endedCount) {
      const endedAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[2].where,
        include,
        orderBy: {
          endDate: 'desc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...endedAuctions);
    }

    const [maxLotPriceExistedResult, minLotPriceExistedResult] = await Promise.all([
      prismaDb.lot.aggregate({
        where: {
          auction: {
            ...filters,
          },
        },
        _max: {
          startBid: true,
        },
      }),
      prismaDb.lot.aggregate({
        where: {
          auction: {
            ...filters,
          },
        },
        _min: {
          startBid: true,
        },
      }),
    ]);

    return NextResponse.json({
      auctions: auctionsToDisplay,
      total: totalCount,
      totalPages,
      page: currentPage,
      limit: pageSize,
      maxLotPriceExisted: maxLotPriceExistedResult._max.startBid || 0,
      minLotPriceExisted: minLotPriceExistedResult._min.startBid || 0,
      lotCategoriesExistedNames: await getLotCategoriesNames(),
    });
  },
  { label: 'GET_AUCTIONS' }
);

async function getLotCategoriesNames(): Promise<string[]> {
  const categories = await prismaDb.category.findMany({
    where: {
      lotCategory: {
        some: {
          lot: {
            auction: { isPublished: true, isApproved: true },
          },
        },
      },
    },
    select: { name: true },
  });

  return categories.map((category) => category.name);
}
