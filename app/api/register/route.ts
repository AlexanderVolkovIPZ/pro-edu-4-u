import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import prismaDb from '@/lib/prismadb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    let user = null;

    user = await prismaDb.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await prismaDb.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;

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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('USER_REGISTER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
