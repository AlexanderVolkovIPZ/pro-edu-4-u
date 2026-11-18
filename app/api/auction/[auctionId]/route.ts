import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction, isAdmin } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { auctionAccessModeSchema, updateAuctionSchema } from '@/server/schemas/auction.schema';
import { AuctionRole, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const GET = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const mode = auctionAccessModeSchema.parse(request.headers.get('x-access-mode'));

    const filters: Prisma.AuctionWhereInput =
      mode === 'edit' && !isAdmin(authUser)
        ? {
            userAuction: {
              some: {
                userId: authUser.id,
                role: AuctionRole.OWNER,
              },
            },
          }
        : {};

    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
        ...filters,
      },
      include: {
        lot: {
          orderBy: {
            position: 'asc',
          },
          include: {
            bid: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
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
            lotDetail: true,
            lotCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      throw HttpError.notFound('Auction not found');
    }

    return NextResponse.json(auction);
  },
  { label: 'GET_AUCTION' }
);

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { isApproved, ...data } = await parseBody(request, updateAuctionSchema);

    // Only administrators approve auctions; owners can publish them for review.
    const approvalChange = isAdmin(authUser) ? isApproved : undefined;

    if (approvalChange) {
      const auction = await prismaDb.auction.findUnique({ where: { id: params.auctionId } });

      if (!auction) {
        throw HttpError.notFound('Auction not found');
      }

      const isStartDateInThePast = !auction.startDate || auction.startDate < new Date();
      if (isStartDateInThePast) {
        throw HttpError.badRequest('Start date cannot be in the past');
      }
    }

    const auction = await prismaDb.auction.update({
      data: {
        ...data,
        ...(approvalChange !== undefined && { isApproved: approvalChange }),
      },
      where: {
        id: params.auctionId,
      },
    });

    return NextResponse.json(auction);
  },
  { label: 'UPDATE_AUCTION' }
);

export const DELETE = withAuth<Params>(
  async ({ params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const deletedAuction = await prismaDb.auction.delete({
      where: {
        id: params.auctionId,
      },
    });

    return NextResponse.json(deletedAuction);
  },
  { label: 'DELETE_AUCTION' }
);
