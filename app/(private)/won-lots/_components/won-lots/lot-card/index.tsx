'use client';

import { Media, MediaSlider } from '@/components/media-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Award, Calendar, ChevronRight, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LotCardProps = {
  auctionName: string;
  lotName: string;
  price: number;
  media: Media[];
  categories: string[];
  lotWonDate: string;
  isLoading: boolean;
  onClick: () => void;
};

const LotCard = ({ price, auctionName, lotName, media, categories, lotWonDate, isLoading, onClick }: LotCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className='overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200'>
      <CardContent className='p-4'>
        <div className='grid md:grid-cols-[200px,1fr] gap-4'>
          <div className='overflow-hidden rounded-lg'>
            <MediaSlider
              media={media}
              alt={t('won_lots.auction_item')}
              imageProps={{
                width: 200,
                height: 200,
                className: 'object-cover rounded-lg',
              }}
              videoProps={{
                width: 200,
                height: 200,
                controls: true,
                className: 'rounded-lg',
              }}
              sliderProps={{
                className: 'rounded-lg',
              }}
            />
          </div>

          <div className='space-y-3'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-1.5 text-rose-500'>
                  <Award className='w-4 h-4' />
                  <h3 className='text-lg font-semibold tracking-tight'>{lotName}</h3>
                </div>
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Tag className='w-3.5 h-3.5' />
                  <p className='text-sm'>{auctionName}</p>
                </div>
              </div>
              <div className='text-right space-y-1.5'>
                <div className='text-xl font-bold text-rose-500'>₴{price.toLocaleString()}</div>
                <div className='flex items-center justify-end gap-1.5 text-xs text-muted-foreground'>
                  <Calendar className='w-3.5 h-3.5' />
                  <span>
                    {t('won_lots.won_on')} {lotWonDate}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex gap-1.5 flex-wrap'>
              {categories.map((category) => (
                <Badge key={category} variant='outline' className='text-slate-700 text-xs py-0.5'>
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator className='bg-gray-100' />

      <CardFooter className='p-4 flex justify-end items-center bg-gray-50'>
        <Button variant='outline' disabled={isLoading} onClick={onClick}>
          {t('won_lots.pay_now')}
          <ChevronRight className='w-4 h-4 ml-1' />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LotCard;
