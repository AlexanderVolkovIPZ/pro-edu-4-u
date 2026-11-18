import { parseBody, withAuth } from '@/server/http';
import { adminUpdateUserSchema } from '@/server/schemas/user.schema';
import { userService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { userId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const input = await parseBody(request, adminUpdateUserSchema);
    const user = await userService.update(authUser, params.userId, input);

    return NextResponse.json(user);
  },
  { label: 'UPDATE_USER' }
);
