'use client';

import { iconsDictionary } from '@/app/lib/ai/icon-dictionary';
import { useLot } from '@/app/queries/lot';
import Container from '@/components/container';
import { Media, MediaSlider } from '@/components/media-slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import BasicInfo from './basic-info';
import BiddingInfo from './bidding-info';
import Header from './header';
import LotDetails from './lot-details';

type LotOverviewProps = {
  auctionId: string;
  lotId: string;
};

const LotOverview = ({ auctionId, lotId }: LotOverviewProps) => {
  const { data: lotData, isFetched } = useLot(auctionId, lotId);
  const lotMediaContent: Media[] = [
    ...(lotData?.photo.map((photo) => ({ type: 'image' as const, src: photo.url })) ?? []),
    ...(lotData?.video.map((video) => ({ type: 'video' as const, src: video.url })) ?? []),
  ];

  return (
    <Container>
      <Header />
      <main className='mt-2'>
        <div className='grid lg:grid-cols-2 gap-4'>
          {/* Left Column - Images and Basic Info */}
          <div className='space-y-4'>
            {isFetched ? (
              <>
                <MediaSlider
                  media={lotMediaContent}
                  alt='Images'
                  imageProps={{ width: 600, height: 200 }}
                  videoProps={{ width: 600, height: 200, controls: true }}
                  sliderProps={{ className: 'rounded-lg flex-shrink-0' }}
                />
                <Card>
                  <CardContent className='p-6'>
                    <BasicInfo
                      lotTitle={lotData?.title}
                      lotId={lotData?.id}
                      lotDescription={lotData?.description}
                      categories={lotData?.lotCategory}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Skeleton className='h-[280px]' />
                <Skeleton className='h-40' />
              </>
            )}
          </div>

          {/* Right Column - Details and Bidding */}
          <div className='space-y-6 min-h-96'>
            {isFetched ? (
              <Card>
                <CardContent className='p-6'>
                  <div className='flex flex-col gap-4'>
                    <BiddingInfo
                      startBid={lotData?.startBid}
                      buyNowBid={lotData?.buyNowBid}
                      minBidIncrement={lotData?.minBidIncrement}
                    />

                    {lotData?.lotDetail && !!lotData.lotDetail?.length && (
                      <>
                        <Separator />
                        <LotDetails lotDetails={lotData?.lotDetail} iconsDictionary={iconsDictionary} />
                      </>
                    )}

                    <div className='flex gap-4'>
                      <Button className='flex-1' size='lg'>
                        Place Bid
                      </Button>
                      <Button className='flex-1' variant='secondary' size='lg'>
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Skeleton className='h-full' />
            )}
          </div>
        </div>
      </main>
    </Container>
  );
};

export default LotOverview;
