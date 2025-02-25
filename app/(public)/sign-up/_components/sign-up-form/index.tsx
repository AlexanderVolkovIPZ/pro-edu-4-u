'use client';

import { confirmPasswordSchema } from '@/app/_shared/schemas/confirm-password-schema';
import { emailSchema } from '@/app/_shared/schemas/email-schema';
import { passwordSchema } from '@/app/_shared/schemas/password-schema';
import { useCreateUser } from '@/app/queries/auth-user';
import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, SignInOptions } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';

const signUpSchema = emailSchema
  .merge(passwordSchema)
  .merge(confirmPasswordSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const authOptions: SignInOptions = {
  redirect: true,
  callbackUrl: '/',
};

type LoadingType = {
  google: boolean;
  github: boolean;
  credentials: boolean;
};

const SignUp = () => {
  const [isLoading, setIsLoading] = useState<LoadingType>({
    google: false,
    github: false,
    credentials: false,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });
  const { mutateAsync } = useCreateUser();

  const onSubmit = async (data: FieldValues) => {
    if (isLoading.credentials || isLoading.github || isLoading.google) return;
    try {
      setIsLoading((prevState) => ({
        ...prevState,
        credentials: true,
      }));
      const { email, password } = data;

      await mutateAsync({
        email,
        password,
      });
      reset({
        email: '',
        password: '',
        confirmPassword: '',
      });
      toast.success(
        () => (
          <div>
            <div className='text-center font-bold'>Registration Successful!</div>
            <div className='text-center'>Please check your email to confirm your account.</div>
          </div>
        ),
        {
          duration: 5000,
        }
      );
    } catch {
      toast.error('Something went wrong');
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
        <h2 className='text-2xl font-bold'>Sign Up</h2>
        <p className='text-muted-foreground'>Create a new account or get started</p>
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
            placeholder='Enter a secure password'
            required
            {...register('password', { required: true })}
            error={errors['password'] as FieldError}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='confirm-password' title='Confirm Password' />
          <Input
            id='confirm-password'
            type='password'
            placeholder='Confirm your password'
            required
            {...register('confirmPassword', { required: true })}
            error={errors['confirmPassword'] as FieldError}
          />
        </div>
        <Button className='w-full' type='submit' onClick={handleSubmit(onSubmit)} disabled={isLoading.credentials}>
          {isLoading.credentials ? <Spinner /> : 'Sign Up'}
        </Button>
      </div>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-card px-2 text-muted-foreground'>Or continue with</span>
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
              toast.error('Authentication failed');
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
              toast.error('Authentication failed');
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
        Already have an account?
        <Link
          href='/sign-in'
          className='font-medium underline underline-offset-4 ml-1 hover:text-slate-700'
          prefetch={false}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
