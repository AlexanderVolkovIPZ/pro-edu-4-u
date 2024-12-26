'use client';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { LucideIcon, Pencil, PencilOff } from 'lucide-react';
import { useState } from 'react';
import { FieldError, FieldValues, RegisterOptions, useForm } from 'react-hook-form';
import { z } from 'zod';

type InputBoxProps<T extends number | string> = {
  initialValue: T;
  title: string;
  fieldName: string;
  schema: z.ZodObject<{ [key: string]: z.ZodTypeAny }>;
  registerOptions?: RegisterOptions;
  isLoading?: boolean;
  inputProps?: InputProps;
  icon?: LucideIcon;
  onSubmit: (value: T) => Promise<unknown>;
  onSuccess?: () => void;
  onError?: () => void;
  setIsLoading?: (isLoading: boolean) => void;
};

const InputBox = <T extends number | string>({
  initialValue,
  title,
  fieldName,
  schema,
  registerOptions,
  isLoading = false,
  inputProps,
  icon: Icon,
  onSubmit: onPriceSubmit,
  onSuccess,
  onError,
  setIsLoading,
}: InputBoxProps<T>) => {
  const [isOpened, setIsOpened] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FieldValues) => {
    if (setIsLoading) setIsLoading(true);

    try {
      await onPriceSubmit(data[fieldName]);

      if (onSuccess) onSuccess();
      setIsOpened(false);
    } catch {
      if (onError) onError();
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className='px-4 py-3  rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor={fieldName} className='block text-base font-semibold text-gray-700'>
          {title}
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
          <Input
            id={fieldName}
            required
            {...inputProps}
            {...register(fieldName, registerOptions)}
            error={errors[fieldName] as FieldError}
            value={watch(fieldName) || initialValue}
          />
          {Icon && <Icon className='w-5 h-5 absolute top-1/2 right-2 -translate-y-1/2' />}
        </div>
      ) : (
        <div className={cn('text-slate-500 overflow-hidden text-ellipsis', !initialValue && 'italic')}>
          {initialValue || `No ${title.toLowerCase()}`}
        </div>
      )}
      {isOpened && (
        <Button
          className={cn('relative', errors[fieldName] ? 'mt-4' : 'mt-3')}
          type='submit'
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          Save
          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Spinner />
            </div>
          )}
        </Button>
      )}
    </div>
  );
};

export default InputBox;
