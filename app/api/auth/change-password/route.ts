import { getSession } from '@/app/actions/get-session';
import prismaDb from '@/lib/prismadb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    const user = await prismaDb.user.findUnique({
      where: {
        email: session.user?.email ?? undefined,
      },
    });

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!user.password) {
      return new NextResponse('Password change is not allowed for accounts authenticated via external providers', {
        status: 400,
      });
    }

    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrectPassword) {
      return new NextResponse('Forbidden', {
        status: 403,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prismaDb.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('PASSWORD_UPDATE_ERROR-> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
