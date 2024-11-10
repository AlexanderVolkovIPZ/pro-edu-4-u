'use client';

import { AccountContext } from '@/app/providers/account-provider';
import { useUpdateAuction } from '@/app/queries/auction';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Pencil, PencilOff } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { auctionDateSchema, AuctionDateSchema } from '../_shared/auction-date-schema';
import { getDatePickerDateFormat, getDatePickerTimeFormat } from '@/app/utils/get-date-picker-format';

dayjs.extend(utc);
dayjs.extend(timezone);

type EndDateInputProps = {
  initialEndDate?: string;
  initialStartDate?: string;
  auctionId: string;
};

const EndDateInput = ({ initialStartDate, initialEndDate, auctionId }: EndDateInputProps) => {
  const { timeZone, locale } = useContext(AccountContext);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { mutateAsync, isPending } = useUpdateAuction(auctionId);

  const startDate = initialStartDate ? dayjs(initialStartDate).toDate() : undefined;
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuctionDateSchema>({
    resolver: zodResolver(auctionDateSchema),
    defaultValues: {
      startDate: startDate,
      endDate: selectedDate,
    },
  });

  const dateFormat = getDatePickerDateFormat(locale);
  const timeFormat = getDatePickerTimeFormat(locale);

  useEffect(() => {
    if (initialEndDate) {
      setSelectedDate(dayjs(initialEndDate).toDate());
    } else {
      setSelectedDate(new Date());
    }
  }, [initialEndDate]);

  const onSubmit = async (data: FieldValues) => {
    const { endDate } = data;
    const formattedEndDate = dayjs(endDate).tz(timeZone).second(0).format('YYYY-MM-DDTHH:mm:ssZ');

    try {
      await mutateAsync({
        endDate: formattedEndDate,
      });
      toast.success('The end date has been successfully updated', {
        style: {
          textAlign: 'center',
        },
      });
      setIsOpened(false);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className='px-4 py-3 rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor='endDate' className='block text-base font-semibold text-gray-700'>
          End date
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
          <div>
            <DatePicker
              selected={watch('endDate') || selectedDate}
              onChange={(date) => setValue('endDate', date as Date)}
              showTimeSelect
              timeFormat={timeFormat}
              timeIntervals={15}
              dateFormat={`${dateFormat}, ${timeFormat}`}
              minDate={new Date()}
              maxDate={dayjs(new Date()).add(1, 'year').toDate()}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-slate-400'
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
            {errors.endDate && <p className='text-red-600'>{errors.endDate.message}</p>}
          </div>

          <Button className='mt-3 relative' type='button' onClick={handleSubmit(onSubmit)} disabled={isPending}>
            Save
            {isPending && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </Button>
        </>
      ) : (
        <div className={cn('text-slate-500 overflow-hidden text-ellipsis', !initialEndDate && 'italic')}>
          {selectedDate?.toLocaleString(locale) ?? 'No end date'}
        </div>
      )}
    </div>
  );
};

export default EndDateInput;
