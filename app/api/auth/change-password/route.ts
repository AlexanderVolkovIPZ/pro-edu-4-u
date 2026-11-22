import { parseBody, withAuth } from '@/server/http';
import { changePasswordSchema } from '@/server/schemas/auth.schema';
import { authService } from '@/server/services';
import { NextResponse } from 'next/server';

export const PUT = withAuth(
  async ({ request, authUser }) => {
    const input = await parseBody(request, changePasswordSchema);
    await authService.changePassword(authUser.id, input);

    return NextResponse.json({ success: true });
  },
  { label: 'PASSWORD_UPDATE' }
);
