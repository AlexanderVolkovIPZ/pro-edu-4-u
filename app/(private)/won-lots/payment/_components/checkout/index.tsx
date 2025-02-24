'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useBidsByFilter } from '@/app/queries/bid';
import { useCreatePayment } from '@/app/queries/payment';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import OrderConfirmation from './order-confirmation';
import PersonalInformation from './personal-information';
import ShippingAddress from './shipping-address';
import Steps from './steps';

const validationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(17, 'Phone number must be at most 15 digits')
    .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  postalCode: z
    .string()
    .min(4, 'Postal code must be at least 4 characters')
    .max(10, 'Postal code must be at most 10 characters')
    .regex(/^[0-9A-Za-z\s-]+$/, 'Invalid postal code format'),
});

const CheckoutPage = () => {
  const authUser = useContext(AuthUserContext);

  const [isValid, setIsValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: authUser?.name?.split(' ')[0] || '',
      lastName: authUser?.name?.split(' ')[1] || '',
      phone: '',
      email: authUser?.email || '',
      city: '',
      address: '',
      postalCode: '',
    },
    mode: 'onChange',
  });
  const { trigger, getValues, watch } = methods;
  const fields = watch();

  const { data: bidsData, isFetching: isFetchingBids } = useBidsByFilter(
    {
      bidderId: authUser?.id,
      isWinner: true,
      isPaid: false,
    },
    {
      enabled: !!authUser?.id,
      staleTime: 1000 * 60,
    }
  );
  const { mutateAsync: createPayment, isPending: isCreatePaymentPending } = useCreatePayment();

  const totalAmount = bidsData?.reduce((acc, { amount }) => acc + amount, 0) ?? 0;

  const onPay = async () => {
    const data = getValues();
    const lotsId = bidsData?.map(({ lot: { id } }) => id);

    if (!lotsId) return;

    try {
      const response = await createPayment({ lots: lotsId, shippingInfo: data });
      window.location.assign(response.url);
    } catch {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    const areFieldsValid = getFieldsForStep(currentStep).every(
      (field) => validationSchema.shape[field].safeParse(getValues(field)).success
    );

    setIsValid(areFieldsValid);
  }, [currentStep, fields, getValues]);

  const getFieldsForStep = (step: number): Array<keyof typeof validationSchema.shape> => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'phone', 'email'];
      case 2:
        return ['city', 'address', 'postalCode'];
      default:
        return [];
    }
  };

  const onNextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fields);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const onPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformation />;
      case 2:
        return <ShippingAddress />;
      case 3:
        return <OrderConfirmation totalAmount={totalAmount} />;
      default:
        return null;
    }
  };

  if (!bidsData?.length) return null;

  return (
    <>
      <Steps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <FormProvider {...methods}>
        <form className='space-y-6'>
          {renderStepContent()}

          <div className='flex gap-4 justify-end'>
            {currentStep > 1 && (
              <Button type='button' onClick={onPrevStep} className='bg-gray-200 hover:bg-gray-300 text-gray-700'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type='button'
                onClick={onNextStep}
                disabled={!isValid}
                className='bg-rose-500 hover:bg-rose-600 text-white'
              >
                Next
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='button'
                onClick={async () => await onPay()}
                className='bg-rose-500 hover:bg-rose-600 text-white relative'
                disabled={isCreatePaymentPending || isFetchingBids}
              >
                Pay
                {isCreatePaymentPending ? (
                  <Spinner className='ml-1' width={20} height={20} />
                ) : (
                  <CreditCard className='ml-2 h-4 w-4' />
                )}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default CheckoutPage;
