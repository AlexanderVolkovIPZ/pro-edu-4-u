'use client';

import { useAuction, useUpdateAuction } from '@/app/queries/auction';
import Container from '@/components/container';
import InputBox from '@/components/input-box';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { titleSchema } from '../_shared/schemas/title-schema';
import EndDateInput from './_components/end-date-input';
import Header from './_components/header';
import LotInput from './_components/lot-input';
import StartDateInput from './_components/start-date-input';
import DescriptionInput from './_shared/components/description-input';
import { BookType } from 'lucide-react';
import { AuctionDataType } from '@/app/types';

import { useCategory } from '@/app/queries/category';
import CategoryInput from './_shared/components/category-input';
import { useAuctionCategories, useCreateAuctionCategories } from '@/app/queries/auction-category';

type AuctionIdPageParams = {
  auctionId: string;
};

const AuctionIdPage = ({ params }: { params: AuctionIdPageParams }) => {
  const [auction, setAuction] = useState<AuctionDataType>({
    id: params.auctionId,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    lot: [],
  });

  const { data, isFetched: isAuctionFetched } = useAuction<AuctionDataType>(params.auctionId);
  const { data: categoriesData, isFetched: isCategoriesFetched } = useCategory();
  const { data: auctionCategoriesData, isFetched: isAuctionCategoriesFetched } = useAuctionCategories(params.auctionId);
  const { mutateAsync: updateAuction, isPending: isUpdateAuctionPending } = useUpdateAuction(params.auctionId);
  const { mutateAsync: createAuctionCategories, isPending: isCreateAuctionCategoriesPending } =
    useCreateAuctionCategories();

  const isFetched = isAuctionFetched && isCategoriesFetched && isAuctionCategoriesFetched;

  useEffect(() => {
    if (isAuctionFetched && data) {
      setAuction({
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        lot: data.lot,
      });
    }
  }, [data, isAuctionFetched]);

  return (
    <Container>
      <div className='mx-auto bg-white'>
        <Header />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
          {isFetched ? (
            <>
              <div className='flex flex-col gap-y-6'>
                <InputBox
                  initialValue={auction.title}
                  title='Title'
                  fieldName='title'
                  schema={titleSchema}
                  isLoading={isUpdateAuctionPending}
                  icon={BookType}
                  registerOptions={{ required: true }}
                  inputProps={{
                    required: true,
                  }}
                  onSubmit={async (title) => {
                    await updateAuction({ title });
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
                  initialDescription={auction.description}
                  isPending={isUpdateAuctionPending}
                  onSubmit={async (description) => {
                    await updateAuction({ description });
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
                <LotInput auctionData={auction} />
              </div>
              <div className='flex flex-col gap-y-6'>
                <StartDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={auction.id}
                />
                <EndDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={auction.id}
                />
                <CategoryInput
                  initialCategories={categoriesData}
                  auctionId={auction.id}
                  initialAuctionCategoryIds={auctionCategoriesData?.map(
                    (auctionCategory) => auctionCategory.categoryId
                  )}
                  isLoading={isCreateAuctionCategoriesPending}
                  onSubmit={async (data) => {
                    await createAuctionCategories(data);
                  }}
                  onSuccess={() => {
                    toast.success('The categories has been successfully updated', {
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
            </>
          ) : (
            <>
              <div className='flex flex-col gap-y-6'>
                <Skeleton className='h-24' />
                <Skeleton className='h-24' />
                <Skeleton className='h-24' />
              </div>
              <div className='flex flex-col gap-y-6'>
                <Skeleton className='h-24' />
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
