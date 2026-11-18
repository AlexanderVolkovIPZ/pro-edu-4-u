import { parseBody, withAuth } from '@/server/http';
import { createPaymentSchema } from '@/server/schemas/payment.schema';
import { paymentService } from '@/server/services';
import { NextResponse } from 'next/server';

export const POST = withAuth(
  async ({ request, authUser }) => {
    const input = await parseBody(request, createPaymentSchema);
    const session = await paymentService.createCheckoutSession(authUser, input);

    return NextResponse.json(session);
  },
  { label: 'PAYMENT_AUCTION' }
);
