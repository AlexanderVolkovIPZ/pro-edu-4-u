'use client';

import { Badge } from '@/components/ui/badge';
import { FileText, Gavel, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LotOverviewInfo } from '../_shared/types';

type OverviewInfoProps = Pick<
  LotOverviewInfo,
  'startBid' | 'buyNowBid' | 'minBidIncrement' | 'description' | 'categories'
>;

const OverviewInfo = ({ startBid, buyNowBid, minBidIncrement, description, categories }: OverviewInfoProps) => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className='text-xl font-semibold mb-2 flex items-center gap-2 text-slate-700'>
        <Gavel className='w-6 h-6' />
        {t('lot.bidding_information')}
      </h2>

      <div className='grid grid-cols-3 gap-4 '>
        {startBid && (
          <div className='bg-sky-50 p-3 rounded-lg border-4 border-sky-300 flex flex-col justify-between'>
            <p className='text-xs text-ellipsis text-sky-600'>{t('lot.start_bid')}</p>
            <p className='font-semibold text-lg text-sky-700'>${startBid}</p>
          </div>
        )}

        {buyNowBid && (
          <div className='bg-sky-50 p-3 rounded-lg border-4 border-sky-300 flex flex-col justify-between'>
            <p className='text-xs text-ellipsis text-sky-600'>{t('lot.buy_now_price')}</p>
            <p className='font-semibold text-lg text-sky-700'>${buyNowBid}</p>
          </div>
        )}

        {minBidIncrement && (
          <div className='bg-sky-50 p-3 rounded-lg border-4 border-sky-300 flex flex-col justify-between'>
            <p className='text-xs overflow-clip text-sky-600'>{t('lot.minimum_increment')}</p>
            <p className='font-semibold text-lg text-sky-700'>${minBidIncrement}</p>
          </div>
        )}
      </div>

      {categories && (
        <>
          <h2 className='text-xl font-semibold my-2 flex items-center gap-2 text-slate-700'>
            <Tags className='w-6 h-6' />
            {t('lot.categories')}
          </h2>
          <div className='flex flex-wrap gap-2 my-2'>
            {categories.map((category) => (
              <Badge key={category.category.id} variant='outline' className='text-slate-800'>
                {category.category.name}
              </Badge>
            ))}
          </div>
        </>
      )}

      {description && (
        <>
          <h2 className='text-xl font-semibold my-2 flex items-center gap-2 text-slate-700'>
            <FileText className='w-6 h-6' />
            {t('lot.description')}
          </h2>
          <p className='text-justify mt-2 text-muted-foreground' dangerouslySetInnerHTML={{ __html: description }} />
        </>
      )}
    </>
  );
};

export default OverviewInfo;
