'use client';

import { useCreateLot, useReorderLots } from '@/app/queries/lot';
import { AuctionWithLotsType } from '@/app/types';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleMinus, CirclePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTitleSchema } from '../../../_shared/schemas/title-schema';
import LotList from '../lot-list';

type LotInputProps = {
  auctionData: Pick<AuctionWithLotsType, 'id' | 'lot'>;
  showRequiredFieldIcon?: boolean;
};

const LotInput = ({ auctionData, showRequiredFieldIcon = false }: LotInputProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(getTitleSchema(t)),
  });

  const { mutateAsync: reorderMutateAsync, isPending: isReorderPending } = useReorderLots(auctionData.id);
  const { mutateAsync, isPending } = useCreateLot(auctionData.id);

  const [isOpened, setIsOpened] = useState(false);

  const onSubmit = async (data: FieldValues) => {
    const { title } = data;

    try {
      await mutateAsync({
        title: title.trim(),
        auctionId: auctionData.id,
      });

      toast.success(t('toast.success.the_lot_has_been_successfully_created'), {
        style: {
          textAlign: 'center',
        },
      });

      setIsOpened(false);
      router.refresh();
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  return (
    <div className='px-4 py-3  rounded-lg border-slate-300 border-[1.4px] relative'>
      {isReorderPending && (
        <div className='flex items-center justify-center absolute top-0 left-0 w-full h-full z-10 bg-slate-200 opacity-40 '>
          <Spinner className='' color='text-rose-500' width={40} height={40} />
        </div>
      )}
      <div className='flex items-center justify-between'>
        <label htmlFor='title' className='block text-base font-semibold text-gray-700 relative'>
          {t('auction.auction_lots')}
          {showRequiredFieldIcon && <span className='text-rose-500 text-sm absolute top-0 -right-2'>*</span>}
        </label>
        <Button
          className='cursor-pointer hover:bg-transparent hover:scale-105 transition p-0'
          variant='ghost'
          onClick={() => {
            setIsOpened((prev) => !prev);
            reset();
          }}
          type='button'
        >
          {isOpened ? <CircleMinus className='w-5 h-5' /> : <CirclePlus className='w-5 h-5' />}
        </Button>
      </div>
      {isOpened ? (
        <Input
          id='title'
          placeholder={t('auction.enter_lot_title')}
          required
          {...register('title', { required: true })}
          error={errors['title'] as FieldError}
          value={watch('title')}
        />
      ) : (
        <>
          {auctionData.lot.length ? (
            <LotList
              auctionData={auctionData}
              reorderMutateAsync={async ({ lotId, newPosition }) => {
                await reorderMutateAsync({
                  draggableId: lotId,
                  newPosition,
                  ...auctionData,
                });
              }}
            />
          ) : (
            <p className='text-slate-500 overflow-hidden text-ellipsis italic'>{t('auction.no_lots_yet')}</p>
          )}
        </>
      )}
      {isOpened && (
        <Button
          className={cn('relative', errors['title'] ? 'mt-4' : 'mt-3')}
          type='submit'
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {t('common.create')}
          {isPending && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Spinner />
            </div>
          )}
        </Button>
      )}
    </div>
  );
};

export default LotInput;
