import { Media, MediaSlider } from '@/components/media-slider';
import { Card, CardContent } from '@/components/ui/card';
import BasicInfo from './basic-info';
import { AuctionWithRelationsType } from '@/app/types';
import { useAuction } from '@/app/queries/auction';
import getLotStatus from '@/app/utils/get-lot-status';
import { TimeLeftType } from '@/app/hooks/use-lot-date';
import Container from '@/components/container';
import NotFound from '@/app/not-found';

type LeftColumnProps = {
  auctionId: string;
  lotId: string;
  startDate: string;
  endDate: string;
  timeStartLeft: TimeLeftType;
};

const LeftColumn = ({ auctionId, lotId, timeStartLeft, startDate, endDate }: LeftColumnProps) => {
  const { data: auctionData, isFetched: isAuctionFetched } = useAuction<AuctionWithRelationsType>(auctionId);
  const lotData = auctionData?.lot.find((lot) => lot.id === lotId);
  const lotStatus = getLotStatus(startDate, endDate, lotData?.isSold);

  const lotMediaContent: Media[] = [
    ...(lotData?.photo.map((photo) => ({ type: 'image' as const, src: photo.url })) ?? []),
    ...(lotData?.video.map((video) => ({ type: 'video' as const, src: video.url })) ?? []),
  ];

  if (isAuctionFetched && !lotData) {
    return (
      <Container>
        <NotFound />
      </Container>
    );
  }

  return (
    <div className='space-y-4'>
      <MediaSlider
        media={lotMediaContent}
        alt='Images'
        imageProps={{ width: 600, height: 200 }}
        videoProps={{ width: 600, height: 200, controls: true }}
        sliderProps={{ className: 'rounded-lg flex-shrink-0' }}
      />

      <Card>
        <CardContent className='p-6 min-h-max'>
          <BasicInfo
            id={lotData?.id ?? ''}
            title={lotData?.title ?? ''}
            timeStartLeft={timeStartLeft}
            startDate={startDate}
            endDate={endDate}
            status={lotStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LeftColumn;
