import { LOT_STATUSES } from '../constants';

const getLotStatus = (startDate?: string, endDate?: string, isLotSold?: boolean) => {
  if (!startDate || !endDate) return LOT_STATUSES.UPCOMING;

  const now = +new Date();
  const start = +new Date(startDate);
  const end = +new Date(endDate);

  if (isLotSold || now > end) return LOT_STATUSES.COMPLETED;
  if (!isLotSold && now < end && now > start) return LOT_STATUSES.IN_PROGRESS;
  return LOT_STATUSES.UPCOMING;
};

export default getLotStatus;
