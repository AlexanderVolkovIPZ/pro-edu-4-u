import { Lot } from '@prisma/client';

type LotOverviewProps = {
  startBid?: Lot['startBid'];
  buyNowBid?: Lot['buyNowBid'];
  minBidIncrement?: Lot['minBidIncrement'];
};

const BiddingInfo = ({ startBid, buyNowBid, minBidIncrement }: LotOverviewProps) => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Bidding Information</h2>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p className='text-sm text-muted-foreground'>Start Bid</p>
          <p className='font-semibold'>${startBid}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground'>Buy Now Price</p>
          <p className='font-semibold'>${buyNowBid}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground'>Minimum Increment</p>
          <p className='font-semibold'>${minBidIncrement}</p>
        </div>
      </div>
    </div>
  );
};

export default BiddingInfo;
