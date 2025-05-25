'use client';

import { iconsDictionary } from '@/app/lib/ai/icon-dictionary';
import { LotDetail } from '@prisma/client';
import { FileX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LotDetailsProps = {
  lotDetails?: LotDetail[];
};

const DetailsInfo = ({ lotDetails = [] }: LotDetailsProps) => {
  const { t } = useTranslation();
  const iconKeys = Object.keys(iconsDictionary);

  if (!lotDetails?.length) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='text-muted-foreground mb-2'>
          <FileX className='w-8 h-8' />
        </div>
        <p className='text-sm text-muted-foreground'>{t('lot.no_details_available')}</p>
      </div>
    );
  }

  return (
    <>
      <h2 className='text-xl font-semibold mb-2 text-slate-700'>{t('lot.details')}</h2>
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
