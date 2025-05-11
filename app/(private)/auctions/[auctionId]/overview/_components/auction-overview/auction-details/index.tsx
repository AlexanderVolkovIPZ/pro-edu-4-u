'use client';

import { AuctionWithRelationsType } from '@/app/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LotsListProps = {
  auction?: AuctionWithRelationsType;
};

const AuctionDetails = ({ auction }: LotsListProps) => {
  const { t } = useTranslation();

  return (
    <Card className='bg-white shadow-md'>
      <CardContent className='p-3'>
        <div className='flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 gap-y-2'>
          <h2 className='text-2xl font-semibold text-gray-800 flex items-center shrink-0'>
            <Info className='h-6 w-6 mr-2 text-blue-600' />
            {t('auction_lots.auction_details')}
          </h2>
          <div className='flex flex-col flex-wrap justify-end gap-x-4 lg:flex-row'>
            <div className='flex items-center text-sm text-gray-600 whitespace-nowrap'>
              <Calendar className='h-4 w-4 mr-1 text-blue-500' />
              {auction?.startDate ? (
                <span>
                  {t('auction_lots.start')}: {new Date(auction.startDate).toLocaleString()}
                </span>
              ) : (
                <span className='italic'>{t('auction_lots.no_start_date_specified')}</span>
              )}
            </div>
            <div className='flex items-center text-sm text-gray-600 whitespace-nowrap'>
              <Clock className='h-4 w-4 mr-1 text-blue-500' />
              {auction?.endDate ? (
                <span>
                  {t('auction_lots.end')}: {new Date(auction.endDate).toLocaleString()}
                </span>
              ) : (
                <span className='italic'>{t('auction_lots.no_end_date_specified')}</span>
              )}
            </div>
          </div>
        </div>
        {auction?.description && (
          <p
            className='text-gray-700 text-base leading-relaxed mt-4 text-justify'
            dangerouslySetInnerHTML={{ __html: auction.description }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionDetails;
