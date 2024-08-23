'use client';

import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import z from 'zod';
import { schema } from '../_shared/schema';

const signUpSchemaPartial = z.object({
  confirmPassword: z.string(),
});

const signUpSchema = schema.merge(signUpSchemaPartial).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FieldValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };
  return (
    <Container>
      <div className='mx-auto w-full max-w-md space-y-4 rounded-lg bg-card p-6 shadow-lg'>
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
              error={errors['email']}
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
              error={errors['password']}
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
              error={errors['confirmPassword']}
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
    </Container>
  );
}
