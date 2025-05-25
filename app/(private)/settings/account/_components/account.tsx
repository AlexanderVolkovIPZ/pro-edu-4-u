'use client';

import { confirmPasswordSchema } from '@/app/_shared/schemas/confirm-password-schema';
import { getPasswordSchema } from '@/app/_shared/schemas/password-schema';
import { useChangePassword } from '@/app/queries/auth-user';
import AlertDialog from '@/components/alert-dialog';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import TabPageHeader from '../../_components/_shared/tab-page-header';
import FormField from './form-field';

const getChangePasswordSchema = (t: TFunction) =>
  z
    .object({
      oldPassword: z.string(),
      newPassword: getPasswordSchema(t).shape.password,
      confirmPassword: confirmPasswordSchema.shape.confirmPassword,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.password_do_not_match'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      message: t('validation.new_password_can_not_bew_same_as_old_password'),
      path: ['newPassword'],
    });

const Account = () => {
  const { t } = useTranslation();
  const { mutateAsync } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(getChangePasswordSchema(t)),
    mode: 'onBlur',
  });

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FieldValues>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      toast.success(t('toast.success.password_updated_successfully'));
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showAlertDialog &&
        AlertDialog({
          title: `${t('common.are_you_absolutely_sure')}?`,
          description: `${t('settings.are_you_sure_you_want_to_change_your_password')}?`,
          cancelBtnTitle: t('common.cancel'),
          actionBtnTitle: t('common.continue'),
          setShowAlertDialog,
          showAlertDialog,
          onConfirm,
        })}
      <div>
        <TabPageHeader title={t('settings.account_settings')} description={t('settings.settings_description')} />
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 mt-4'>
          <FormField
            id='oldPassword'
            label={t('settings.old_password')}
            type='password'
            register={register}
            error={errors.oldPassword as FieldError}
            placeholder={t('settings.enter_your_old_password')}
          />
          <FormField
            id='newPassword'
            label={t('settings.new_password')}
            type='password'
            register={register}
            error={errors.newPassword as FieldError}
            placeholder={t('settings.enter_a_new_secure_password')}
          />
          <FormField
            id='confirmPassword'
            label={t('settings.confirm_new_password')}
            type='password'
            register={register}
            error={errors.confirmPassword as FieldError}
            placeholder={t('settings.confirm_your_new_password')}
          />
          <Button type='submit' className='w-full py-2 rounded' disabled={isLoading}>
            {isLoading ? <Spinner /> : t('settings.save_changes')}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Account;
