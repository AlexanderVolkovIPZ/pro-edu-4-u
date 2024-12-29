import { Auction, Category, Lot, LotCategory, Photo, UserAuction } from '@prisma/client';

export type AuctionWithRelationsType = Auction & {
  lot: (Lot & { photo: Photo[]; lotCategory: (LotCategory & { category: Category })[] })[];
  userAuction: UserAuction[];
};
