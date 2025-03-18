import getAuthUser from '@/app/actions/get-auth-user';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== UserRole.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const params: { page?: number; limit?: number } = {
      ...searchParams,
    };

    const { page, limit } = params;

    const userCount = (await prismaDb?.user.count({})) ?? 0;
    const totalCount = userCount > 0 ? userCount - 1 : 0; // without current user
    const totalPages = Math.ceil(totalCount / (limit ? Number(limit) : 5));

    const users = await prismaDb?.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, name: true, emailVerified: true },
      where: {
        id: { not: authUser.id },
      },
      ...(limit && { take: Number(limit) }),
      ...(page && limit && { skip: (Number(page) - 1) * Number(limit) }),
    });

    return NextResponse.json({
      users,
      total: totalCount,
      totalPages,
      page: page || 1,
      limit: limit || totalCount,
    });
  } catch (error) {
    console.error('GET_USERS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
