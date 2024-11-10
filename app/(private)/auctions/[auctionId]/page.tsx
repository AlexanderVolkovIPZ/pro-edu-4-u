'use client';

import Container from '@/components/container';
import DescriptionInput from './_components/description-input';
import EndDateInput from './_components/end-date-input';
import Header from './_components/header';
import StartDateInput from './_components/start-date-input';
import TitleInput from './_components/title-input';
import { useEffect, useState } from 'react';
import { useAuction } from '@/app/queries/auction';
import { Skeleton } from '@/components/ui/skeleton';

type AuctionIdPageParams = {
  auctionId: string;
};

type AuctionData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
};

const AuctionIdPage = ({ params }: { params: AuctionIdPageParams }) => {
  const [auction, setAuction] = useState<AuctionData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const { data, isFetched } = useAuction<AuctionData>(params.auctionId);

  useEffect(() => {
    if (isFetched && data?.data) {
      setAuction({
        title: data.data.title,
        description: data.data.description,
        startDate: data.data.startDate,
        endDate: data.data.endDate,
      });
    }
  }, [data, isFetched]);

  return (
    <Container>
      <div className='mx-auto bg-white'>
        <Header />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
          {isFetched ? (
            <>
              <div className='flex flex-col gap-y-6'>
                <TitleInput initialTitle={auction.title} auctionId={params.auctionId} />
                <DescriptionInput initialDescription={auction.description} auctionId={params.auctionId} />
              </div>
              <div className='flex flex-col gap-y-6'>
                <StartDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={params.auctionId}
                />
                <EndDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={params.auctionId}
                />
              </div>
            </>
          ) : (
            <>
              <div className='flex flex-col gap-y-6'>
                <Skeleton className='h-24' />
                <Skeleton className='h-24' />
              </div>
              <div className='flex flex-col gap-y-6'>
                <Skeleton className='h-24' />
                <Skeleton className='h-24' />
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AuctionIdPage;
