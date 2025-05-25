'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, CreditCard, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type BuyNowInfoProps = {
  lotId: string;
  lotName: string;
  auctionId: string;
  isBuyNowPurchase: boolean;
  shouldHideBuyNowDetails: boolean;
  buyNowBid?: number | null;
  isBoughtByCurrentUser?: boolean;
};

export function BuyNowInfo({
  lotId,
  lotName,
  auctionId,
  buyNowBid,
  isBuyNowPurchase,
  isBoughtByCurrentUser,
  shouldHideBuyNowDetails = true,
}: BuyNowInfoProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (isBoughtByCurrentUser && isBuyNowPurchase) {
    return (
      <div>
        <Alert className='bg-green-50 border-green-200'>
          <CheckCircle2 className='h-4 w-4 text-green-600' />
          <AlertTitle className='text-green-800'>{t('lot.congratulations_on_your_purchase')}</AlertTitle>
          <AlertDescription className='text-green-700'>
            {t('lot.you_have_successfully_purchased_the_lot', {
              lotName,
            })}
            .
          </AlertDescription>
        </Alert>
        <div className='mt-6 text-center'>
          <Button variant='outline' onClick={() => router.push(`/auctions/${auctionId}/overview`)}>
            {t('lot.return_to_catalog')}
          </Button>
        </div>
      </div>
    );
  }

  if (!isBoughtByCurrentUser && isBuyNowPurchase) {
    return (
      <div>
        <Alert className='bg-yellow-50 border-yellow-200'>
          <CheckCircle2 className='h-4 w-4 text-yellow-600' />
          <AlertTitle className='text-yellow-800'>{t('lot.lot_was_sold')}</AlertTitle>
          <AlertDescription className='text-yellow-700'>
            {t('lot.lot_was_purchased_by_another_user', {
              lotName,
            })}
            .
          </AlertDescription>
        </Alert>
        <div className='mt-6 text-center'>
          <Button variant='outline' onClick={() => router.push(`/auctions/${auctionId}/overview`)}>
            {t('lot.return_to_catalog')}
          </Button>
        </div>
      </div>
    );
  }

  if (shouldHideBuyNowDetails || !buyNowBid) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>{t('lot.instant_purchase_unavailable')}</AlertTitle>
        <AlertDescription>{t('lot.instant_purchase_unavailable_description')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div>
        <div className='flex justify-between items-center mb-4'>
          <span className='text-lg font-medium'>{t('buy_now.buy_now_price')}:</span>
          <span className='text-2xl font-bold text-green-600'>${buyNowBid.toLocaleString()}</span>
        </div>
        <p className='text-muted-foreground mb-4'>{t('buy_now.description')}.</p>
        <div className='bg-blue-50 p-4 rounded-lg mb-4'>
          <h3 className='font-medium text-blue-800 flex items-center gap-2'>
            <CreditCard className='h-4 w-4' /> {t('buy_now.advantages_of_buy_now')}:
          </h3>
          <ul className='list-disc list-inside mt-2 text-blue-700'>
            <li>{t('buy_now.advantages.guaranteed_lot')}</li>
            <li>{t('buy_now.advantages.no_competition')}</li>
            <li>{t('buy_now.advantages.fast_closure')}</li>
          </ul>
        </div>
      </div>

      <Button
        size='lg'
        className='w-full py-6 text-lg'
        onClick={() => router.push(`/won-lots/payment?info=${JSON.stringify([{ lotId, auctionId }])}`)}
      >
        <ShoppingCart className='mr-2 h-5 w-5' />
        {t('buy_now.buy_now_for')} ${buyNowBid.toLocaleString()}
      </Button>

      <p className='text-sm text-muted-foreground mt-4 text-center'>{t('buy_now.agreement_note')}.</p>
    </div>
  );
}
