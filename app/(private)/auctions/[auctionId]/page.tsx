'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useAuction, useUpdateAuction } from '@/app/queries/auction';
import { useUserAuctionsByFilter } from '@/app/queries/user-auction';
import { AuctionWithRelationsType } from '@/app/types';
import AlertDialog from '@/components/alert-dialog';
import Container from '@/components/container';
import InputBox from '@/components/input-box';
import NotFound from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { BookType } from 'lucide-react';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { titleSchema } from '../_shared/schemas/title-schema';
import EndDateInput from './_components/end-date-input';
import Header from './_components/header';
import LotInput from './_components/lot-input';
import StartDateInput from './_components/start-date-input';
import DescriptionInput from './_shared/components/description-input';

type AuctionIdPageParams = {
  auctionId: string;
};

const AuctionIdPage = ({ params }: { params: AuctionIdPageParams }) => {
  const authUser = useContext(AuthUserContext);
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);

  const { data: auctionData, isFetched: isAuctionFetched } = useAuction<AuctionWithRelationsType>(params.auctionId);
  const { data: userAuctionsData, isFetched: isUserAuctionsFetched } = useUserAuctionsByFilter(
    params.auctionId,
    {
      auctionId: params.auctionId,
      userId: authUser?.id,
      role: 'OWNER',
    },
    {
      enabled: !!authUser?.id && !!params.auctionId,
      staleTime: 600000,
    }
  );

  const { mutateAsync: updateAuction, isPending: isUpdateAuctionPending } = useUpdateAuction(params.auctionId);

  const isAllRequiredFieldsFilled = [
    auctionData?.title,
    auctionData?.startDate && new Date(auctionData?.startDate) > new Date(),
    auctionData?.endDate,
    auctionData?.lot &&
      auctionData.lot.every(
        (lot) => lot.title && lot.startBid && lot.minBidIncrement && lot.photo.length > 0 && lot.lotCategory.length > 0
      ),
  ].every(Boolean);

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
          description: 'Are you sure you want to publish this auction?',
          cancelBtnTitle: 'Cancel',
          actionBtnTitle: 'Continue',
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm,
        })}

      {isAuctionFetched && auctionData ? (
        <div className='mx-auto bg-white'>
          <Header
            isButtonDisabled={!isAllRequiredFieldsFilled}
            onBtnClick={() => {
              setIsShowedAlertDialog(true);
            }}
          />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
            <div className='flex flex-col gap-y-4'>
              <InputBox
                initialValue={auctionData?.title || ''}
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
                initialDescription={auctionData?.description || ''}
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
