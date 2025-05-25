import prismaDb from '@/lib/prismadb';
import { BidType } from '@prisma/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await (await req.blob()).text();
    const signature = headers().get('stripe-signature') as string;

    if (!signature) {
      return new NextResponse('Missing Stripe signature', { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse('Missing webhook secret', { status: 500 });
    }

    let event;
    try {
      event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
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
      const bidType = session?.metadata?.bidType as BidType;

      if (
        !userId ||
        !lotsId ||
        !address ||
        !city ||
        !postalCode ||
        !phone ||
        !firstName ||
        !lastName ||
        !email ||
        !bidType
      ) {
        console.error('Missing required metadata:', {
          userId: !!userId,
          lotsId: !!lotsId,
          address: !!address,
          city: !!city,
          postalCode: !!postalCode,
          phone: !!phone,
          firstName: !!firstName,
          lastName: !!lastName,
          email: !!email,
          bidType: !!bidType,
        });
        return new NextResponse('Webhook Error: Missing required metadata', {
          status: 400,
        });
      }

      if (bidType === BidType.BIDDING) {
        await prismaDb.bid.updateMany({
          data: {
            isPaid: true,
          },
          where: {
            lotId: {
              in: Array.isArray(lotsId) ? lotsId : [lotsId],
            },
            bidderId: userId,
            isWinner: true,
          },
        });
      } else if (bidType === BidType.INSTANT) {
        const lotId = Array.isArray(lotsId) ? lotsId[0] : lotsId;
        const lot = await prismaDb.lot.findFirst({
          where: {
            id: lotId,
          },
        });

        if (!lot?.buyNowBid) {
          return new NextResponse('Webhook Error: Missing buy now bid', { status: 400 });
        }

        await prismaDb.bid.create({
          data: {
            amount: lot.buyNowBid,
            lotId,
            bidderId: userId,
            isPaid: true,
            isWinner: true,
            type: BidType.INSTANT,
          },
        });

        await prismaDb.lot.update({
          data: {
            isSold: true,
          },
          where: {
            id: lotId,
          },
        });
      }

      const shippingData = {
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
        await prismaDb.shipping.create({
          data: {
            ...shippingData,
            lotId: lotsId,
          },
        });
      } else {
        await prismaDb.shipping.createMany({
          data: lotsId.map((lotId) => ({
            ...shippingData,
            lotId,
          })),
        });
      }
    } else {
      console.error(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse('Webhook Error: Unknown error occurred', { status: 500 });
  }
}
