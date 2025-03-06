import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import prismaDb from '@/lib/prismadb';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
dayjs.extend(utc);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { userId: string };
    await prismaDb.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: dayjs().utc(true).toDate() },
    });

    const htmlContent = generateHtmlTemplate('templates/registration-successful.html');

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });
  } catch {
    return new NextResponse('Invalid or expired token!', { status: 400 });
  }
}
