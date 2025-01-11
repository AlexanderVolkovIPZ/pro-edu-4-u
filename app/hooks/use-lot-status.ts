type UseLotStatusProps = {
  lotStartDate: string | Date;
  lotEndDate: string | Date;
};

const useLotStatus = ({ lotStartDate, lotEndDate }: UseLotStatusProps) => {
  const nowDate = new Date();
  if (nowDate < new Date(lotStartDate)) return 'upcoming';
  if (nowDate >= new Date(lotStartDate) && nowDate <= new Date(lotEndDate)) return 'active';
  return 'completed';
};

export default useLotStatus;
