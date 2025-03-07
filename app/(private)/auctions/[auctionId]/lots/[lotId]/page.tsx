'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useCategory } from '@/app/queries/category';
import { useDeleteLot, useLot, useUpdateLot } from '@/app/queries/lot';
import { useCreateLotCategories } from '@/app/queries/lot-category';
import { useCreateLotDetails } from '@/app/queries/lot-detail';
import { useUserAuctionsByFilter } from '@/app/queries/user-auction';
import AlertDialog from '@/components/alert-dialog';
import Container from '@/components/container';
import ImageUploader from '@/components/image-uploader';
import InputBox from '@/components/input-box';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import VideoUploader from '@/components/video-uploader';
import { BookType, LucideDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { titleSchema } from '../../../_shared/schemas/title-schema';
import DescriptionInput from '../../_shared/components/description-input';
import CategoryInput from './_components/category-input';
import DetailInput from './_components/detail-input';
import Header from './_components/header';
import { buyNowBidSchema } from './_shared/schemas/buy-now-bid';
import { minBidIncrementSchema } from './_shared/schemas/min-bid-increment';
import { startBidSchema } from './_shared/schemas/start-bid';
import { AuctionRole } from '@prisma/client';

type LotIdPageParams = {
  auctionId: string;
  lotId: string;
};

const LotIdPage = ({ params }: { params: LotIdPageParams }) => {
  const authUser = useContext(AuthUserContext);
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState({
    isTitleUpdating: false,
    isStartBidUpdating: false,
    isMinBidIncrementUpdating: false,
    isBuyNowBidUpdating: false,
    isCreateLotDetailsUpdating: false,
  });
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);

  const { data: lotData, isFetched: isLotFetched } = useLot(params.auctionId, params.lotId);
  const { data: categoriesData, isFetched: isCategoriesFetched } = useCategory();

  const { mutateAsync: createLotCategories, isPending: isCreateLotCategoriesPending } = useCreateLotCategories(
    params.auctionId,
    params.lotId
  );
  const { mutateAsync: createLotDetails } = useCreateLotDetails(params.auctionId, params.lotId);
  const { data: userAuctionsData, isFetched: isUserAuctionsFetched } = useUserAuctionsByFilter(
    params.auctionId,
    {
      auctionId: params.auctionId,
      userId: authUser?.id,
      role: AuctionRole.OWNER,
    },
    {
      enabled: !!authUser?.id && !!params.auctionId,
      staleTime: 600000,
    }
  );

  const { mutateAsync: updateLot, isPending } = useUpdateLot(params.auctionId, params.lotId);
  const { mutateAsync: deleteLot } = useDeleteLot(params.auctionId, params.lotId);

  const isFetched = isLotFetched && isCategoriesFetched;

  const onDeleteLot = async () => {
    try {
      await deleteLot();

      toast.success('Lot deleted successfully');

      router.push(`/auctions/${params.auctionId}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsShowedAlertDialog(false);
    }
  };

  if (isUserAuctionsFetched && !userAuctionsData?.length) {
    return (
      <Container>
        <NotFound />
      </Container>
    );
  }

  return (
    <Container>
      {isShowedAlertDialog &&
        AlertDialog({
          title: 'Are you absolutely sure?',
          description: 'Are you sure you want to delete this lot?',
          cancelBtnTitle: 'Cancel',
          actionBtnTitle: 'Continue',
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm: onDeleteLot,
        })}
      {isFetched ? (
        <>
          <Header auctionLink={`/auctions/${params.auctionId}`} setShowAlertDialog={setIsShowedAlertDialog} />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
            <div className='flex flex-col gap-y-4'>
              <InputBox
                initialValue={lotData?.title ?? ''}
                title='Title'
                fieldName='title'
                isLoading={isUpdating.isTitleUpdating}
                showRequiredFieldIcon={true}
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
                  await updateLot({ title });
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
                initialDescription={lotData?.description ?? ''}
                isPending={isPending}
                onSubmit={async (description) => {
                  await updateLot({ description });
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
              <CategoryInput
                initialCategories={categoriesData}
                initialLotCategoryIds={lotData?.lotCategory?.map((lotCategory) => lotCategory.categoryId)}
                isLoading={isCreateLotCategoriesPending}
                showRequiredFieldIcon={true}
                onSubmit={async (data) => {
                  await createLotCategories(data);
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
              <DetailInput
                title='Details (with using AI to select icons)'
                isLoading={isUpdating.isCreateLotDetailsUpdating}
                setIsLoading={(isLoading) =>
                  setIsUpdating((prev) => ({
                    ...prev,
                    isCreateLotDetailsUpdating: isLoading,
                  }))
                }
                initialFields={lotData?.lotDetail.map((lotDetail) => ({
                  id: lotDetail.id,
                  name: lotDetail.fieldName,
                  value: lotDetail.fieldValue,
                }))}
                onSubmit={async (fields) => {
                  await createLotDetails(fields);
                }}
                onSuccess={() => {
                  toast.success('The lot details has been successfully updated', {
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
                initialValue={lotData?.startBid ?? null}
                title='Start bid'
                fieldName='startBid'
                icon={LucideDollarSign}
                isLoading={isUpdating.isStartBidUpdating}
                showRequiredFieldIcon={true}
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
                  min: 0,
                }}
                schema={startBidSchema}
                onSubmit={async (startBid) => {
                  await updateLot({ startBid });
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
                initialValue={lotData?.minBidIncrement ?? null}
                title='Minimum bid increment'
                fieldName='minBidIncrement'
                icon={LucideDollarSign}
                isLoading={isUpdating.isMinBidIncrementUpdating}
                showRequiredFieldIcon={true}
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
                  min: 0,
                }}
                schema={minBidIncrementSchema}
                onSubmit={async (minBidIncrement) => {
                  await updateLot({ minBidIncrement });
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
                initialValue={lotData?.buyNowBid ?? null}
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
                  min: 0,
                }}
                schema={buyNowBidSchema}
                onSubmit={async (buyNowBid) => {
                  await updateLot({ buyNowBid });
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
            <div className='flex flex-col gap-y-4'>
              <ImageUploader
                auctionId={params.auctionId}
                lotId={params.lotId}
                images={lotData?.photo ?? []}
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
                videos={lotData?.video ?? []}
                dropzoneOptions={{
                  accept: {
                    'video/*': ['.mp4', '.webm', '.ogg'],
                  },
                  multiple: true,
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
          <div className='flex flex-col gap-y-4'>
            {[...Array(5)].map((_, index) => (
              <Skeleton className='h-24' key={index} />
            ))}
          </div>
          <div className='flex flex-col gap-y-4'>
            {[...Array(2)].map((_, index) => (
              <Skeleton className='h-40' key={index} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default LotIdPage;
