'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useBidsByFilter } from '@/app/queries/bid';
import { useLot } from '@/app/queries/lot';
import { useCreatePayment } from '@/app/queries/payment';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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

const tryParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const CheckoutPage = () => {
  const authUser = useContext(AuthUserContext);
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const lotsId = searchParams?.get('id');
  const lotInfo = searchParams?.get('info');

  const lotsIdParsed = lotsId ? (tryParse(lotsId) ?? []) : [];
  const lotInfoParsed = lotInfo ? (tryParse(lotInfo) ?? [{}])[0] : {};

  const isAuctionBidMode = !!lotsIdParsed.length;
  const isBuyNowMode = !!lotInfoParsed.auctionId && !!lotInfoParsed.lotId;

  const { data: bidsData, isFetching: isFetchingBids } = useBidsByFilter(
    {
      bidderId: authUser?.id,
      isWinner: true,
      isPaid: false,
      lotsId: lotsIdParsed,
    },
    {
      enabled: !!authUser?.id && isAuctionBidMode,
      staleTime: 1000 * 60,
    }
  );

  const { data: lotData, isFetching: isFetchingLot } = useLot(lotInfoParsed.auctionId, lotInfoParsed.lotId, {
    enabled: isBuyNowMode,
  });

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

  const totalAmount = isAuctionBidMode
    ? (bidsData?.reduce((acc, { amount }) => acc + amount, 0) ?? 0)
    : (lotData?.buyNowBid ?? 0);

  const isLoading = isFetchingBids || isFetchingLot || isCreatePaymentPending;

  const onPay = async () => {
    const data = getValues();

    let paymentData;

    if (isAuctionBidMode && bidsData) {
      const lotsId = bidsData.map(({ lot: { id } }) => id);
      paymentData = { lots: lotsId, shippingInfo: data, bidType: 'BIDDING' as const };
    } else if (isBuyNowMode && lotData) {
      paymentData = { lots: [lotData.id], shippingInfo: data, bidType: 'INSTANT' as const };
    } else {
      toast.error(t('toast.error.no_lots_selected'));
      return;
    }

    try {
      const response = await createPayment(paymentData);
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

  const hasData = (isAuctionBidMode && bidsData?.length) || (isBuyNowMode && lotData?.buyNowBid);

  if (isFetchingBids || isFetchingLot) {
    return <Skeleton className='w-full h-72' />;
  }

  if ((isAuctionBidMode || isBuyNowMode) && !hasData) {
    return <div className='text-center py-8'>{t('checkout.no_lots_to_pay')}</div>;
  }

  return (
    <>
      <Steps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <FormProvider {...methods}>
        <form className='space-y-6'>
          {renderStepContent()}

          <div className='flex gap-4 justify-end'>
            {currentStep > 1 && (
              <Button
                type='button'
                onClick={onPrevStep}
                className='bg-gray-200 hover:bg-gray-300 text-gray-700'
                disabled={isLoading}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                {t('common.back')}
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type='button'
                onClick={onNextStep}
                disabled={!isValid || isLoading}
                className='bg-rose-500 hover:bg-rose-600 text-white'
              >
                {t('common.next')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='button'
                onClick={onPay}
                className='bg-rose-500 hover:bg-rose-600 text-white relative'
                disabled={isLoading}
              >
                {t('checkout.pay')}
                {isLoading ? (
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
