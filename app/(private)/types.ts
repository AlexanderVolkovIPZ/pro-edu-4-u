import { Auction, AuctionCategory, Category, Lot, Photo, UserAuction } from '@prisma/client';

export type AuctionWithRelationsType = Auction & {
  lot: (Lot & { photo: Photo[] })[];
  userAuction: UserAuction[];
  auctionCategory: (AuctionCategory & { category: Category })[];
};
