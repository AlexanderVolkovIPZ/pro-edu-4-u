import { HttpError, withErrorHandling } from '@/server/http';
import { paymentService } from '@/server/services';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

export const POST = withErrorHandling(
  async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      throw HttpError.badRequest('Missing Stripe signature');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new HttpError(500, 'Missing webhook secret');
    }

    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw HttpError.badRequest('Webhook signature verification failed');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await paymentService.handleCheckoutCompleted(session.metadata);
    } else {
      console.error(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  },
  { label: 'STRIPE_WEBHOOK' }
);
