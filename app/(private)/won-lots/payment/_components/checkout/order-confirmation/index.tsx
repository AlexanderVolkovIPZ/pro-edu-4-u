import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const OrderConfirmation = ({ totalAmount }: { totalAmount: number }) => {
  const { getValues } = useFormContext();
  return (
    <Card className='border-rose-200 transform transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='text-rose-500' size={24} />
          Order Confirmation
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='border-b pb-4'>
          <h3 className='font-medium mb-2'>Personal Information:</h3>
          <p>
            {getValues('firstName')} {getValues('lastName')}
          </p>
          <p>{getValues('phone')}</p>
          <p>{getValues('email')}</p>
        </div>

        <div className='border-b pb-4'>
          <h3 className='font-medium mb-2'>Shipping Address:</h3>
          <p>
            {getValues('city')}, {getValues('postalCode')}
          </p>
          <p>{getValues('address')}</p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-600'>Product Cost:</span>
            <span className='font-medium'>${totalAmount.toFixed(2)}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-gray-600'>Shipping:</span>
            <span className='font-medium text-green-500'>Free</span>
          </div>
          <div className='h-px bg-gray-200 my-2' />
          <div className='flex items-center justify-between'>
            <span className='text-lg font-medium'>Total Amount:</span>
            <span className='text-2xl font-bold text-rose-500'>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
