'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

type ChartAreaInteractiveProps = {
  daysPeriod: number;
  salesInfo: Record<string, number>;
  setDaysPeriod: (days: number) => void;
};

const ChartAreaInteractive = ({ daysPeriod, salesInfo, setDaysPeriod }: ChartAreaInteractiveProps) => {
  const { t, i18n } = useTranslation();
  const dataToDisplay = Object.entries(salesInfo).map(([key, value]) => {
    return {
      date: key,
      count: value,
    };
  });

  return (
    <Card>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1 text-center sm:text-left'>
          <CardTitle>{t('dashboard.area_chart_interactive')}</CardTitle>
          <CardDescription>{t('dashboard.showing_total_sales_for_date_range')}</CardDescription>
        </div>
        <Select value={`${daysPeriod}`} onValueChange={(value) => setDaysPeriod(parseInt(value))}>
          <SelectTrigger className='w-[160px] rounded-lg sm:ml-auto'>
            <SelectValue placeholder='Last 3 months' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='90' className='rounded-lg'>
              {t('dashboard.last_3_months')}
            </SelectItem>
            <SelectItem value='60' className='rounded-lg'>
              {t('dashboard.last_2_months')}
            </SelectItem>
            <SelectItem value='30' className='rounded-lg'>
              {t('dashboard.last_month')}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={{}} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={dataToDisplay}>
            <defs>
              <linearGradient id='fillCount' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#2a9d90' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#2a9d90' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => Intl.DateTimeFormat(i18n.language).format(new Date(value))}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => Intl.DateTimeFormat(i18n.language).format(new Date(value))}
                  indicator='dot'
                />
              }
            />
            <Area dataKey='count' type='natural' fill='url(#fillCount)' stroke='#2a9d90' />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartAreaInteractive;
