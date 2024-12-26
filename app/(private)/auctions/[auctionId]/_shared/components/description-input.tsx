'use client';

import Editor from '@/components/editor';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, PencilOff } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { z } from 'zod';

const MAX_SYMBOLS_COUNT = 2000;

const descriptionSchema = z.object({
  description: z
    .string()
    .min(0)
    .max(2000, {
      message: 'Description must not exceed 2000 characters.',
    })
    .default(''),
});

type DescriptionInputProps = {
  initialDescription: string;
  isPending?: boolean;
  onSubmit: (title: string) => void;
  onSuccess?: () => void;
  onError?: () => void;
};

const DescriptionInput = ({
  initialDescription,
  isPending = false,
  onSubmit: onDescriptionSubmit,
  onSuccess,
  onError,
}: DescriptionInputProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const { handleSubmit, setValue, watch, reset } = useForm({
    resolver: zodResolver(descriptionSchema),
    mode: 'onBlur',
  });

  const onChange = (data: string) => {
    setValue('description', data, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: FieldValues) => {
    let { description } = data;
    if (description === '<p><br></p>') {
      description = '';
    }

    try {
      await onDescriptionSubmit(description.trim());
      setIsOpened(false);

      if (onSuccess) onSuccess();
    } catch {
      if (onError) onError();
    }
  };

  return (
    <div className='px-4 py-3 rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor='title' className='block text-base font-semibold text-gray-700'>
          Description
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
        <div className='relative'>
          <Editor
            onChange={onChange}
            value={watch('description') || initialDescription}
            defaultValue={initialDescription}
          />
          <div className={cn('absolute right-0 -bottom-4 text-xs text-slate-500')}>
            {watch('description')?.length || 0}/{MAX_SYMBOLS_COUNT}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap',
            !initialDescription && 'italic'
          )}
          dangerouslySetInnerHTML={{ __html: initialDescription || 'No description' }}
        ></div>
      )}

      {isOpened && (
        <Button className='mt-3 relative' type='submit' onClick={handleSubmit(onSubmit)} disabled={isPending}>
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

export default DescriptionInput;
