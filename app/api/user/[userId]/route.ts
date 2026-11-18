import getAuthUser from '@/app/actions/get-auth-user';
import { User, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

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
    const { name, email, emailVerified, image, password, role, isActive }: Partial<User> = body;

    const updatedUser = await prismaDb.user.update({
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
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('UPDATE_USER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
