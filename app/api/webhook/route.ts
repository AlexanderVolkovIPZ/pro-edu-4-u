import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    const event: Stripe.Event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session?.metadata?.userId;
    const lotsId = session?.metadata?.lotsId ? JSON.parse(session.metadata.lotsId) : [];
    const address = session?.metadata?.address;
    const city = session?.metadata?.city;
    const postalCode = session?.metadata?.postalCode;
    const phone = session?.metadata?.phone;
    const firstName = session?.metadata?.firstName;
    const lastName = session?.metadata?.lastName;
    const email = session?.metadata?.email;

    if (event.type === 'checkout.session.completed') {
      if (!userId || !lotsId || !address || !city || !postalCode || !phone || !firstName || !lastName || !email) {
        return new NextResponse(`Webhook Error: Missing metadata`, {
          status: 400,
        });
      }

      await prismaDb?.bid.updateMany({
        data: {
          isPaid: true,
        },
        where: {
          lotId: {
            in: Array.isArray(lotsId) ? lotsId : [lotsId],
          },
        },
      });

      const data = {
        email,
        firstName,
        lastName,
        phone,
        city,
        address,
        postalCode,
        userId,
      };

      if (!Array.isArray(lotsId)) {
        await prismaDb?.shipping.create({
          data: {
            ...data,
            lotId: lotsId,
          },
        });
      } else {
        await prismaDb?.shipping.createMany({
          data: lotsId.map((lotId) => ({
            ...data,
            lotId,
          })),
        });
      }
    } else {
      return new NextResponse(`Webhook Error: Unhandled event type ${event.type}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error}`, { status: 500 });
  }
}
