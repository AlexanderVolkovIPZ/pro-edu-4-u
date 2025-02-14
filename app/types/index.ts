import { Auction, Category, Lot, LotCategory, Photo, UserAuction, Video, LotDetail, Bid, User } from '@prisma/client';

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
  bid: (Bid & {
    user: Pick<User, 'id' | 'name'>;
  })[];
  photo: Photo[];
  video: Video[];
  lotCategory: (LotCategory & { category: Category })[];
  lotDetail: LotDetail[];
};

export type AuctionWithStringDates = Omit<Auction, 'startDate' | 'endDate'> & {
  startDate: string;
  endDate: string;
};

export type AuctionWithRelationsType = AuctionWithStringDates & {
  lot: LotWithRelationsType[];
  userAuction: UserAuction[];
};

export type AuctionWithLotsType = Auction & { lot: Lot[] };

export type CreateLotCategoriesType = {
  categoryIds: LotCategory['categoryId'][];
};

export type CreateLotDetailsType = Pick<LotDetail, 'fieldName' | 'fieldValue' | 'iconName'>[];
