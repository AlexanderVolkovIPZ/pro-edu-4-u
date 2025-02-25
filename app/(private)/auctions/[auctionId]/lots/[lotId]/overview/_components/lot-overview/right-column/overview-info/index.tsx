import { Badge } from '@/components/ui/badge';
import { Gavel, Tags, FileText } from 'lucide-react';
import { LotOverviewInfo } from '../_shared/types';

const OverviewInfo = ({ startBid, buyNowBid, minBidIncrement, description, categories }: LotOverviewInfo) => {
  return (
    <>
      <h2 className='text-xl font-semibold mb-2 flex items-center gap-2 text-green-700'>
        <Gavel className='w-6 h-6' />
        Bidding Information
      </h2>

      <div className='grid grid-cols-3 gap-4'>
        {startBid && (
          <div className='bg-sky-50 p-3 rounded-lg border border-sky-300 flex flex-col justify-between'>
            <p className='text-xs text-ellipsis text-sky-600'>Start Bid</p>
            <p className='font-semibold text-lg text-sky-700'>${startBid}</p>
          </div>
        )}
        {buyNowBid && (
          <div className='bg-sky-50 p-3 rounded-lg border border-sky-300 flex flex-col justify-between'>
            <p className='text-xs text-ellipsis text-sky-600'>Buy Now Price</p>
            <p className='font-semibold text-lg text-sky-700'>${buyNowBid}</p>
          </div>
        )}
        {minBidIncrement && (
          <div className='bg-sky-50 p-3 rounded-lg border border-sky-300 flex flex-col justify-between'>
            <p className='text-xs overflow-clip text-sky-600'>Minimum Increment</p>
            <p className='font-semibold text-lg text-sky-700'>${minBidIncrement}</p>
          </div>
        )}
      </div>

      {categories && (
        <>
          <h2 className='text-xl font-semibold my-2 flex items-center gap-2 text-green-700'>
            <Tags className='w-6 h-6' />
            Categories
          </h2>
          <div className='flex flex-wrap gap-2 my-2'>
            {categories.map((category) => (
              <Badge key={category.category.id} variant='outline' className='bg-sky-50 text-slate-800'>
                {category.category.name}
              </Badge>
            ))}
          </div>
        </>
      )}

      {description && (
        <>
          <h2 className='text-xl font-semibold my-2 flex items-center gap-2 text-green-700'>
            <FileText className='w-6 h-6' />
            Description
          </h2>
          <p className='text-justify mt-2 text-slate-700' dangerouslySetInnerHTML={{ __html: description }} />
        </>
      )}
    </>
  );
};

export default OverviewInfo;
