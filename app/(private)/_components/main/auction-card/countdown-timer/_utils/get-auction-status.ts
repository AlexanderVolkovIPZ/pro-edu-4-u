import dayjs from 'dayjs';

type GetAuctionStatusProps = {
  startDate: string;
  endDate: string;
  isAllLotsSold: boolean;
};

export type AuctionStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export const getAuctionStatus = ({ startDate, endDate, isAllLotsSold }: GetAuctionStatusProps): AuctionStatus => {
  const now = dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (isAllLotsSold || now.isAfter(end)) return 'COMPLETED';
  if (now.isBefore(start)) return 'UPCOMING';

  return 'IN_PROGRESS';
};
