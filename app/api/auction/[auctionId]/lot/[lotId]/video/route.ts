import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { deleteMediaSchema, uploadMediaSchema } from '@/server/schemas/media.schema';
import { Video } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const body = await parseBody(request, uploadMediaSchema);

    const uploaded: Video[] = [];
    for (const { file, position, name, isFileUploaded, id } of body) {
      if (isFileUploaded) {
        await prismaDb.video.update({
          where: {
            id,
            lotId: params.lotId,
          },
          data: {
            position,
          },
        });

        continue;
      }

      const { url, public_id } = await uploadToCloudinary(file, {
        folder: process.env.CLOUDINARY_FOLDER_NAME,
        resource_type: 'video',
      });

      const created = await prismaDb.video.create({
        data: {
          url,
          name,
          position,
          lotId: params.lotId,
          publicId: public_id,
        },
      });

      uploaded.push(created);
    }

    return NextResponse.json(uploaded);
  },
  { label: 'CREATE_VIDEO' }
);

export const DELETE = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { id } = await parseBody(request, deleteMediaSchema);

    const media = await prismaDb.video.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!media) {
      throw HttpError.notFound('Video not found');
    }

    await deleteFromCloudinary(media.publicId, { resource_type: 'video' });

    const deleted = await prismaDb.video.delete({ where: { id, lotId: params.lotId } });

    await prismaDb.video.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          gt: media.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(deleted);
  },
  { label: 'DELETE_VIDEO' }
);
