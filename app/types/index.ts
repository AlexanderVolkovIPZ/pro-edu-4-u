import { Auction, Lot, LotCategory, Photo, Video } from '@prisma/client';

export type CreatePhotoType = {
  id: Photo['id'];
  position: Photo['position'];
  name: Photo['name'];
  file: string;
  isImageUploaded: boolean;
}[];

export type DeletePhotoType = { id: string };

export type ReorderPhotoType = {
  id: string;
  position: number;
};

export type CreateVideoType = {
  id: Video['id'];
  position: Video['position'];
  name: Video['name'];
  file: string;
  isVideoUploaded: boolean;
}[];

export type DeleteVideoType = { id: string };

export type ReorderVideoType = {
  id: string;
  position: number;
};

export type AuctionWithLotsType = Auction & { lot: Lot[] };

export type AuctionWithLotsWithPhotosType = Auction & {
  startDate: string;
  endDate: string;
  description: string;
  lot: (Lot & { photo: Photo[]; lotCategory: LotCategory[] })[];
};

export type CreateLotCategoriesType = {
  lotId: LotCategory['lotId'];
  categoryIds: LotCategory['categoryId'][];
};
