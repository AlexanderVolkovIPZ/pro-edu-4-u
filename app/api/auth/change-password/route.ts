import prismaDb from '@/lib/prismadb';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { changePasswordSchema } from '@/server/schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export const PUT = withAuth(
  async ({ request, authUser }) => {
    const { oldPassword, newPassword } = await parseBody(request, changePasswordSchema);

    const user = await prismaDb.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      throw HttpError.badRequest('Password change is not allowed for accounts authenticated via external providers');
    }

    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrectPassword) {
      throw HttpError.forbidden('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prismaDb.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  },
  { label: 'PASSWORD_UPDATE' }
);
