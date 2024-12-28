'use client';

import { useAuction, useUpdateAuction } from '@/app/queries/auction';
import { useAuctionCategories, useCreateAuctionCategories } from '@/app/queries/auction-category';
import { useCategory } from '@/app/queries/category';
import { AuctionWithLotsType, AuctionWithLotsWithPhotosType } from '@/app/types';
import AlertDialog from '@/components/alert-dialog';
import Container from '@/components/container';
import InputBox from '@/components/input-box';
import { Skeleton } from '@/components/ui/skeleton';
import { BookType } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { titleSchema } from '../_shared/schemas/title-schema';
import EndDateInput from './_components/end-date-input';
import Header from './_components/header';
import LotInput from './_components/lot-input';
import StartDateInput from './_components/start-date-input';
import CategoryInput from './_shared/components/category-input';
import DescriptionInput from './_shared/components/description-input';

type AuctionIdPageParams = {
  auctionId: string;
};

const AuctionIdPage = ({ params }: { params: AuctionIdPageParams }) => {
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);
  const [auction, setAuction] = useState<
    Pick<AuctionWithLotsType, 'id' | 'title' | 'description' | 'lot'> & { startDate: string; endDate: string }
  >({
    id: params.auctionId,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    lot: [],
  });

  const { data: auctionData, isFetched: isAuctionFetched } = useAuction<
    Omit<AuctionWithLotsWithPhotosType, 'startDate' | 'endDate'> & { startDate: string; endDate: string }
  >(params.auctionId);
  const { data: categoriesData, isFetched: isCategoriesFetched } = useCategory();
  const { data: auctionCategoriesData, isFetched: isAuctionCategoriesFetched } = useAuctionCategories(params.auctionId);
  const { mutateAsync: updateAuction, isPending: isUpdateAuctionPending } = useUpdateAuction(params.auctionId);
  const { mutateAsync: createAuctionCategories, isPending: isCreateAuctionCategoriesPending } =
    useCreateAuctionCategories();

  const isFetched = isAuctionFetched && isCategoriesFetched && isAuctionCategoriesFetched;

  const isAllRequiredFieldsFilled = [
    auctionData?.title,
    auctionData?.startDate && new Date(auctionData?.startDate) > new Date(),
    auctionData?.endDate,
    auctionCategoriesData?.length,
    auctionData?.lot &&
      auctionData.lot.every((lot) => lot.title && lot.startBid && lot.minBidIncrement && lot.photo.length > 0),
  ].every(Boolean);

  useEffect(() => {
    if (isAuctionFetched && auctionData) {
      setAuction({
        id: auctionData.id,
        title: auctionData.title,
        description: auctionData.description,
        startDate: auctionData.startDate,
        endDate: auctionData.endDate,
        lot: auctionData.lot,
      });
    }
  }, [auctionData, isAuctionFetched]);

  const onConfirm = async () => {
    if (!isAllRequiredFieldsFilled) return;

    try {
      await updateAuction({ isPublished: true });
      toast.success('The auction has been successfully published', {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <Container>
      {isShowedAlertDialog &&
        AlertDialog({
          title: 'Are you absolutely sure?',
          description: 'Are you sure you want to publish this auction?',
          cancelBtnTitle: 'Cancel',
          actionBtnTitle: 'Continue',
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm,
        })}
      <div className='mx-auto bg-white'>
        <Header
          isButtonDisabled={!isAllRequiredFieldsFilled}
          onBtnClick={() => {
            setIsShowedAlertDialog(true);
          }}
        />
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
                  showRequiredFieldIcon={true}
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
                  initialDescription={auction.description || ''}
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
                <LotInput auctionData={auction} showRequiredFieldIcon={true} />
              </div>
              <div className='flex flex-col gap-y-6'>
                <StartDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={auction.id}
                  showRequiredFieldIcon={true}
                />
                <EndDateInput
                  initialStartDate={auction.startDate}
                  initialEndDate={auction.endDate}
                  auctionId={auction.id}
                  showRequiredFieldIcon={true}
                />
                <CategoryInput
                  initialCategories={categoriesData}
                  auctionId={auction.id}
                  initialAuctionCategoryIds={auctionCategoriesData?.map(
                    (auctionCategory) => auctionCategory.categoryId
                  )}
                  isLoading={isCreateAuctionCategoriesPending}
                  showRequiredFieldIcon={true}
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
                {[...Array(3)].map((_, index) => (
                  <Skeleton className='h-24' key={index} />
                ))}
              </div>
              <div className='flex flex-col gap-y-6'>
                {' '}
                {[...Array(3)].map((_, index) => (
                  <Skeleton className='h-24' key={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AuctionIdPage;
