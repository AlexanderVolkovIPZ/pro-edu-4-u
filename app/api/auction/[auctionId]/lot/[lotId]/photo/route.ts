import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { deleteMediaSchema, uploadMediaSchema } from '@/server/schemas/media.schema';
import { Photo } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const body = await parseBody(request, uploadMediaSchema);

    const uploaded: Photo[] = [];
    for (const { file, position, name, isFileUploaded, id } of body) {
      if (isFileUploaded) {
        await prismaDb.photo.update({
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
      });

      const created = await prismaDb.photo.create({
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
  { label: 'CREATE_PHOTO' }
);

export const DELETE = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { id } = await parseBody(request, deleteMediaSchema);

    const media = await prismaDb.photo.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!media) {
      throw HttpError.notFound('Photo not found');
    }

    await deleteFromCloudinary(media.publicId);

    const deleted = await prismaDb.photo.delete({ where: { id, lotId: params.lotId } });

    await prismaDb.photo.updateMany({
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
  { label: 'DELETE_PHOTO' }
);
