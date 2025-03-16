'use client';

import { useStatsAdmin } from '@/app/queries/stats-admin';
import { capitalize } from '@/app/utils/capitalize';
import EmptyPage from '@/components/empty-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Annoyed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from './card';
import ChartAreaInteractive from './chart-area-interactive';

export default function DashboardStats() {
  const router = useRouter();
  const [daysPeriod, setDaysPeriod] = useState(30);
  const { data: statsAdminData, isFetching } = useStatsAdmin({
    days: daysPeriod,
    options: {
      staleTime: 1000 * 60 * 10,
    },
  });

  if (isFetching)
    return (
      <div className='flex flex-col gap-y-4 mt-2'>
        <div className='flex flex-wrap gap-4 align-middle justify-between'>
          {[...Array(3)].map((_, index) => (
            <Skeleton className='h-36 flex-grow' key={index} />
          ))}
        </div>
        <Skeleton className='h-96' />
      </div>
    );

  if (!statsAdminData)
    return (
      <EmptyPage
        className='mt-2'
        icon={Annoyed}
        title='Statistics not found'
        description='Looks like you have no statistics info'
        buttonTitle='Go to home page'
        onClick={() => router.push('/')}
      />
    );

  return (
    <div className='flex flex-col gap-y-4 mt-2'>
      <div className='flex flex-row flex-wrap gap-4 align-middle justify-between'>
        {Object.entries(statsAdminData.statInfo).map(([key, value], index) => {
          return (
            <div className='grow' key={key}>
              <Card
                index={index}
                title={`Total ${capitalize(key)} Growth`}
                growth={value.growth}
                totalCount={value.count}
              />
            </div>
          );
        })}
      </div>
      <div className='flex-1'>
        <ChartAreaInteractive
          daysPeriod={daysPeriod}
          setDaysPeriod={setDaysPeriod}
          salesInfo={statsAdminData.salesInfo}
        />
      </div>
    </div>
  );
}
