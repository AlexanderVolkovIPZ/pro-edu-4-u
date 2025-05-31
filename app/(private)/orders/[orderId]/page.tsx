'use client';

import { User, MapPin, Phone, Mail, Annoyed } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrder } from '@/app/queries/order';
import Container from '@/components/container';
import Header from './_components/header';
import { formatDate } from '../../_utils/date-format';
import { Media, MediaSlider } from '@/components/media-slider';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyPage from '@/components/empty-page';
import { useTranslation } from 'react-i18next';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  SHIPPED: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  IN_TRANSIT: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-200',
  CANCELED: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const statusMessages = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
};

const OrderIdPage = ({ params }: { params: { orderId: string } }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: orderData, isFetching: isOrderFetching } = useOrder(params.orderId);

  if (isOrderFetching) {
    return (
      <Container>
        <Header />
        <div className='flex gap-4 mt-4'>
          <div className='flex flex-col gap-4 flex-grow-[2]'>
            <Skeleton className='h-64' />
            <Skeleton className='h-40' />
          </div>
          <div className='flex flex-col gap-4 flex-grow-[1]'>
            <Skeleton className='h-full' />
          </div>
        </div>
      </Container>
    );
  }

  if (!orderData) {
    return (
      <EmptyPage
        icon={Annoyed}
        title={t('common.your_table_is_empty')}
        description={t('order.looks_like_this_order_does_not_exist')}
        buttonTitle={t('order.go_to_home_page')}
        onClick={() => router.push('/')}
      />
    );
  }

  const lotMediaContent: Media[] = [
    ...(orderData?.lot.photo.map((photo) => ({ type: 'image' as const, src: photo.url })) ?? []),
  ];

  return (
    <Container>
      <Header />

      <div className='grid gap-4 md:grid-cols-3 mt-4'>
        <div className='md:col-span-2 space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex justify-between items-center'>
                <CardTitle>{t('order.delivery_status')}</CardTitle>
                <Badge className={statusColors[orderData.status]}>
                  {t(`order.statuses.${statusMessages[orderData.status]}`)}
                </Badge>
              </div>
              <CardDescription>
                {t('order.order_from', {
                  id: orderData.id,
                  date: formatDate(orderData.createdAt),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={''} alt={'NAME'} />
                    <AvatarFallback>
                      <User className='h-6 w-6' />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='font-medium'>
                      {orderData.firstName} {orderData.lastName}
                    </h3>
                    <p className='text-sm text-muted-foreground'>{t('order.customer')}</p>
                  </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>{t('order.destination')}</h3>
                    <div className='flex items-start gap-2 text-sm'>
                      <MapPin className='h-4 w-4 mt-0.5 text-muted-foreground' />
                      <div>
                        <p>{orderData.address}</p>
                        <p>
                          {orderData.city}, {orderData.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>{t('order.contact_information')}</h3>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span>{orderData.phone}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <span>{orderData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('order.payment')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-muted-foreground'>{t('order.payment_status')}</p>

                  <Badge variant={orderData.lot.bid[0]?.isPaid ? 'default' : 'outline'}>
                    {orderData.lot.bid[0]?.isPaid ? t('order.paid') : t('order.pending_payment')}
                  </Badge>
                </div>

                <Separator />

                <div className='flex justify-between items-center'>
                  <p className='font-medium'>{t('order.amount_due')}</p>
                  <p className='font-bold text-lg'>{orderData.lot.bid[0]?.amount} ₴</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('order.lot_information')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative overflow-hidden'>
              <MediaSlider
                media={lotMediaContent}
                alt='Images'
                imageProps={{ width: 300, height: 300 }}
                videoProps={{ width: 300, height: 300, controls: true }}
                sliderProps={{ className: 'rounded-lg flex-shrink-0' }}
              />
            </div>
            <div>
              <h3 className='font-medium'>{orderData.lot.title}</h3>
              <p className='text-sm text-muted-foreground'>
                {t('order.lot')} #{orderData.lotId}
              </p>
            </div>
            <Separator />
            <div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => router.push(`/auctions/${orderData.lot.auctionId}/lots/${orderData.lotId}/overview`)}
              >
                {t('order.check_lot_details')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default OrderIdPage;
