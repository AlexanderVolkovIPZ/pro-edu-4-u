import { deleteFromCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction, canManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { updateLotSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const GET = withAuth<Params>(
  async ({ params, authUser }) => {
    // Owners and administrators see every lot (including drafts); everybody
    // else only sees lots of published and approved auctions.
    const isManager = await canManageAuction(authUser, params.auctionId);

    const lot = await prismaDb.lot.findFirst({
      where: {
        id: params.lotId,
        auctionId: params.auctionId,
        ...(!isManager && { auction: { isPublished: true, isApproved: true } }),
      },
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
        lotDetail: true,
        lotCategory: {
          include: {
            category: true,
          },
        },
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
      },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    return NextResponse.json(lot);
  },
  { label: 'GET_LOT' }
);

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const data = await parseBody(request, updateLotSchema);

    const lot = await prismaDb.lot.update({
      data,
      where: {
        id: params.lotId,
        auctionId: params.auctionId,
      },
    });

    return NextResponse.json(lot);
  },
  { label: 'UPDATE_LOT' }
);

export const DELETE = withAuth<Params>(
  async ({ params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const photos = await prismaDb.photo.findMany({ where: { lotId: params.lotId } });
    const videos = await prismaDb.video.findMany({ where: { lotId: params.lotId } });

    for (const photo of photos) {
      await deleteFromCloudinary(photo.publicId);
    }

    for (const video of videos) {
      await deleteFromCloudinary(video.publicId, { resource_type: 'video' });
    }

    const lot = await prismaDb.lot.delete({
      where: {
        id: params.lotId,
        auctionId: params.auctionId,
      },
      include: {
        photo: true,
        video: true,
      },
    });

    return NextResponse.json(lot);
  },
  { label: 'DELETE_LOT' }
);
