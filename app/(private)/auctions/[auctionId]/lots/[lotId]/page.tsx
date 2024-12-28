'use client';

import { useLot, useUpdateLot } from '@/app/queries/lot';
import Container from '@/components/container';
import ImageUploader from '@/components/image-uploader';
import InputBox from '@/components/input-box';
import { Skeleton } from '@/components/ui/skeleton';
import VideoUploader from '@/components/video-uploader';
import { BookType, LucideDollarSign } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { titleSchema } from '../../../_shared/schemas/title-schema';
import DescriptionInput from '../../_shared/components/description-input';
import Header from './_components/header';
import { buyNowBidSchema } from './_shared/schemas/buy-now-bid';
import { minBidIncrementSchema } from './_shared/schemas/min-bid-increment';
import { startBidSchema } from './_shared/schemas/start-bid';

type LotIdPageParams = {
  auctionId: string;
  lotId: string;
};

const LotIdPage = ({ params }: { params: LotIdPageParams }) => {
  const [isUpdating, setIsUpdating] = useState({
    isTitleUpdating: false,
    isStartBidUpdating: false,
    isMinBidIncrementUpdating: false,
    isBuyNowBidUpdating: false,
  });

  const { data, isFetched } = useLot(params.auctionId, params.lotId);
  const { mutateAsync, isPending } = useUpdateLot(params.auctionId, params.lotId);

  return (
    <Container>
      <div className='mx-auto bg-white'>
        <Header auctionLink={`/auctions/${params.auctionId}`} />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
          {isFetched ? (
            <>
              <div className='flex flex-col gap-y-6'>
                <InputBox
                  initialValue={data?.title || ''}
                  title='Title'
                  fieldName='title'
                  isLoading={isUpdating.isTitleUpdating}
                  setIsLoading={(isLoading) =>
                    setIsUpdating((prev) => ({
                      ...prev,
                      isTitleUpdating: isLoading,
                    }))
                  }
                  registerOptions={{ required: true }}
                  icon={BookType}
                  inputProps={{
                    placeholder: 'Enter lot title',
                    required: true,
                  }}
                  schema={titleSchema}
                  onSubmit={async (title) => {
                    await mutateAsync({ title });
                  }}
                  onSuccess={() => {
                    toast.success('The title has been successfully updated', {
                      style: {
                        textAlign: 'center',
                      },
                    });
                  }}
                  onError={() => {
                    toast.error('Something went wrong');
                  }}
                />
                <DescriptionInput
                  initialDescription={data?.description || ''}
                  isPending={isPending}
                  onSubmit={async (description) => {
                    await mutateAsync({ description });
                  }}
                  onSuccess={() => {
                    toast.success('The description has been successfully updated', {
                      style: {
                        textAlign: 'center',
                      },
                    });
                  }}
                  onError={() => {
                    toast.error('Something went wrong');
                  }}
                />
                <InputBox
                  initialValue={data?.startBid || 0}
                  title='Start bid'
                  fieldName='startBid'
                  icon={LucideDollarSign}
                  isLoading={isUpdating.isStartBidUpdating}
                  setIsLoading={(isLoading) =>
                    setIsUpdating((prev) => ({
                      ...prev,
                      isStartBidUpdating: isLoading,
                    }))
                  }
                  registerOptions={{ valueAsNumber: true }}
                  inputProps={{
                    placeholder: 'Enter start bid',
                    type: 'number',
                    step: 1,
                  }}
                  schema={startBidSchema}
                  onSubmit={async (startBid) => {
                    await mutateAsync({ startBid });
                  }}
                  onSuccess={() => {
                    toast.success('The start bid has been successfully updated', {
                      style: {
                        textAlign: 'center',
                      },
                    });
                  }}
                  onError={() => {
                    toast.error('Something went wrong');
                  }}
                />
                <InputBox
                  initialValue={data?.minBidIncrement || 0}
                  title='Minimum bid increment'
                  fieldName='minBidIncrement'
                  icon={LucideDollarSign}
                  isLoading={isUpdating.isMinBidIncrementUpdating}
                  setIsLoading={(isLoading) =>
                    setIsUpdating((prev) => ({
                      ...prev,
                      isMinBidIncrementUpdating: isLoading,
                    }))
                  }
                  registerOptions={{ valueAsNumber: true }}
                  inputProps={{
                    placeholder: 'Enter minimum bid increment',
                    type: 'number',
                    step: 1,
                  }}
                  schema={minBidIncrementSchema}
                  onSubmit={async (minBidIncrement) => {
                    await mutateAsync({ minBidIncrement });
                  }}
                  onSuccess={() => {
                    toast.success('The minimum bid increment has been successfully updated', {
                      style: {
                        textAlign: 'center',
                      },
                    });
                  }}
                  onError={() => {
                    toast.error('Something went wrong');
                  }}
                />
                <InputBox
                  initialValue={data?.buyNowBid || 0}
                  title='Buy now bid'
                  fieldName='buyNowBid'
                  icon={LucideDollarSign}
                  isLoading={isUpdating.isBuyNowBidUpdating}
                  setIsLoading={(isLoading) =>
                    setIsUpdating((prev) => ({
                      ...prev,
                      isBuyNowBidUpdating: isLoading,
                    }))
                  }
                  registerOptions={{ valueAsNumber: true }}
                  inputProps={{
                    placeholder: 'Enter minimum buy now bid',
                    type: 'number',
                    step: 1,
                  }}
                  schema={buyNowBidSchema}
                  onSubmit={async (buyNowBid) => {
                    await mutateAsync({ buyNowBid });
                  }}
                  onSuccess={() => {
                    toast.success('The buy now bid has been successfully updated', {
                      style: {
                        textAlign: 'center',
                      },
                    });
                  }}
                  onError={() => {
                    toast.error('Something went wrong');
                  }}
                />
              </div>
              <div className='flex flex-col gap-y-6'>
                <ImageUploader
                  auctionId={params.auctionId}
                  lotId={params.lotId}
                  images={data?.photo || []}
                  dropzoneOptions={{
                    accept: {
                      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                    },
                    multiple: true,
                    maxFiles: 20,
                  }}
                />
                <VideoUploader
                  auctionId={params.auctionId}
                  lotId={params.lotId}
                  videos={data?.video || []}
                  dropzoneOptions={{
                    accept: {
                      'video/*': ['.mp4', '.webm', '.ogg'],
                    },
                    multiple: true,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className='flex flex-col gap-y-6'>
                {[...Array(5)].map((_, index) => (
                  <Skeleton className='h-24' key={index} />
                ))}
              </div>
              <div className='flex flex-col gap-y-6'>
                {[...Array(2)].map((_, index) => (
                  <Skeleton className='h-40' key={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default LotIdPage;
