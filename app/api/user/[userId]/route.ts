import getAuthUser from '@/app/actions/get-auth-user';
import { User, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;
    const isOwner = authUser.id === params.userId;
    if (!isAuthUserAdmin && !isOwner) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { name, email, emailVerified, image, password, role }: Partial<User> = body;

    const updatedUser = await prismaDb?.user.update({
      where: {
        id: params.userId,
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(emailVerified && { emailVerified }),
        ...(image && { image }),
        ...(password && { password }),
        ...(role && { role }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('UPDATE_USER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (authUser.role !== UserRole.ADMIN || authUser.id === params.userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const user = await prismaDb?.user.findFirst({
      where: {
        id: params.userId,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const deletedUser = await prismaDb?.user.delete({
      where: {
        id: params.userId,
      },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('DELETE_USER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
