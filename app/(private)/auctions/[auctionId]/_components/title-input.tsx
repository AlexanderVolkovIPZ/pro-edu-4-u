'use client';

import { useUpdateAuction } from '@/app/queries/auction';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, PencilOff } from 'lucide-react';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { titleSchema } from '../../_shared/title-schema';

type TitleInputProps = {
  initialTitle: string;
  auctionId: string;
};

const TitleInput = ({ initialTitle, auctionId }: TitleInputProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(titleSchema),
  });

  const { mutateAsync, isPending } = useUpdateAuction(auctionId);

  const onSubmit = async (data: FieldValues) => {
    const { title } = data;
    try {
      await mutateAsync({
        title: title.trim(),
      });
      toast.success('The title has been successfully updated', {
        style: {
          textAlign: 'center',
        },
      });
      setIsOpened(false);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className='px-4 py-3  rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor='title' className='block text-base font-semibold text-gray-700'>
          Title
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
          {isOpened ? <PencilOff className='w-5 h-5' /> : <Pencil className='w-5 h-5' />}
        </Button>
      </div>
      {isOpened ? (
        <Input
          id='title'
          placeholder='Enter auction title'
          required
          {...register('title', { required: true })}
          error={errors['title'] as FieldError}
          value={watch('title') || initialTitle}
        />
      ) : (
        <div className={cn('text-slate-500 overflow-hidden text-ellipsis', !initialTitle && 'italic')}>
          {initialTitle || 'No title'}
        </div>
      )}
      {isOpened && (
        <Button
          className={cn('relative', errors['title'] ? 'mt-4' : 'mt-3')}
          type='submit'
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          Save
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

export default TitleInput;
