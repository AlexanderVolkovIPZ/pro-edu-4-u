'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputMask from 'react-input-mask';

const PersonalInformation = () => {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
  } = useFormContext();
  const { t } = useTranslation();

  return (
    <Card className='border-rose-200 transform transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='text-rose-500' size={24} />
          {t('checkout.personal_information')}
        </CardTitle>
      </CardHeader>

      <CardContent className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2 group'>
          <Label htmlFor='firstName' className='group-hover:text-rose-500 transition-colors'>
            {t('checkout.first_name')}
          </Label>
          <Input
            id='firstName'
            {...register('firstName')}
            className='border-rose-200 focus:ring-rose-500 transition-all'
            placeholder={t('checkout.enter_your_first_name')}
          />
          {touchedFields.firstName && errors.firstName && (
            <p className='text-xs text-red-500'>{errors.firstName.message as string}</p>
          )}
        </div>

        <div className='space-y-2 group'>
          <Label htmlFor='lastName' className='group-hover:text-rose-500 transition-colors'>
            {t('checkout.last_name')}
          </Label>
          <Input
            id='lastName'
            {...register('lastName')}
            className='border-rose-200 focus:ring-rose-500 transition-all'
            placeholder={t('checkout.enter_your_last_name')}
          />
          {touchedFields.lastName && errors.lastName && (
            <p className='text-xs text-red-500'>{errors.lastName.message as string}</p>
          )}
        </div>

        <div className='space-y-2 group'>
          <Label htmlFor='phone' className='group-hover:text-rose-500 transition-colors'>
            {t('checkout.phone')}
          </Label>
          <InputMask mask='+380 99 999 99 99' maskChar='_' value={watch('phone')} {...register('phone')}>
            {(inputProps) => (
              <Input
                {...inputProps}
                id='phone'
                type='tel'
                className='border-rose-200 focus:ring-rose-500 transition-all'
                placeholder='+380'
              />
            )}
          </InputMask>

          {touchedFields.phone && errors.phone && (
            <p className='text-xs text-red-500'>{errors.phone.message as string}</p>
          )}
        </div>

        <div className='space-y-2 group'>
          <Label htmlFor='email' className='group-hover:text-rose-500 transition-colors'>
            {t('checkout.email')}
          </Label>
          <Input
            id='email'
            {...register('email')}
            type='email'
            className='border-rose-200 focus:ring-rose-500 transition-all'
            placeholder='example@email.com'
          />
          {touchedFields.email && errors.email && (
            <p className='text-xs text-red-500'>{errors.email.message as string}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;
