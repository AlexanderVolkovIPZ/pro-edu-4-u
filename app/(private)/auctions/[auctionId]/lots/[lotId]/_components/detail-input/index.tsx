'use client';

import { findClosestIconName } from '@/app/lib/ai/find-closest-icon-name';
import { iconsDictionary } from '@/app/lib/ai/icon-dictionary';
import { keyVectors } from '@/app/lib/ai/keyVectors';
import { generateUUID } from '@/app/utils/generate-uuid';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Pencil, PencilOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FieldError } from 'react-hook-form';
import { z } from 'zod';

const fieldsArraySchema = z.array(
  z.object({
    name: z.string().min(1, 'Field name is required'),
    value: z.string().min(1, 'Field value is required'),
  })
);

export type DetailInputProps = {
  title: string;
  initialFields?: { id: string; name: string; value: string }[];
  isLoading?: boolean;
  onSubmit: (fields: { fieldName: string; fieldValue: string; iconName: string }[]) => void;
  onSuccess?: () => void;
  onError?: () => void;
  setIsLoading?: (isLoading: boolean) => void;
};

const DetailInput = ({
  title,
  initialFields = [],
  isLoading = false,
  onSubmit: onFieldsSubmit,
  onSuccess,
  onError,
  setIsLoading,
}: DetailInputProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [fields, setFields] = useState(initialFields);
  const [errors, setErrors] = useState<Record<string, { name?: string; value?: string }>>({});

  const onAddField = () => {
    setFields([...fields, { name: '', value: '', id: generateUUID() }]);
  };

  const onRemoveField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors[id];
      return updatedErrors;
    });
  };

  const onFieldChange = (index: string, key: 'name' | 'value', value: string) => {
    setFields((prev) => prev.map((field) => (field.id === index ? { ...field, [key]: value } : field)));
  };

  const validateFields = () => {
    const validation = fieldsArraySchema.safeParse(fields.map(({ name, value }) => ({ name, value })));

    if (!validation.success) {
      const newErrors: Record<string, { name?: string; value?: string }> = {};
      validation.error.errors.forEach((err) => {
        const [index, fieldKey] = err.path;
        const fieldId = fields[+index].id;
        newErrors[fieldId] = {
          ...newErrors[fieldId],
          [fieldKey]: err.message,
        };
      });
      setErrors(newErrors);

      return false;
    }
    setErrors({});

    return true;
  };

  const onSubmit = async () => {
    if (!validateFields()) return;
    if (setIsLoading) setIsLoading(true);

    try {
      const formattedFields = await Promise.all(
        fields.map(async ({ name, value }) => ({
          fieldName: name,
          fieldValue: value,
          iconName: await findClosestIconName(name, Object.keys(iconsDictionary), keyVectors),
        }))
      );

      await onFieldsSubmit(formattedFields);

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
        <label htmlFor='Details' className='block text-base font-semibold text-gray-700 relative'>
          {title}
        </label>
        <Button
          className='cursor-pointer hover:bg-transparent hover:scale-105 transition p-0'
          variant='ghost'
          onClick={() => {
            setIsOpened((prev) => !prev);
          }}
          type='button'
        >
          {isOpened ? <PencilOff className='w-5 h-5' /> : <Pencil className='w-5 h-5' />}
        </Button>
      </div>

      {isOpened ? (
        <div className='flex flex-col gap-y-3'>
          {fields.map(({ name, value, id }) => (
            <div key={id} className='flex items-center gap-x-3'>
              <div className='flex-1'>
                <Input
                  placeholder='Field Name'
                  value={name}
                  onChange={(e) => onFieldChange(id, 'name', e.target.value)}
                  error={errors[id]?.name as FieldError | undefined}
                />
              </div>
              <div className='flex-1'>
                <Input
                  placeholder='Field Value'
                  value={value}
                  onChange={(e) => onFieldChange(id, 'value', e.target.value)}
                  error={errors[id]?.value as FieldError | undefined}
                />
              </div>
              <Trash2
                className='w-5 h-5 cursor-pointer hover:scale-110 transition hover:text-rose-600'
                onClick={() => onRemoveField(id)}
              />
            </div>
          ))}

          <div className='flex space-x-4'>
            <Button onClick={onAddField}>Add Field</Button>

            <Button className='relative' variant='secondary' onClick={onSubmit} disabled={isLoading}>
              Save Fields
              {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Spinner color='text-rose-500' />
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn('text-slate-500', !initialFields.length && 'italic')}>
          {initialFields.length ? (
            <ul className='list-disc list-inside space-y-1'>
              {initialFields.map(({ id, name, value }) => (
                <li key={id} className='truncate'>
                  <span className='font-semibold'>{name}:</span> {value}
                </li>
              ))}
            </ul>
          ) : (
            <span>No details</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailInput;
