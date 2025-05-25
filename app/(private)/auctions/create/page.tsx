'use client';

import { useCreateAuction } from '@/app/queries/auction';
import Container from '@/components/container';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTitleSchema } from '../_shared/schemas/title-schema';

const CreateAuctionPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { mutateAsync, isPending } = useCreateAuction();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(getTitleSchema(t)),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FieldValues) => {
    const { title } = data;
    try {
      const { id } = await mutateAsync({
        title: title.trim(),
      });

      toast.success(t('toast.success.the_auction_has_been_successfully_created_in_draft'), {
        style: {
          textAlign: 'center',
        },
      });

      router.push(`/auctions/${id}`);

      reset();
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  return (
    <div className='flex items-start justify-center'>
      <Container>
        <div className='bg-white rounded-xl max-w-2xl mx-auto'>
          <div className='text-center space-y-4 mb-8'>
            <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900'>
              <span className='text-violet-600'>{t('new_auction.create')}</span> {t('new_auction.new')}{' '}
              <span className='text-rose-500'>{t('new_auction.auction')}</span>
            </h1>

            <p className='text-gray-500 max-w-md mx-auto'>{t('new_auction.auction_title_hint')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-medium flex items-center text-gray-700'>
                <Sparkles className='w-4 h-4 mr-2 text-amber-500' />
                {t('new_auction.auction_title')}
              </Label>

              <Input
                id='title'
                placeholder={t('new_auction.auction_title_placeholder')}
                {...register('title', { required: true })}
                error={errors['title'] as FieldError}
              />
            </div>

            <div className='flex items-center justify-between gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/auctions')}
                className='flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                {t('new_auction.back_to_auctions')}
              </Button>

              <Button
                type='submit'
                disabled={isPending || !isValid}
                className={`relative px-6 py-2 bg-gradient-to-r from-violet-400 to-rose-500 hover:from-violet-400 hover:to-rose-400 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${
                  !isValid ? 'opacity-70' : ''
                }`}
              >
                <span className={isPending ? 'opacity-0' : 'opacity-100'}>{t('new_auction.create_auction')}</span>

                {isPending && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Spinner />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
};

export default CreateAuctionPage;
