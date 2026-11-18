import { AuctionRole, User, UserRole } from '@prisma/client';
import prismaDb from '@/lib/prismadb';
import { HttpError } from '../http/http-error';

type Principal = Pick<User, 'id' | 'role'>;

export const isAdmin = (user: Pick<User, 'role'>) => user.role === UserRole.ADMIN;

export async function isAuctionOwner(userId: string, auctionId: string): Promise<boolean> {
  const ownership = await prismaDb.userAuction.findFirst({
    where: { userId, auctionId, role: AuctionRole.OWNER },
    select: { id: true },
  });

  return !!ownership;
}

/** Owners of the auction and administrators may manage it (lots, media, settings). */
export async function canManageAuction(user: Principal, auctionId: string): Promise<boolean> {
  return isAdmin(user) || isAuctionOwner(user.id, auctionId);
}

export async function assertCanManageAuction(user: Principal, auctionId: string): Promise<void> {
  if (!(await canManageAuction(user, auctionId))) {
    throw HttpError.forbidden('You are not allowed to manage this auction');
  }
}

export function assertAdmin(user: Principal): void {
  if (!isAdmin(user)) {
    throw HttpError.forbidden();
  }
}

/** A user may act on their own account; administrators may act on any account. */
export function assertSelfOrAdmin(user: Principal, targetUserId: string): void {
  if (user.id !== targetUserId && !isAdmin(user)) {
    throw HttpError.forbidden();
  }
}
