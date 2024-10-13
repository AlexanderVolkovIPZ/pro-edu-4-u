'use client';

import { confirmPasswordSchema } from '@/app/_shared/schemes/confirm-password-schema';
import { passwordSchema } from '@/app/_shared/schemes/password-schema';
import { AccountContext } from '@/app/providers/account-provider';
import { useChangePassword } from '@/app/queries/auth-user';
import { capitalize } from '@/app/utils/capitalize';
import AlertDialog from '@/components/alert-dialog';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import TabPageHeader from '../_shared/tab-page-header';
import FormField from './_components/form-field';

const changePasswordSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: passwordSchema.shape.password,
    confirmPassword: confirmPasswordSchema.shape.confirmPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'New password cannot be the same as the old password',
    path: ['newPassword'],
  });

const Account = () => {
  const { mode, setMode } = useContext(AccountContext);
  const { mutateAsync } = useChangePassword();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [formData, setFormData] = useState<FieldValues>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FieldValues) => {
    if (isLoading) return;
    setFormData(data);

    setShowAlertDialog(true);
  };

  const onConfirm = async () => {
    try {
      setIsLoading(true);
      const { oldPassword, newPassword, confirmPassword } = formData;
      if (newPassword !== confirmPassword) return;

      await mutateAsync({
        oldPassword,
        newPassword,
      });

      reset();
      toast.success('Password updated successfully');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showAlertDialog &&
        AlertDialog({
          title: 'Are you absolutely sure?',
          description: 'Are you sure you want to change your password?',
          cancelBtnTitle: 'Cancel',
          actionBtnTitle: 'Continue',
          setShowAlertDialog,
          showAlertDialog,
          onConfirm,
        })}
      <div>
        <TabPageHeader title='Account Settings' description='Update your account settings below.' />
        <div className='flex items-center gap-x-4 my-6'>
          <Switch
            id='account-mode'
            className='bg-rose-500'
            checked={mode === 'teacher'}
            onCheckedChange={(checked) => {
              setMode(checked ? 'teacher' : 'student');
            }}
          />
          <Label htmlFor='account-mode' className='text-lg font-semibold text-slate-600'>
            {capitalize(mode)} Mode
          </Label>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            id='oldPassword'
            label='Old Password'
            type='password'
            register={register}
            error={errors.oldPassword as FieldError}
            placeholder='Enter your old password'
          />
          <FormField
            id='newPassword'
            label='New Password'
            type='password'
            register={register}
            error={errors.newPassword as FieldError}
            placeholder='Enter a new secure password'
          />
          <FormField
            id='confirmPassword'
            label='Confirm New Password'
            type='password'
            register={register}
            error={errors.confirmPassword as FieldError}
            placeholder='Confirm your new password'
          />
          <Button
            type='submit'
            className='w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded'
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Save Changes'}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Account;
