import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { AuctionWithRelationsType } from '../types';
import CountdownTimer from './countdown-timer';
import { ImageSlider } from './image-slider';

type AuctionCardProps = {
  auction: AuctionWithRelationsType;
};

export default function AuctionCard({ auction }: AuctionCardProps) {
  const lowestPrice = Math.min(...auction.lot.map((lot) => lot.startBid!));
  const highestPrice = Math.max(...auction.lot.map((lot) => lot.startBid!));
  const images = auction.lot.flatMap((lot) => lot.photo.map((photo) => photo.url)).slice(0, 5);
  const auctionParticipantsCount = auction.userAuction.length - 1;

  return (
    <Card className='max-w-60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 flex flex-col'>
      <div className='relative'>
        <ImageSlider images={images} alt={`${auction.title} images`} />

        <div className='absolute top-0 left-0 bg-white px-3 py-1 rounded-br-lg shadow-md'>
          <span className='text-xs font-semibold text-gray-600'>
            {auction.lot.length} {auction.lot.length > 1 ? 'lots' : 'lot'}
          </span>
        </div>

        <div className='absolute bottom-0 right-0 bg-white px-3 py-1 rounded-tl-lg shadow-md'>
          <div className='flex items-center text-xs font-semibold text-gray-600'>
            <Users size={14} className='mr-1' />
            <span>{auctionParticipantsCount}</span>
          </div>
        </div>
      </div>

      <CardContent className='p-3 grow flex flex-col gap-y-1'>
        <h3 className='text-base font-bold text-gray-800 group-hover:text-rose-600 transition-colors text-ellipsis overflow-hidden text-nowrap'>
          {auction.title}
        </h3>

        <div className='flex items-center text-emerald-600'>
          <TrendingUp size={18} className='mr-1' />
          <span className='font-semibold text-lg'>
            ${lowestPrice.toLocaleString()} - ${highestPrice.toLocaleString()}
          </span>
        </div>

        <div className='flex flex-wrap gap-1'>
          {auction.auctionCategory.map((auctionCategory) => (
            <span key={auctionCategory.category.id} className='bg-slate-200 text-slate-700 text-xs rounded px-1'>
              {auctionCategory.category.name}
            </span>
          ))}
        </div>

        <div className='mt-auto flex flex-col items-center justify-center'>
          <div className='flex items-center gap-x-1 '>
            <Clock size={16} className='text-rose-500' />
            <span className='text-sm text-rose-500'>Time Remaining</span>
          </div>
          <CountdownTimer targetDate={auction.startDate!} />
        </div>
      </CardContent>

      <CardFooter className='bg-gray-50 p-4'>
        <Button className='w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transition-all duration-300 text-base py-3 shadow-lg hover:shadow-xl transform hover:scale-105'>
          View lots
        </Button>
      </CardFooter>
    </Card>
  );
}
