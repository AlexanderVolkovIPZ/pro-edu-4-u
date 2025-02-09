import { TimeLeftType } from '@/app/hooks/use-lot-date';
import { Lot } from '@prisma/client';

export type LotInfo = Pick<Lot, 'id' | 'title'> & {
  status: string;
  startDate: string;
  endDate: string;
  timeStartLeft: TimeLeftType;
};
