import getAuthUser from '@/app/actions/get-auth-user';
import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import { CreatePhotoType, DeletePhotoType } from '@/app/utils/type';
import { Photo } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body: CreatePhotoType = await request.json();

  try {
    const uploadedPhotos: Photo[] = [];
    for (const { file, position, name, isImageUploaded, id } of body) {
      if (isImageUploaded) {
        await prismaDb?.photo.update({
          where: {
            id,
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

      const response: Photo | undefined = await prismaDb?.photo.create({
        data: {
          url,
          name,
          position,
          lotId: params.lotId,
          publicId: public_id,
        },
      });

      if (response) {
        uploadedPhotos.push(response);
      }
    }

    return NextResponse.json(uploadedPhotos);
  } catch (error) {
    console.error('CREATE_PHOTO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id }: DeletePhotoType = await request.json();

  try {
    const photo = await prismaDb?.photo.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    await deleteFromCloudinary(photo.publicId);

    const deletedPhoto = await prismaDb?.photo.delete({ where: { id, lotId: params.lotId } });

    await prismaDb?.photo.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          gt: photo.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(deletedPhoto);
  } catch (error) {
    console.error('DELETE_PHOTO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
