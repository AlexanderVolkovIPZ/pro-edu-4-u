'use client';

import { useAuction, useUpdateAuction } from '@/app/queries/auction';
import { AuctionWithRelationsType } from '@/app/types';
import AlertDialog from '@/components/alert-dialog';
import Container from '@/components/container';
import InputBox from '@/components/input-box';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { BookType } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTitleSchema } from '../_shared/schemas/title-schema';
import EndDateInput from './_components/end-date-input';
import Header from './_components/header';
import LotInput from './_components/lot-input';
import StartDateInput from './_components/start-date-input';
import DescriptionInput from './_shared/components/description-input';

type AuctionIdPageParams = {
  auctionId: string;
};

const AuctionIdPage = ({ params }: { params: AuctionIdPageParams }) => {
  const { t } = useTranslation();
  const { mutateAsync: updateAuction, isPending: isUpdateAuctionPending } = useUpdateAuction(params.auctionId);

  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);
  const { data: auctionData, isFetched: isAuctionFetched } = useAuction<AuctionWithRelationsType>(params.auctionId);

  const isAllRequiredFieldsFilled = [
    auctionData?.title,
    auctionData?.startDate && new Date(auctionData?.startDate) > new Date(),
    auctionData?.endDate,
    auctionData?.lot &&
      auctionData.lot.every(
        (lot) => lot.title && lot.startBid && lot.minBidIncrement && !!lot.photo.length && !!lot.lotCategory.length
      ),
  ].every(Boolean);

  const onConfirm = async () => {
    if (!isAllRequiredFieldsFilled) return;

    try {
      await updateAuction({ isPublished: true });
      toast.success(t('toast.success.the_auction_has_been_successfully_published'), {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  if (isAuctionFetched && !auctionData) {
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
          description: `${t('auction.are_you_sure_you_want_to_publish_this_auction')}?`,
          cancelBtnTitle: t('common.cancel'),
          actionBtnTitle: t('common.continue'),
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm,
        })}

      {isAuctionFetched && auctionData ? (
        <div className='mx-auto bg-white'>
          <Header isButtonDisabled={!isAllRequiredFieldsFilled} onBtnClick={() => setIsShowedAlertDialog(true)} />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
            <div className='flex flex-col gap-y-4'>
              <InputBox
                initialValue={auctionData?.title || ''}
                title={t('auction.title')}
                fieldName='title'
                schema={getTitleSchema(t)}
                isLoading={isUpdateAuctionPending}
                icon={BookType}
                registerOptions={{ required: true }}
                showRequiredFieldIcon={true}
                inputProps={{
                  required: true,
                }}
                onSubmit={async (title) => await updateAuction({ title })}
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
                initialDescription={auctionData?.description || ''}
                isPending={isUpdateAuctionPending}
                onSubmit={async (description) => {
                  await updateAuction({ description });
                }}
                onSuccess={() =>
                  toast.success(t('toast.success.the_description_has_been_successfully_updated'), {
                    style: {
                      textAlign: 'center',
                    },
                  })
                }
                onError={() => toast.error(t('toast.error.something_went_wrong'))}
              />
              <LotInput
                auctionData={{
                  id: params.auctionId,
                  lot: auctionData?.lot || [],
                }}
                showRequiredFieldIcon={true}
              />
            </div>

            <div className='flex flex-col gap-y-4'>
              <StartDateInput
                initialStartDate={auctionData?.startDate}
                auctionId={params.auctionId}
                showRequiredFieldIcon={true}
              />
              <EndDateInput
                initialEndDate={auctionData?.endDate}
                auctionId={params.auctionId}
                showRequiredFieldIcon={true}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
          <div className='flex flex-col gap-y-4'>
            {[...Array(3)].map((_, index) => (
              <Skeleton className='h-24' key={index} />
            ))}
          </div>
          <div className='flex flex-col gap-y-4'>
            {[...Array(2)].map((_, index) => (
              <Skeleton className='h-24' key={index} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default AuctionIdPage;
