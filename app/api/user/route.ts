import { parseQuery, withAuth } from '@/server/http';
import { listUsersQuerySchema } from '@/server/schemas/user.schema';
import { userService } from '@/server/services';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const query = parseQuery(request, listUsersQuerySchema);
    const page = await userService.list(authUser, query);

    return NextResponse.json(page);
  },
  { label: 'GET_USERS' }
);
