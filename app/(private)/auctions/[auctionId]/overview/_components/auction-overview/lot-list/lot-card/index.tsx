'use client';

import { TimeLeftType, useLotDate } from '@/app/hooks/use-lot-date';
import { AuctionWithRelationsType, LotWithRelationsType } from '@/app/types';
import getLotStatus from '@/app/utils/get-lot-status';
import { Media, MediaSlider } from '@/components/media-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, DollarSign, Eye, ShoppingCart, Tag } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type LotCardProps = {
  lot: LotWithRelationsType;
  auctionInfo: {
    auctionId: string;
    auctionStartDate: AuctionWithRelationsType['startDate'];
    auctionEndDate: AuctionWithRelationsType['endDate'];
    lotsCount: number;
  };
};

export function LotCard({
  lot,
  auctionInfo: { auctionId, auctionStartDate, auctionEndDate, lotsCount },
}: LotCardProps) {
  const { t } = useTranslation();
  const {
    timeStartLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 },
    startDate,
    endDate,
  } = useLotDate({
    auctionStartDate,
    auctionEndDate,
    position: lot.position,
    lotsCount,
  });

  const lotMediaContent: Media[] = [
    ...lot.photo.map((photo) => ({ type: 'image' as const, src: photo.url })),
    ...lot.video.map((video) => ({ type: 'video' as const, src: video.url })),
  ];

  const lotStatus = getLotStatus(startDate, endDate, lot.isSold);

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeStartLeft).forEach((interval) => {
    if (!(interval in timeStartLeft)) return;
    const key = interval as keyof TimeLeftType;

    timerComponents.push(
      <span key={interval} className='inline-flex flex-col items-center mx-1'>
        <span className='text-xl leading-6 font-bold rounded-sm text-slate-700'>
          {timeStartLeft[key]?.toString().padStart(2, '0')}
        </span>
        <span className='text-[8px] text-slate-500 uppercase'>{t(`common.time.${interval}`)}</span>
      </span>
    );
  });

  return (
    <Card className='overflow-hidden transition-all duration-300 hover:shadow-md'>
      <CardContent className='p-3 flex flex-row items-center gap-x-3 max-[950px]:flex-col'>
        <div className='flex flex-col flex-grow md:flex-row gap-x-3'>
          <div className='flex flex-col flex-shrink-0 items-center'>
            <MediaSlider
              media={lotMediaContent}
              alt='Images'
              imageProps={{ width: 250, height: 50 }}
              videoProps={{ width: 250, height: 50, controls: true }}
              sliderProps={{ className: 'rounded-lg' }}
            />
            <div className='flex flex-col items-center mt-2'>
              <div className='text-[8px] text-slate-500 uppercase'>{t('auction_lots.time_to_start')}</div>
              <span>{timerComponents}</span>
            </div>
          </div>

          <div className='flex-grow'>
            <div className='flex items-center justify-between mb-2 mt-2 md:mt-0'>
              <h3 className='text-lg font-semibold truncate'>{lot.title}</h3>
              <div className='flex gap-2'>
                <Badge className='text-xs bg-blue-100 text-blue-800' variant='secondary'>
                  {t(`common.status.${lotStatus.toLowerCase()}`)}
                </Badge>
                <Badge className='text-xs bg-blue-100 text-blue-800' variant='secondary'>
                  {t('auction_lots.lot')} #{lot.position}
                </Badge>
              </div>
            </div>

            {lot.description && (
              <p
                className='text-sm text-muted-foreground line-clamp-2 mb-2'
                dangerouslySetInnerHTML={{ __html: lot.description }}
              />
            )}

            <div className='flex flex-wrap items-center justify-start gap-x-3 text-sm mb-2'>
              <div className='flex items-center'>
                <DollarSign className='h-4 w-4 text-green-600 mr-1' />
                <span className='font-semibold'>₴{lot.startBid}</span>
              </div>
              <div className='flex items-center'>
                <ArrowUpRight className='h-4 w-4 text-blue-600 mr-1' />
                <span>₴{lot.minBidIncrement}</span>
              </div>
              {lot.buyNowBid && (
                <div className='flex items-center'>
                  <ShoppingCart className='h-4 w-4 text-purple-600 mr-1' />
                  <span>₴{lot.buyNowBid}</span>
                </div>
              )}
            </div>

            <div className='flex flex-wrap gap-2'>
              {lot.lotCategory.map((lotCategoryItem) => (
                <Badge key={lotCategoryItem.category.name} variant='outline' className='text-xs'>
                  <Tag className='h-3 w-3 mr-1' />
                  {lotCategoryItem.category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button asChild size='sm' className='max-[950px]:mt-3'>
          <Link href={`/auctions/${auctionId}/lots/${lot.id}/overview`}>
            <Eye className='h-4 w-4 mr-2' />
            {t('auction_lots.view')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
