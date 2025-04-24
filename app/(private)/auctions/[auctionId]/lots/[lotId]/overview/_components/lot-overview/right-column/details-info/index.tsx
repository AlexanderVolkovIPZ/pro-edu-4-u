import { iconsDictionary } from '@/app/lib/ai/icon-dictionary';
import { LotDetail } from '@prisma/client';

type LotDetailsProps = {
  lotDetails?: LotDetail[];
};

const DetailsInfo = ({ lotDetails = [] }: LotDetailsProps) => {
  const iconKeys = Object.keys(iconsDictionary);

  return (
    <>
      <h2 className='text-xl font-semibold mb-2 text-green-700'>Details</h2>
      <div className='flex flex-col gap-2'>
        {lotDetails.map((detail) => (
          <div className='flex flex-row items-center gap-x-3' key={detail.id}>
            <div className='flex flex-row items-center gap-2'>
              {iconKeys.includes(detail.iconName)
                ? iconsDictionary[detail.iconName as keyof typeof iconsDictionary]
                : iconsDictionary['question']}
              <span className='text-sm text-muted-foreground'>{detail.fieldName}:</span>
            </div>
            <span className='text-sm'>{detail.fieldValue}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DetailsInfo;
