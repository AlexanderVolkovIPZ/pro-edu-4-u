'use client';

import { useCreateAuction } from '@/app/queries/auction';
import Container from '@/components/container';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Gavel } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { titleSchema } from '../_shared/schemas/title-schema';

const CreateAuctionPage = () => {
  const { mutateAsync, isPending } = useCreateAuction();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(titleSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FieldValues) => {
    const { title } = data;

    try {
      const { id } = await mutateAsync({
        title: title.trim(),
      });

      toast.success('The auction has been successfully created in draft status', {
        style: {
          textAlign: 'center',
        },
      });
      router.push(`/auctions/${id}`);
      reset();
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className='h-full flex items-center justify-center'>
      <Container>
        <div className='space-y-4 max-w-2xl'>
          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-extrabold text-gray-900'>
              <span className='text-violet-500'>Create</span> new <span className='text-rose-500'>auction</span>
            </h1>
            <p className='text-gray-500'>Enter a captivating title for your auction item</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-medium flex items-center text-gray-700'>
                <Gavel className='w-4 h-4 mr-2 text-rose-500' />
                Auction Title
              </Label>
              <Input
                id='title'
                placeholder="e.g. 'Timeless Artifacts'"
                {...register('title', { required: true })}
                error={errors['title'] as FieldError}
              />
            </div>
            <div className='flex items-center justify-between pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/auctions')}
                className='flex items-center text-gray-600 hover:text-gray-800'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <Button type='submit' className='relative' disabled={isPending}>
                Create auction
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
