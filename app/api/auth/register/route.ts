import { parseBody, withErrorHandling } from '@/server/http';
import { registerSchema } from '@/server/schemas/auth.schema';
import { authService } from '@/server/services';
import { NextResponse } from 'next/server';

export const POST = withErrorHandling(
  async ({ request }) => {
    const input = await parseBody(request, registerSchema);
    const user = await authService.register(input);

    return NextResponse.json(user, { status: 201 });
  },
  { label: 'USER_REGISTER' }
);
