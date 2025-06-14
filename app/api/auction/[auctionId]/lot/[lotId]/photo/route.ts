import getAuthUser from '@/app/actions/get-auth-user';
import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import { CreateFileType, DeleteFileType } from '@/app/types';
import { AuctionRole, Photo, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function POST(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: CreateFileType<Photo> = await request.json();

    const uploadedPhotos: Photo[] = [];
    for (const { file, position, name, isFileUploaded, id } of body) {
      if (isFileUploaded) {
        await prismaDb.photo.update({
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

      const response: Photo | undefined = await prismaDb.photo.create({
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
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userAuction = await prismaDb.userAuction.findFirst({
      where: {
        userId: authUser.id,
        auctionId: params.auctionId,
        role: AuctionRole.OWNER,
      },
    });

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;
    if (!userAuction && !isAuthUserAdmin) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const { id }: DeleteFileType = await request.json();

    const photo = await prismaDb.photo.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    await deleteFromCloudinary(photo.publicId);

    const deletedPhoto = await prismaDb.photo.delete({ where: { id, lotId: params.lotId } });

    await prismaDb.photo.updateMany({
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
