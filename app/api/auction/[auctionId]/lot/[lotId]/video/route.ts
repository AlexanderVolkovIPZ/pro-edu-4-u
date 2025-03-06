import getAuthUser from '@/app/actions/get-auth-user';
import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import { CreateFileType, DeleteFileType } from '@/app/types';
import { Video } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: CreateFileType<Video> = await request.json();

    const uploadedVideos: Video[] = [];
    for (const { file, position, name, isFileUploaded, id } of body) {
      if (isFileUploaded) {
        await prismaDb?.video.update({
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
        resource_type: 'video',
      });

      const response: Video | undefined = await prismaDb?.video.create({
        data: {
          url,
          name,
          position,
          lotId: params.lotId,
          publicId: public_id,
        },
      });

      if (response) {
        uploadedVideos.push(response);
      }
    }

    return NextResponse.json(uploadedVideos);
  } catch (error) {
    console.error('CREATE_VIDEO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id }: DeleteFileType = await request.json();

    const video = await prismaDb?.video.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    await deleteFromCloudinary(video.publicId, { resource_type: 'video' });

    const deletedVideo = await prismaDb?.video.delete({ where: { id, lotId: params.lotId } });

    await prismaDb?.video.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          gt: video.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(deletedVideo);
  } catch (error) {
    console.error('DELETE_VIDEO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
