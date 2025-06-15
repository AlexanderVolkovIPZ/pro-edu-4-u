'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BidInfo } from '../_shared/types';
import { cn } from '@/lib/utils';

const BidHistory = ({ bids, isCompleted }: { bids: BidInfo[]; isCompleted: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className='w-full bg-white'>
      <h3 className='flex items-center gap-2 text-xl font-semibold mb-4 text-slate-700'>
        <History className='h-5 w-5 text-slate-600' />
        {t('lot.bid_history')}
      </h3>
      <ScrollArea
        className={cn('max-h-[320px] h-auto pr-4 overflow-auto', isCompleted ? 'max-h-[320px]' : 'max-h-[190px]')}
      >
        {bids.length ? (
          <div>
            {bids.map((bid) => (
              <div key={bid.id} className='flex items-center justify-between py-3 border-b last:border-b-0'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>{bid.bidderName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>
                      {bid.bidderName} {bid.isWinner ? '🏆' : ''}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      <Clock className='mr-1 inline-block h-3 w-3' />
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className='text-lg font-semibold'>₴{bid.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-center text-muted-foreground'>{t('bid_process.no_bids_yet')}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default BidHistory;
