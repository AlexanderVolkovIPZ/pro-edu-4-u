'use client';

import { getEmailSchema } from '@/app/_shared/schemas/email-schema';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { signIn, SignInOptions } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { z } from 'zod';

const authOptions: SignInOptions = {
  redirect: true,
  callbackUrl: '/',
};

type LoadingType = {
  google: boolean;
  github: boolean;
  credentials: boolean;
};

const getSignInSchema = (t: TFunction) =>
  z.object({
    ...getEmailSchema(t).shape,
    password: z.string().min(1, t('validation.password_is_required')),
  });

export default function SignIn() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(getSignInSchema(t)),
    mode: 'onBlur',
  });

  const [isLoading, setIsLoading] = useState<LoadingType>({
    google: false,
    github: false,
    credentials: false,
  });

  const onSubmit = async (data: FieldValues) => {
    if (isLoading.credentials || isLoading.github || isLoading.google) return;
    try {
      setIsLoading((prevState) => ({
        ...prevState,
        credentials: true,
      }));

      const response = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (response?.ok) {
        toast.success(t('toast.success.authentication_success'));
        router.push('/');
      }

      if (response?.error) {
        toast.error(t('toast.error.invalid_credentials'));
      }
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      setIsLoading((prevState) => ({
        ...prevState,
        credentials: false,
      }));
    }
  };

  return (
    <div className='mx-auto w-full max-w-[322px] space-y-4 rounded-lg bg-card p-6 shadow-lg'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold'>{t('common.sign_in')}</h2>
        <p className='text-muted-foreground'>{t('sign_in.enter_your_email_and_password_to_sign_in')}</p>
      </div>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='email' title='Email' />
          <Input
            id='email'
            type='email'
            placeholder='example@gmail.com'
            required
            {...register('email', { required: true })}
            error={errors['email'] as FieldError}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password' title='Password' />
          <Input
            id='password'
            type='password'
            placeholder={t('common.enter_a_secure_password')}
            required
            {...register('password', { required: true })}
          />
        </div>
        <Button className='w-full' type='submit' onClick={handleSubmit(onSubmit)} disabled={isLoading.credentials}>
          {isLoading.credentials ? <Spinner /> : t('common.sign_in')}
        </Button>
      </div>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-card px-2 text-muted-foreground'>{t('common.or_continue_with')}</span>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <Button
          variant='outline'
          className='relative'
          disabled={isLoading.github}
          onClick={async () => {
            setIsLoading((prevState) => ({
              ...prevState,
              github: true,
            }));

            const result = await signIn('github', authOptions);
            if (result?.error) {
              toast.error(t('toast.error.authentication_failed'));
            }

            setIsLoading((prevState) => ({
              ...prevState,
              github: false,
            }));
          }}
        >
          <AiFillGithub size={25} className='mr-0.5' />
          GitHub
          {isLoading.github && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Spinner color='text-rose-500' />
            </div>
          )}
        </Button>
        <Button
          variant='outline'
          className='relative'
          disabled={isLoading.google}
          onClick={async () => {
            setIsLoading((prevState) => ({
              ...prevState,
              google: true,
            }));

            const result = await signIn('google', authOptions);
            if (result?.error) {
              toast.error(t('toast.error.authentication_failed'));
            }

            setIsLoading((prevState) => ({
              ...prevState,
              google: false,
            }));
          }}
        >
          <FcGoogle size={25} className='mr-0.5' />
          Google
          {isLoading.google && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Spinner color='text-rose-500' />
            </div>
          )}
        </Button>
      </div>
      <div className='text-center text-sm text-muted-foreground'>
        {t('sign_in.dont_have_an_account')}
        <Link
          href='/sign-up'
          className='font-medium underline underline-offset-4 ml-1 hover:text-slate-700'
          prefetch={false}
        >
          {t('common.sign_up')}
        </Link>
      </div>
    </div>
  );
}
