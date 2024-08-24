'use client';

import { schema } from '@/app/(auth)/_shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import z from 'zod';

const signUpSchemaPartial = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])/, 'Must include at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must include at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain at least one number')
    .default(''),
  confirmPassword: z.string().default(''),
});

const signUpSchema = schema.merge(signUpSchemaPartial).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: FieldValues) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      console.log(data);
      reset({
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch {
      console.log('Something went wrong');
    } finally {
      setIsLoading(false);
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
        <Button className='w-full' type='submit' onClick={handleSubmit(onSubmit)}>
          Sign Up
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
        <Button variant='outline'>
          <AiFillGithub size={25} className='mr-0.5' />
          GitHub
        </Button>
        <Button variant='outline'>
          <FcGoogle size={25} className='mr-0.5' />
          Google
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
}
