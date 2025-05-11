'use client';

import { TimeLeftType } from '@/app/hooks/use-lot-date';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LotInfo } from '../types';

const BasicInfo = ({ id, title, status, startDate, endDate, timeStartLeft }: LotInfo) => {
  const { t } = useTranslation();
  const timerComponents: JSX.Element[] = [];

  Object.keys(timeStartLeft).forEach((interval) => {
    if (!(interval in timeStartLeft)) return;
    const key = interval as keyof TimeLeftType;

    timerComponents.push(
      <span key={interval} className='inline-flex flex-col items-center mx-[2px]'>
        <span className='text-xl font-bold rounded-sm text-slate-700'>
          {timeStartLeft[key]?.toString().padStart(2, '0')}
        </span>
        <span className='text-[8px] text-slate-500 uppercase'>{t(`common.time.${interval}`)}</span>
      </span>
    );
  });

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>{title}</h1>
          <p className='text-sm text-muted-foreground'>Lot: {id}</p>
        </div>
        <Badge variant='secondary' className='text-sm'>
          {status}
        </Badge>
      </div>

      <div className='flex flex-wrap justify-between gap-x-1 gap-y-2'>
        <div className='flex items-center text-sm text-gray-600 whitespace-nowrap'>
          <Calendar className='h-4 w-4 mr-1 text-blue-500' />
          <span>
            {t('lot.start_date')}: {new Date(startDate)?.toLocaleString()}
          </span>
        </div>

        <div className='flex items-center text-sm text-gray-600 whitespace-nowrap'>
          <Clock className='h-4 w-4 mr-1 text-blue-500' />
          <span>
            {t('lot.end_date')}: {new Date(endDate)?.toLocaleString()}
          </span>
        </div>
      </div>

      <div className='flex flex-col items-center mt-1'>
        <div className='text-[8px] text-slate-500 uppercase'>{t('lot.time_to_start')}</div>
        <span>{timerComponents}</span>
      </div>
    </div>
  );
};

export default BasicInfo;
