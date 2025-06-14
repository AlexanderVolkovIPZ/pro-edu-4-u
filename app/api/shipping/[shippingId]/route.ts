import getAuthUser from '@/app/actions/get-auth-user';
import { Shipping, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function PATCH(request: Request, { params }: { params: { shippingId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;
    if (!isAuthUserAdmin) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const body = await request.json();

    delete body.id;
    const data: Partial<Omit<Shipping, 'id'>> = body;

    const shipping = await prismaDb.shipping.update({
      data,
      where: {
        id: params.shippingId,
      },
    });

    return NextResponse.json(shipping);
  } catch (error) {
    console.error('UPDATE_SHIPPING_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
