import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ShippingAddress = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext();

  return (
    <Card className='border-rose-200 transform transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Truck className='text-rose-500' size={24} />
          {t('checkout.shipping_address')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2 group'>
            <Label htmlFor='city' className='group-hover:text-rose-500 transition-colors'>
              {t('checkout.city')}
            </Label>
            <Input
              id='city'
              {...register('city')}
              required
              className='border-rose-200 focus:ring-rose-500 transition-all'
              placeholder={t('checkout.enter_city')}
            />
            {touchedFields.city && errors.city && (
              <p className='text-xs text-red-500'>{errors.city.message as string}</p>
            )}
          </div>

          <div className='space-y-2 group'>
            <Label htmlFor='postalCode' className='group-hover:text-rose-500 transition-colors'>
              {t('checkout.postal_code')}
            </Label>
            <Input
              id='postalCode'
              {...register('postalCode')}
              required
              className='border-rose-200 focus:ring-rose-500 transition-all'
              placeholder={t('checkout.enter_postal_code')}
            />
            {touchedFields.postalCode && errors.postalCode && (
              <p className='text-xs text-red-500'>{errors.postalCode.message as string}</p>
            )}
          </div>

          <div className='sm:col-span-2 space-y-2 group'>
            <Label htmlFor='address' className='group-hover:text-rose-500 transition-colors'>
              {t('checkout.address')}
            </Label>
            <Input
              id='address'
              {...register('address')}
              required
              className='border-rose-200 focus:ring-rose-500 transition-all'
              placeholder={t('checkout.enter_delivery_address')}
            />
            {touchedFields.address && errors.address && (
              <p className='text-xs text-red-500'>{errors.address.message as string}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingAddress;
