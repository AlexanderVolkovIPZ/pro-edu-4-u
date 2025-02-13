'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Clock } from 'lucide-react';
import { BidInfo } from '../_shared/types';

const BidHistory = ({ bids }: { bids: BidInfo[] }) => {
  return (
    <div className='w-full bg-white'>
      <h3 className='flex items-center gap-2 text-xl font-semibold mb-4'>
        <ClipboardList className='h-5 w-5' />
        Bid History
      </h3>
      <ScrollArea className='h-[300px] pr-4'>
        {bids.length > 0 ? (
          <div>
            {bids.map((bid) => (
              <div key={bid.id} className='flex items-center justify-between py-3 border-b last:border-b-0'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>{bid.bidderName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>{bid.bidderName}</p>
                    <p className='text-xs text-muted-foreground'>
                      <Clock className='mr-1 inline-block h-3 w-3' />
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className='text-lg font-semibold'>${bid.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-center text-muted-foreground'>No bids yet</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default BidHistory;
