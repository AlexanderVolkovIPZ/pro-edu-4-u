'use client';

import { AuctionWithRelationsType } from '@/app/types';
import { LotCard } from './lot-card';

type LotsListProps = {
  auction?: AuctionWithRelationsType;
};

const LotsList = ({ auction }: LotsListProps) => {
  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      {auction?.lot
        .sort((a, b) => a.position - b.position)
        .map((lot) => <LotCard key={lot.id} lot={lot} auctionId={auction.id} />)}
    </div>
  );
};

export default LotsList;
