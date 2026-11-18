import prismaDb from '@/lib/prismadb';
import { assertSelfOrAdmin, isAdmin } from '@/server/auth/policies';
import { parseBody, withAuth } from '@/server/http';
import { adminUpdateUserSchema, updateProfileSchema } from '@/server/schemas/user.schema';
import { NextResponse } from 'next/server';

type Params = { userId: string };

/**
 * Users may edit their own profile fields; only administrators may change
 * email, role or activity status. Passwords are changed through
 * `/api/auth/change-password`, never through this endpoint.
 */
export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    assertSelfOrAdmin(authUser, params.userId);

    const data = await parseBody(request, isAdmin(authUser) ? adminUpdateUserSchema : updateProfileSchema);

    const updatedUser = await prismaDb.user.update({
      where: {
        id: params.userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  },
  { label: 'UPDATE_USER' }
);
