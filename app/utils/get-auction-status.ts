import { Status } from '@prisma/client';
import dayjs from 'dayjs';

type GetAuctionStatusProps = {
  startDate: string;
  endDate: string;
  isAllLotsSold: boolean;
};

export const getAuctionStatus = ({ startDate, endDate, isAllLotsSold }: GetAuctionStatusProps): Status => {
  const now = dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (isAllLotsSold || now.isAfter(end)) return Status.COMPLETED;
  if (now.isBefore(start)) return Status.UPCOMING;

  return Status.IN_PROGRESS;
};
