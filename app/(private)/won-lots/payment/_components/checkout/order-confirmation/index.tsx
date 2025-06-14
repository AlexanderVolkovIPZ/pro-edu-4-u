'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const OrderConfirmation = ({ totalAmount }: { totalAmount: number }) => {
  const { getValues } = useFormContext();
  const { t } = useTranslation();

  return (
    <Card className='border-rose-200 transform transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='text-rose-500' size={24} />
          {t('checkout.order_confirmation')}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='border-b pb-4'>
          <h3 className='font-medium mb-2'>{t('checkout.personal_information')}:</h3>
          <p>
            {getValues('firstName')} {getValues('lastName')}
          </p>
          <p>{getValues('phone')}</p>
          <p>{getValues('email')}</p>
        </div>

        <div className='border-b pb-4'>
          <h3 className='font-medium mb-2'>{t('checkout.shipping_address')}:</h3>
          <p>
            {getValues('city')}, {getValues('postalCode')}
          </p>
          <p>{getValues('address')}</p>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-lg font-medium'>{t('checkout.total_amount')}:</span>
          <span className='text-2xl font-bold text-rose-500'>₴{totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
