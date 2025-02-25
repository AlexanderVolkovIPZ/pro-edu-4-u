'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useBidsByFilter } from '@/app/queries/bid';
import { Media } from '@/components/media-slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import EmptyBasket from './empty-basket';
import LotCard from './lot-card';

const WonLots = () => {
  const authUser = useContext(AuthUserContext);
  const router = useRouter();
  const { data: bidsData, isFetching: isFetchingBids } = useBidsByFilter(
    {
      bidderId: authUser?.id,
      isWinner: true,
      isPaid: false,
    },
    {
      enabled: !!authUser?.id,
      staleTime: 1000 * 60,
    }
  );

  if (!isFetchingBids && !bidsData?.length) {
    return <EmptyBasket />;
  }

  const countItems = bidsData?.length || 0;
  const allItemsPrice = bidsData?.reduce((acc, { amount }) => acc + amount, 0);

  return (
    <main className='mt-2'>
      {!isFetchingBids && bidsData ? (
        <>
          {countItems > 1 && (
            <div className='flex justify-between items-center'>
              <div className='text-sm text-muted-foreground'>{countItems} items pending payment</div>
              <div className='flex items-center gap-4'>
                <div className='text-right'>
                  <p className='text-sm text-muted-foreground'>Total Due</p>
                  <p className='text-xl font-semibold text-[#FF4B75]'>${allItemsPrice}</p>
                </div>
                <Button
                  className='bg-[#FF4B75] hover:bg-[#ff3361]'
                  onClick={() =>
                    router.push(`/won-lots/payment?id=${JSON.stringify(bidsData.map(({ lot: { id } }) => id))}`)
                  }
                  disabled={isFetchingBids}
                >
                  Pay All Items
                </Button>
              </div>
            </div>
          )}

          <div className='space-y-4 mt-4'>
            {bidsData.map(({ id, amount, createdAt, lot: { photo = [], video = [], title, auction, lotCategory } }) => {
              const media: Media[] = [
                ...photo.map((photo) => ({ type: 'image' as const, src: photo.url })),
                ...video.map((video) => ({ type: 'video' as const, src: video.url })),
              ];

              return (
                <LotCard
                  key={id}
                  auctionName={auction.title}
                  lotName={title}
                  price={amount}
                  media={media}
                  categories={lotCategory.map(({ category: { name } }) => name)}
                  lotWonDate={dayjs(new Date(createdAt)).format('MMM D, YYYY').toString()}
                  onClick={() => router.push(`/won-lots/payment?id=${JSON.stringify([id])}`)}
                  isLoading={isFetchingBids}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className='flex flex-col gap-y-4'>
          {[...Array(4)].map((_, index) => (
            <Skeleton className='h-44 w-full' key={index} />
          ))}
        </div>
      )}
    </main>
  );
};

export default WonLots;
