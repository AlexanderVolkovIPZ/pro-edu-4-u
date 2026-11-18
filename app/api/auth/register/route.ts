import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import prismaDb from '@/lib/prismadb';
import { HttpError, parseBody, withErrorHandling } from '@/server/http';
import { registerSchema } from '@/server/schemas/auth.schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const POST = withErrorHandling(
  async ({ request }) => {
    const { email, password } = await parseBody(request, registerSchema);

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await prismaDb.user.findUnique({ where: { email } });

    if (existingUser?.password) {
      throw HttpError.conflict('An account with this email already exists');
    }

    // Users who signed up through an OAuth provider may add a password later.
    const user = existingUser
      ? await prismaDb.user.update({ where: { email }, data: { password: hashedPassword } })
      : await prismaDb.user.create({ data: { email, password: hashedPassword } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: 'PRO-EDU-4-U',
      to: email,
      subject: 'Confirm your email',
      html: generateHtmlTemplate('templates/register-confirm.html', [
        {
          key: 'verificationUrl',
          value: verificationUrl,
        },
      ]),
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  },
  { label: 'USER_REGISTER' }
);
