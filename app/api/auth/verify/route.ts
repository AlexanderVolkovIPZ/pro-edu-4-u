import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import { parseQuery, withErrorHandling } from '@/server/http';
import { verifyEmailQuerySchema } from '@/server/schemas/auth.schema';
import { authService } from '@/server/services';

export const GET = withErrorHandling(
  async ({ request }) => {
    const { token } = parseQuery(request, verifyEmailQuerySchema);
    await authService.verifyEmail(token);

    return new Response(generateHtmlTemplate('templates/registration-successful.html'), {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });
  },
  { label: 'VERIFY_EMAIL' }
);
