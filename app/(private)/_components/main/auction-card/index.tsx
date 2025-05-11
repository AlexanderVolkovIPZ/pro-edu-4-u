'use client';

import { AuctionWithRelationsType } from '@/app/types';
import { Media, MediaSlider } from '@/components/media-slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getAuctionStatus } from '../../../../utils/get-auction-status';
import CountdownTimer from './countdown-timer';

type AuctionCardProps = {
  auction: AuctionWithRelationsType;
};

const AuctionCard = ({ auction }: AuctionCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const lowestPrice = Math.min(...auction.lot.map((lot) => lot.startBid!));
  const highestPrice = Math.max(...auction.lot.map((lot) => lot.startBid!));
  const lotMediaContent: Media[] = [
    ...auction.lot.flatMap((lot) => lot.photo?.map((photo) => ({ type: 'image' as const, src: photo.url }))),
    ...auction.lot.flatMap((lot) => lot.video?.map((video) => ({ type: 'video' as const, src: video.url }))),
  ];
  const uniqueLotCategories = Array.from(
    new Set(auction.lot.flatMap((lot) => lot.lotCategory.map((category) => category.category.name)))
  ).sort((a, b) => a.length - b.length);
  const auctionParticipantsCount = auction.userAuction.length - 1;

  const auctionStatus = getAuctionStatus({
    startDate: auction.startDate,
    endDate: auction.endDate,
    isAllLotsSold: auction.lot.every((lot) => lot.isSold),
  });

  return (
    <Card className='max-w-60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 flex flex-col'>
      <div className='relative'>
        <MediaSlider
          media={lotMediaContent}
          alt='Media content'
          imageProps={{ width: 300, height: 50 }}
          videoProps={{ width: 250, height: 50, controls: true }}
          sliderProps={{ className: 'rounded-t-lg' }}
          maxCountMediaToRender={6}
        />
        <div className='absolute top-0 left-0 bg-white px-3 py-1 rounded-br-lg shadow-md'>
          <span className='text-xs font-semibold text-gray-600'>
            {auction.lot.length} {auction.lot.length > 1 ? t('main.lots') : t('main.lot')}
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
        <h3 className='text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-ellipsis overflow-hidden text-nowrap'>
          {auction.title}
        </h3>

        <div className='flex items-center text-green-600'>
          <TrendingUp size={18} className='mr-1' />
          <span className='font-semibold text-lg'>
            ${lowestPrice.toLocaleString()} - ${highestPrice.toLocaleString()}
          </span>
        </div>

        <div className='flex flex-wrap gap-1'>
          {uniqueLotCategories.map((category) => (
            <span key={category} className='bg-slate-200 text-slate-700 text-xs rounded px-1'>
              {category}
            </span>
          ))}
        </div>

        <div className='mt-auto flex flex-col items-center justify-center'>
          <div className='flex items-center gap-x-1 '>
            <Clock size={16} className='text-rose-500' />
            <span className='text-sm text-rose-500'>{t('main.time_remaining')}</span>
          </div>
          <CountdownTimer targetDate={auction.startDate!} status={auctionStatus} />
        </div>
      </CardContent>

      <CardFooter className='bg-gray-50 p-4'>
        <Button
          onClick={() => router.push(`/auctions/${auction.id}/overview`)}
          className='w-full px-6 py-1 bg-gradient-to-r from-violet-400 to-rose-400 hover:from-violet-500 hover:to-rose-400 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg'
        >
          {t('main.view_lots')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuctionCard;
