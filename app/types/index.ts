import { Auction, Category, Lot, LotCategory, Photo, UserAuction, Video } from '@prisma/client';

export type CreateFileType<T extends Photo | Video> = {
  id: T['id'];
  position: T['position'];
  name: T['name'];
  file: string;
  isFileUploaded: boolean;
}[];

export type DeleteFileType = { id: string };

export type ReorderFileType = {
  id: string;
  position: number;
};

export type LotWithRelationsType = Lot & {
  photo: Photo[];
  video: Video[];
  lotCategory: (LotCategory & { category: Category })[];
};

export type AuctionWithRelationsType = Auction & {
  lot: LotWithRelationsType[];
  userAuction: UserAuction[];
};

export type AuctionWithLotsType = Auction & { lot: Lot[] };

export type CreateLotCategoriesType = {
  lotId: LotCategory['lotId'];
  categoryIds: LotCategory['categoryId'][];
};
