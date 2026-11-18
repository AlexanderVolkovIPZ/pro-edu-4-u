import prismaDb from '@/lib/prismadb';
import { parseQuery, withAuth } from '@/server/http';
import { listUsersQuerySchema } from '@/server/schemas/user.schema';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const { page, limit } = parseQuery(request, listUsersQuerySchema);

    const where = { id: { not: authUser.id } };

    const totalCount = await prismaDb.user.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const users = await prismaDb.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, name: true, emailVerified: true, isActive: true },
      where,
      take: limit,
      skip: (page - 1) * limit,
    });

    return NextResponse.json({
      users,
      total: totalCount,
      totalPages,
      page,
      limit,
    });
  },
  { role: UserRole.ADMIN, label: 'GET_USERS' }
);
