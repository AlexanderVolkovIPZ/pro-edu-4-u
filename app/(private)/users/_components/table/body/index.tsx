'use client';

import { getEmailSchema } from '@/app/_shared/schemas/email-schema';
import { AccountContext } from '@/app/providers/account-provider';
import { useDeleteUser, useUpdateUser } from '@/app/queries/auth-user';
import { capitalize } from '@/app/utils/capitalize';
import { getDatePickerDateFormat, getDatePickerTimeFormat } from '@/app/utils/get-date-picker-format';
import AlertDialog from '@/components/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody as TableBodyComponent, TableCell, TableRow } from '@/components/ui/table';
import { UserRole } from '@prisma/client';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { ChevronDown, Trash } from 'lucide-react';
import type React from 'react';
import { useContext, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FieldError } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type TableBodyProps = {
  isLoading: boolean;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    emailVerified: string;
  }[];
};

type EditableCell = {
  userId: string;
  field: keyof Omit<TableBodyProps['users'][number], 'id'>;
  value: string;
  errorMessage?: FieldError | undefined;
};

export const getUserValidationSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .min(2)
        .max(50)
        .refine((value) => /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’\- ]+$/.test(value)),
    })
    .merge(getEmailSchema(t));

const Body = ({ isLoading, users }: TableBodyProps) => {
  const { locale } = useContext(AccountContext);
  const { t } = useTranslation();

  const [editableCell, setEditableCell] = useState<EditableCell | null>(null);
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const onCellClick = (userId: string, field: EditableCell['field'], value: string) =>
    setEditableCell({ userId, field, value });

  const onUpdate = async (value?: string) => {
    if (!editableCell) return;

    const editableUser = users.find((user) => user.id === editableCell?.userId);
    if (!editableUser) return;

    const existingFieldValue = editableUser[editableCell.field];
    const isUserFieldChanged = value ? existingFieldValue !== value : existingFieldValue !== editableCell.value;

    const onClose = () => setEditableCell(null);

    if (!isUserFieldChanged) {
      onClose();
      return;
    }

    const result = getUserValidationSchema(t)
      .partial()
      .safeParse({ [editableCell.field]: value ?? editableCell.value });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const errorMessage = fieldErrors[editableCell.field]?.[0];

      const fieldError: FieldError = {
        type: 'validation',
        message: errorMessage || t('users.validation_error'),
      };

      setEditableCell((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          errorMessage: fieldError,
        };
      });

      return;
    }

    try {
      await updateUser({
        id: editableCell.userId,
        [editableCell.field]: value ?? editableCell.value,
      });

      toast.success(`${capitalize(editableCell.field)} ${t('toast.success.field_updated_successfully')}`, {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      onClose();
    }
  };

  const onInputKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editableCell) {
      await onUpdate();
    } else if (e.key === 'Escape') {
      setEditableCell(null);
    }
  };

  const onDelete = async (userId: string | null) => {
    try {
      if (!userId) return;

      await deleteUser({
        id: userId,
      });

      toast.success(t('toast.success.the_user_deleted_successfully'), {
        style: {
          textAlign: 'center',
        },
      });

      setIsShowedAlertDialog(false);
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    }
  };

  const renderCell = (userId: string, field: EditableCell['field'], value: string, isDate = false) => {
    const textFields = ['name', 'email'];
    const dropdownFields = ['role'];
    const dateFields = ['emailVerified'];

    const isEditable = editableCell?.userId === userId && editableCell?.field === field;
    const isEditableTextField = isEditable && textFields.includes(field);
    const isEditableDropdownField = isEditable && dropdownFields.includes(field);
    const isEditableDateField = isEditable && dateFields.includes(field);

    if (isEditableTextField) {
      return (
        <Input
          value={editableCell.value}
          onChange={(e) => setEditableCell({ ...editableCell, value: e.target.value.trim() })}
          onBlur={async () => await onUpdate()}
          onKeyDown={async (e) => await onInputKeyDown(e)}
          className='h-7 w-auto max-w-[200px]'
          autoFocus
          width={200}
          error={editableCell.errorMessage}
          shouldShowErrorMsg={false}
        />
      );
    } else if (isEditableDropdownField) {
      const roleOptions = Object.values(UserRole);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='h-6 w-full justify-between'>
              {editableCell.value || 'Select role'}
              <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[200px]'>
            {roleOptions.map((role: string) => (
              <DropdownMenuItem key={role} onClick={async () => await onUpdate(role)}>
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else if (isEditableDateField) {
      const dateFormat = getDatePickerDateFormat(locale);
      const timeFormat = getDatePickerTimeFormat(locale);

      return (
        <DatePicker
          onCalendarClose={async () => {
            setEditableCell(null);
            await onUpdate();
          }}
          onKeyDown={async (e) => await onInputKeyDown(e)}
          withPortal={true}
          selected={editableCell.value ? new Date(editableCell.value) : new Date()}
          onChange={(date) => setEditableCell({ ...editableCell, value: date ? new Date(date).toISOString() : '' })}
          showTimeSelect
          timeFormat={timeFormat}
          dateFormat={`${dateFormat}, ${timeFormat}`}
          maxDate={dayjs(new Date()).add(1, 'year').toDate()}
          className='w-full h-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-slate-400'
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
      );
    }

    return (
      <div
        onClick={() => onCellClick(userId, field, value)}
        className={!isDate ? 'cursor-pointer hover:bg-gray-100 p-1 rounded' : ''}
      >
        {isDate ? (value ? new Date(value).toLocaleString(locale) : '--') : value}
      </div>
    );
  };

  const renderSkeletonRows = () =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-6 w-6 ml-2' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-6 w-6 ml-2' />
          </TableCell>
        </TableRow>
      ));

  const renderAuctionRows = () => {
    return users.map((user) => (
      <TableRow key={user.id} className='hover:bg-gray-50 text-sm'>
        <TableCell className='px-6 py-4 whitespace-nowrap text-gray-900 font-medium'>
          {renderCell(user.id, 'name', user.name)}
        </TableCell>
        <TableCell className='px-6 py-4 whitespace-nowrap'>{renderCell(user.id, 'email', user.email)}</TableCell>
        <TableCell className='px-6 py-4 whitespace-nowrap text-gray-500'>
          {renderCell(user.id, 'role', user.role)}
        </TableCell>
        <TableCell className='px-6 py-4 whitespace-nowrap text-gray-500'>
          {renderCell(user.id, 'createdAt', user.createdAt, true)}
        </TableCell>
        <TableCell className='px-6 py-4 whitespace-nowrap text-gray-500'>
          {renderCell(user.id, 'emailVerified', user.emailVerified, true)}
        </TableCell>
        <TableCell className='px-6 py-4 whitespace-nowrap text-gray-500'>
          <Trash
            className='mr-2 h-4 w-4 hover:scale-110 hover:text-rose-500 transition-all cursor-pointer'
            onClick={() => {
              setUserToDeleteId(user.id);
              setIsShowedAlertDialog(true);
            }}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      {isShowedAlertDialog &&
        AlertDialog({
          title: `${t('common.are_you_absolutely_sure')}?`,
          description: `${t('users.are_you_sure_you_want_to_delete_this_user')}?`,
          cancelBtnTitle: t('common.cancel'),
          actionBtnTitle: t('common.continue'),
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm: () => onDelete(userToDeleteId),
        })}
      <TableBodyComponent className='bg-white divide-y divide-gray-200'>
        {isLoading ? renderSkeletonRows() : renderAuctionRows()}
      </TableBodyComponent>
    </>
  );
};

export default Body;
