import { ScrollArea } from '@/components/ui/scroll-area';
import { Bid } from '@prisma/client';
import { ClipboardList, Clock, User } from 'lucide-react';

type BidInfo = Pick<Bid, 'amount' | 'id'> & {
  bidderId: string;
  createdAt: string;
  bidderName: string;
};

const BidHistory = ({ bids }: { bids: BidInfo[] }) => {
  return (
    <div className='pt-1'>
      <h3 className='font-semibold mb-3 flex items-center gap-2'>
        Bid History
        <ClipboardList />
      </h3>

      <ScrollArea className='h-[200px] rounded-md border p-4'>
        {bids.length > 0 ? (
          <div className='space-y-4'>
            {bids.map((bid) => (
              <div key={bid.amount} className='flex justify-between items-center text-sm'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-muted-foreground' />
                  <span>{bid.bidderName}</span>
                </div>

                <div className='flex items-center gap-4'>
                  <span className='font-medium'>${bid.amount}</span>
                  <div className='flex items-center text-muted-foreground'>
                    <Clock className='w-4 h-4 mr-1' />
                    {new Date(bid.createdAt).toTimeString().split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted-foreground py-8'>No bids yet</div>
        )}
      </ScrollArea>
    </div>
  );
};

export default BidHistory;
