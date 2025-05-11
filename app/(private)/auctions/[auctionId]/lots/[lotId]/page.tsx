'use client';

import { useCategory } from '@/app/queries/category';
import { useDeleteLot, useLot, useUpdateLot } from '@/app/queries/lot';
import { useCreateLotCategories } from '@/app/queries/lot-category';
import { useCreateLotDetails } from '@/app/queries/lot-detail';
import AlertDialog from '@/components/alert-dialog';
import Container from '@/components/container';
import ImageUploader from '@/components/image-uploader';
import InputBox from '@/components/input-box';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import VideoUploader from '@/components/video-uploader';
import { BookType, LucideDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTitleSchema } from '../../../_shared/schemas/title-schema';
import DescriptionInput from '../../_shared/components/description-input';
import CategoryInput from './_components/category-input';
import DetailInput from './_components/detail-input';
import Header from './_components/header';
import { createByNowBidSchema } from './_shared/schemas/buy-now-bid';
import { createMinBidIncrementSchema } from './_shared/schemas/min-bid-increment';
import { getStartBidSchema } from './_shared/schemas/start-bid';

type LotIdPageParams = {
  auctionId: string;
  lotId: string;
};

const LotIdPage = ({ params }: { params: LotIdPageParams }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const { data: lotData, isFetched: isLotFetched } = useLot(params.auctionId, params.lotId);
  const { mutateAsync: updateLot, isPending } = useUpdateLot(params.auctionId, params.lotId);
  const { mutateAsync: deleteLot } = useDeleteLot(params.auctionId, params.lotId);

  const { mutateAsync: createLotCategories, isPending: isCreateLotCategoriesPending } = useCreateLotCategories(
    params.auctionId,
    params.lotId
  );
  const { mutateAsync: createLotDetails } = useCreateLotDetails(params.auctionId, params.lotId);
  const { data: categoriesData, isFetched: isCategoriesFetched } = useCategory();

  const [isUpdating, setIsUpdating] = useState({
    isTitleUpdating: false,
    isStartBidUpdating: false,
    isMinBidIncrementUpdating: false,
    isBuyNowBidUpdating: false,
    isCreateLotDetailsUpdating: false,
  });
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);

  const isFetched = isLotFetched && isCategoriesFetched;

  const onDeleteLot = async () => {
    try {
      await deleteLot();

      toast.success(t('toast.success.lot_deleted_successfully'));

      router.push(`/auctions/${params.auctionId}`);
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      setIsShowedAlertDialog(false);
    }
  };

  if (isLotFetched && !lotData) {
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
          title: `${t('common.are_you_absolutely_sure')}?`,
          description: `${t('new_lot.are_you_sure_you_want_to_delete_this_lot')}?`,
          cancelBtnTitle: t('common.cancel'),
          actionBtnTitle: t('common.continue'),
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
                title={t('new_lot.title')}
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
                  placeholder: t('new_lot.enter_lot_title'),
                  required: true,
                }}
                schema={getTitleSchema(t)}
                onSubmit={async (title) => await updateLot({ title })}
                onSuccess={() =>
                  toast.success(t('toast.success.the_title_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <DescriptionInput
                initialDescription={lotData?.description ?? ''}
                isPending={isPending}
                onSubmit={async (description) => await updateLot({ description })}
                onSuccess={() =>
                  toast.success(t('toast.success.the_description_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <CategoryInput
                initialCategories={categoriesData}
                initialLotCategoryIds={lotData?.lotCategory?.map((lotCategory) => lotCategory.categoryId)}
                isLoading={isCreateLotCategoriesPending}
                showRequiredFieldIcon={true}
                onSubmit={async (data) => await createLotCategories(data)}
                onSuccess={() =>
                  toast.success(t('toast.success.the_categories_have_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <DetailInput
                title={`${t('new_lot.details')} (${t('new_lot.with_using_ai_to_select_icons')})`}
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
                onSubmit={async (fields) => await createLotDetails(fields)}
                onSuccess={() =>
                  toast.success(t('toast.success.the_lot_details_have_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <InputBox
                initialValue={lotData?.startBid ?? null}
                title={t('new_lot.start_bid')}
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
                  placeholder: t('new_lot.enter_start_bid'),
                  type: 'number',
                  step: 1,
                  min: 0,
                }}
                schema={getStartBidSchema(t)}
                onSubmit={async (startBid) => await updateLot({ startBid })}
                onSuccess={() =>
                  toast.success(t('toast.success.the_start_bid_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <InputBox
                initialValue={lotData?.minBidIncrement ?? null}
                title={t('new_lot.minimum_bid_increment')}
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
                  placeholder: t('new_lot.enter_minimum_bid_increment'),
                  type: 'number',
                  step: 1,
                  min: 0,
                }}
                schema={createMinBidIncrementSchema(t)}
                onSubmit={async (minBidIncrement) => await updateLot({ minBidIncrement })}
                onSuccess={() =>
                  toast.success(t('toast.success.the_minimum_bid_increment_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <InputBox
                initialValue={lotData?.buyNowBid ?? null}
                title={t('new_lot.buy_now_bid')}
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
                  placeholder: t('new_lot.enter_buy_now_bid'),
                  type: 'number',
                  step: 1,
                  min: 0,
                }}
                schema={createByNowBidSchema(t)}
                onSubmit={async (buyNowBid) => await updateLot({ buyNowBid })}
                onSuccess={() =>
                  toast.success(t('toast.success.the_buy_now_price_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
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
