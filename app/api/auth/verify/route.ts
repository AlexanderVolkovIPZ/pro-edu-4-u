import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import prismaDb from '@/lib/prismadb';
import { HttpError, parseQuery, withErrorHandling } from '@/server/http';
import { verifyEmailQuerySchema } from '@/server/schemas/auth.schema';
import jwt from 'jsonwebtoken';

export const GET = withErrorHandling(
  async ({ request }) => {
    const { token } = parseQuery(request, verifyEmailQuerySchema);

    let userId: string;
    try {
      ({ userId } = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string });
    } catch {
      throw HttpError.badRequest('Invalid or expired token!');
    }

    await prismaDb.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    const htmlContent = generateHtmlTemplate('templates/registration-successful.html');

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });
  },
  { label: 'VERIFY_EMAIL' }
);
