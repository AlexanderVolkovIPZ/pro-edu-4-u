import prismaDb from '@/lib/prismadb';
import { isAdmin } from '@/server/auth/policies';
import { parseQuery, withAuth } from '@/server/http';
import { listBidsQuerySchema } from '@/server/schemas/bid.schema';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const { lotId, lotsId, bidderId, isWinner, isPaid } = parseQuery(request, listBidsQuerySchema);

    const where: Prisma.BidWhereInput = {
      // Regular users may only list their own bids.
      bidderId: isAdmin(authUser) ? bidderId : authUser.id,
      ...(lotId && { lotId }),
      ...(lotsId?.length && { lotId: { in: lotsId } }),
      ...(isWinner !== undefined && { isWinner }),
      ...(isPaid !== undefined && { isPaid }),
    };

    const bids = await prismaDb.bid.findMany({
      where,
      include: {
        lot: {
          include: {
            photo: true,
            video: true,
            auction: true,
            lotCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bids);
  },
  { label: 'GET_BIDS' }
);
