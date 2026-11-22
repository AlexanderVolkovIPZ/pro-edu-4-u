import prismaDb from '@/lib/prismadb';
import { AuctionRole, PrismaClient, User, UserRole } from '@prisma/client';
import { HttpError } from '../http/http-error';

export type Principal = Pick<User, 'id' | 'role'>;

export const isAdmin = (user: Pick<User, 'role'>) => user.role === UserRole.ADMIN;

/**
 * Authorization rules of the system, in one place. Services call the policy
 * before mutating anything, so the rules hold no matter which transport
 * (REST, WebSocket) triggered the operation.
 */
export class AccessPolicy {
  constructor(private readonly db: PrismaClient = prismaDb) {}

  isAdmin(user: Pick<User, 'role'>): boolean {
    return isAdmin(user);
  }

  async isAuctionOwner(userId: string, auctionId: string): Promise<boolean> {
    const ownership = await this.db.userAuction.findFirst({
      where: { userId, auctionId, role: AuctionRole.OWNER },
      select: { id: true },
    });

    return !!ownership;
  }

  /** Owners of the auction and administrators may manage it (lots, media, settings). */
  async canManageAuction(user: Principal, auctionId: string): Promise<boolean> {
    return this.isAdmin(user) || this.isAuctionOwner(user.id, auctionId);
  }

  async assertCanManageAuction(user: Principal, auctionId: string): Promise<void> {
    if (!(await this.canManageAuction(user, auctionId))) {
      throw HttpError.forbidden('You are not allowed to manage this auction');
    }
  }

  assertAdmin(user: Principal): void {
    if (!this.isAdmin(user)) {
      throw HttpError.forbidden();
    }
  }

  /** A user may act on their own account; administrators may act on any account. */
  assertSelfOrAdmin(user: Principal, targetUserId: string): void {
    if (user.id !== targetUserId && !this.isAdmin(user)) {
      throw HttpError.forbidden();
    }
  }
}

export const accessPolicy = new AccessPolicy();
