import prismaDb from '@/lib/prismadb';
import { AuctionRole, Prisma, PrismaClient, ShippingStatus } from '@prisma/client';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { ListOrdersQuery } from '../schemas/order.schema';

const orderListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  city: true,
  address: true,
  postalCode: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true } },
  lot: {
    select: {
      id: true,
      title: true,
      auction: {
        select: {
          id: true,
          userAuction: { select: { role: true, userId: true } },
        },
      },
    },
  },
} satisfies Prisma.ShippingSelect;

export class OrderService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy
  ) {}

  /**
   * `my-orders`: purchases of the user; `sent-orders`: undelivered orders for
   * lots the user sells; `all-orders` (or no tab): everything for
   * administrators, own purchases for everybody else.
   */
  async list(user: Principal, { page, limit, tab }: ListOrdersQuery) {
    const where = this.buildListFilter(user, tab);

    const [total, orders] = await Promise.all([
      this.db.shipping.count({ where }),
      this.db.shipping.findMany({
        where,
        select: orderListSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
    ]);

    return { orders, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  /** The customer, the seller of the lot and administrators may see an order. */
  async getById(user: Principal, orderId: string) {
    const order = await this.db.shipping.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true } },
        lot: {
          select: {
            id: true,
            title: true,
            photo: true,
            bid: { where: { isWinner: true }, take: 1 },
            auctionId: true,
            auction: { select: { userAuction: { select: { userId: true, role: true } } } },
          },
        },
      },
    });

    if (!order) {
      throw HttpError.notFound('Order not found');
    }

    const isCustomer = user.id === order.userId;
    const isSeller = order.lot.auction.userAuction.some(
      ({ userId, role }) => userId === user.id && role === AuctionRole.OWNER
    );

    if (!this.policy.isAdmin(user) && !isCustomer && !isSeller) {
      throw HttpError.forbidden();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { auction, ...lot } = order.lot;

    return { ...order, lot };
  }

  async updateStatus(admin: Principal, shippingId: string, status: ShippingStatus) {
    this.policy.assertAdmin(admin);

    return this.db.shipping.update({ where: { id: shippingId }, data: { status } });
  }

  private buildListFilter(user: Principal, tab: ListOrdersQuery['tab']): Prisma.ShippingWhereInput | undefined {
    if (tab === 'sent-orders') {
      return {
        lot: {
          auction: {
            userAuction: { some: { userId: user.id, role: AuctionRole.OWNER } },
          },
        },
        status: { not: ShippingStatus.DELIVERED },
      };
    }

    if (tab === 'my-orders' || !this.policy.isAdmin(user)) {
      return { userId: user.id };
    }

    return undefined;
  }
}

export const orderService = new OrderService();
