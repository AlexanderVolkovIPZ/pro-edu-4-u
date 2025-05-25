'use client';

import { AccountContext } from '@/app/providers/account-provider';
import { useUpdateAuction } from '@/app/queries/auction';
import { getDatePickerDateFormat, getDatePickerTimeFormat } from '@/app/utils/get-date-picker-format';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { CalendarPlus2, Pencil, PencilOff } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getAuctionDateSchema } from '../../_shared/schemas/auction-date-schema';

dayjs.extend(utc);
dayjs.extend(timezone);

type StartDateInputProps = {
  initialStartDate?: string;
  auctionId: string;
  showRequiredFieldIcon?: boolean;
};

const StartDateInput = ({ initialStartDate, auctionId, showRequiredFieldIcon = false }: StartDateInputProps) => {
  const { timeZone, locale } = useContext(AccountContext);
  const { mutateAsync, isPending } = useUpdateAuction(auctionId);
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isOpened, setIsOpened] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getAuctionDateSchema(t)),
    defaultValues: {
      startDate: selectedDate,
    },
  });

  const dateFormat = getDatePickerDateFormat(locale);
  const timeFormat = getDatePickerTimeFormat(locale);

  useEffect(() => {
    if (initialStartDate) {
      setSelectedDate(dayjs(initialStartDate).toDate());
    } else {
      setSelectedDate(new Date());
    }
  }, [initialStartDate]);

  const onSubmit = async (data: FieldValues) => {
    const { startDate } = data;
    const formattedStartDate = dayjs(startDate).tz(timeZone).second(0).format('YYYY-MM-DDTHH:mm:ssZ');

    try {
      await mutateAsync({
        startDate: formattedStartDate,
      });

      toast.success(t('toast.success.the_start_date_has_been_successfully_updated'), {
        style: {
          textAlign: 'center',
        },
      });

      setIsOpened(false);
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  return (
    <div className='px-4 py-3 rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor='startDate' className='block text-base font-semibold text-gray-700 relative'>
          {t('auction.start_date')}
          {showRequiredFieldIcon && <span className='text-rose-500 text-sm absolute top-0 -right-2'>*</span>}
        </label>
        <Button
          className='cursor-pointer hover:bg-transparent hover:scale-105 transition p-0'
          variant='ghost'
          onClick={() => setIsOpened((prev) => !prev)}
          type='button'
        >
          {isOpened ? <PencilOff className='w-5 h-5' /> : <Pencil className='w-5 h-5' />}
        </Button>
      </div>
      {isOpened ? (
        <>
          <div className='relative'>
            <DatePicker
              selected={watch('startDate') || selectedDate}
              onChange={(date) => setValue('startDate', date as Date)}
              showTimeSelect
              timeFormat={timeFormat}
              timeIntervals={5}
              dateFormat={`${dateFormat}, ${timeFormat}`}
              minDate={new Date()}
              maxDate={dayjs(new Date()).add(1, 'year').toDate()}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-slate-400'
              wrapperClassName='w-full'
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className='flex items-center justify-between px-2 py-2'>
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    type='button'
                    className='p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  >
                    {'<'}
                  </button>
                  <div className='text-lg font-bold text-gray-800'>{dayjs(date).format('MMMM YYYY')}</div>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    type='button'
                    className='p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  >
                    {'>'}
                  </button>
                </div>
              )}
            />
            <CalendarPlus2 className='w-5 h-5 absolute top-1/2 right-2 -translate-y-1/2' />
          </div>

          {errors.startDate && <p className='text-red-600'>{errors.startDate.message}</p>}

          <Button className='mt-3 relative' type='button' onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {t('common.save')}
            {isPending && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </Button>
        </>
      ) : (
        <div className={cn('text-slate-500 overflow-hidden text-ellipsis', !initialStartDate && 'italic')}>
          {initialStartDate ? selectedDate?.toLocaleString(locale) : t('auction.no_start_date')}
        </div>
      )}
    </div>
  );
};

export default StartDateInput;
