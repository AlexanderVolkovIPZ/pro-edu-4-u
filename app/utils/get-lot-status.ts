enum LotStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN PROGRESS',
  COMPLETED = 'COMPLETED',
}

const getLotStatus = (startDate?: string, endDate?: string, isLotSold?: boolean) => {
  if (!startDate || !endDate) return LotStatus.UPCOMING;

  const now = +new Date();
  const start = +new Date(startDate);
  const end = +new Date(endDate);

  if (isLotSold || now > end) return LotStatus.COMPLETED;
  if (!isLotSold && now < end && now > start) return LotStatus.IN_PROGRESS;
  return LotStatus.UPCOMING;
};

export default getLotStatus;
