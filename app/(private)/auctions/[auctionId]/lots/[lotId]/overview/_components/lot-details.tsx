import { LotDetail } from '@prisma/client';

type LotDetailsProps = {
  lotDetails?: LotDetail[];
  iconsDictionary: Record<string, string>;
};

const LotDetails = ({ lotDetails = [], iconsDictionary }: LotDetailsProps) => {
  const iconKeys = Object.keys(iconsDictionary);

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Details</h2>
      <div className='flex flex-col gap-2'>
        {lotDetails.map((detail) => (
          <div className='flex flex-row items-center gap-x-3' key={detail.id}>
            <div className='flex flex-row items-center gap-2'>
              {iconKeys.includes(detail.iconName)
                ? iconsDictionary[detail.iconName as keyof typeof iconsDictionary]
                : iconsDictionary['question']}
              <span className='text-sm text-muted-foreground'>{detail.fieldName}</span>
            </div>
            <span className='text-sm'>{detail.fieldValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotDetails;
