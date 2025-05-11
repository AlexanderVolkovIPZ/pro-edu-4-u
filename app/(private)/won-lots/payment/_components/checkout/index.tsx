'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useBidsByFilter } from '@/app/queries/bid';
import { useCreatePayment } from '@/app/queries/payment';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import OrderConfirmation from './order-confirmation';
import PersonalInformation from './personal-information';
import ShippingAddress from './shipping-address';
import Steps from './steps';

const getValidationSchema = (t: TFunction) =>
  z.object({
    firstName: z.string().min(
      2,
      t('validation.object_must_be_at_least', {
        object: t('common.first_name'),
        value: 2,
        measurement: t('validation.characters'),
      })
    ),
    lastName: z.string().min(
      2,
      t('validation.object_must_be_at_least', {
        object: t('common.last_name'),
        value: 2,
        measurement: t('validation.characters'),
      })
    ),
    phone: z
      .string()
      .min(
        10,
        t('validation.object_must_be_at_least', {
          object: t('validation.phone_number'),
          value: 10,
          measurement: t('validation.characters'),
        })
      )
      .max(
        17,
        t('validation.object_must_be_at_most', {
          object: t('validation.phone_number'),
          value: 17,
          measurement: t('validation.characters'),
        })
      )
      .regex(/^\+?[0-9\s\-()]+$/, t('validation.invalid_phone_format')),
    email: z.string().email(t('validation.invalid_email_format')),
    city: z.string().min(
      2,
      t('validation.object_must_be_at_least', {
        object: t('validation.city'),
        value: 2,
        measurement: t('validation.characters'),
      })
    ),
    address: z.string().min(
      5,
      t('validation.object_must_be_at_least', {
        object: t('validation.address'),
        value: 5,
        measurement: t('validation.characters'),
      })
    ),
    postalCode: z
      .string()
      .min(
        4,
        t('validation.object_must_be_at_least', {
          object: t('validation.postal_code'),
          value: 4,
          measurement: t('validation.characters'),
        })
      )
      .max(
        10,
        t('validation.object_must_be_at_most', {
          object: t('validation.postal_code'),
          value: 10,
          measurement: t('validation.characters'),
        })
      )
      .regex(/^[0-9A-Za-z\s-]+$/, t('validation.invalid_postal_code_format')),
  });

const CheckoutPage = () => {
  const authUser = useContext(AuthUserContext);
  const { t } = useTranslation();

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

  const validationSchema = getValidationSchema(t);
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

  const [currentStep, setCurrentStep] = useState(1);
  const [isValid, setIsValid] = useState(false);

  const { trigger, getValues, watch } = methods;
  const fields = watch();

  const totalAmount = bidsData?.reduce((acc, { amount }) => acc + amount, 0) ?? 0;

  const onPay = async () => {
    const data = getValues();
    const lotsId = bidsData?.map(({ lot: { id } }) => id);

    if (!lotsId) return;

    try {
      const response = await createPayment({ lots: lotsId, shippingInfo: data });
      window.location.assign(response.url);
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  const getFieldsForStep = useCallback(
    (step: number): Array<keyof typeof validationSchema.shape> => {
      switch (step) {
        case 1:
          return ['firstName', 'lastName', 'phone', 'email'];
        case 2:
          return ['city', 'address', 'postalCode'];
        default:
          return [];
      }
    },
    [validationSchema]
  );

  useEffect(() => {
    const areFieldsValid = getFieldsForStep(currentStep).every(
      (field) => validationSchema.shape[field].safeParse(getValues(field)).success
    );

    setIsValid(areFieldsValid);
  }, [currentStep, fields, getFieldsForStep, getValues, validationSchema.shape]);

  const onNextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fields);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const onPrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
                {t('common.back')}
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type='button'
                onClick={onNextStep}
                disabled={!isValid}
                className='bg-rose-500 hover:bg-rose-600 text-white'
              >
                {t('common.next')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='button'
                onClick={async () => await onPay()}
                className='bg-rose-500 hover:bg-rose-600 text-white relative'
                disabled={isCreatePaymentPending || isFetchingBids}
              >
                {t('checkout.pay')}
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
