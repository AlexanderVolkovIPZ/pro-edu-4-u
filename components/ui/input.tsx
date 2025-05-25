'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FieldError } from 'react-hook-form';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  errorMsgPosition?: 'bottom-left' | 'bottom-right';
  shouldShowErrorMsg?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error = null, errorMsgPosition = 'bottom-left', shouldShowErrorMsg = true, ...props }, ref) => {
    const isPassword = type === 'password';
    const [shouldShowPassword, setShouldShowPassword] = useState(false);
    const getErrorMsgPosition = () => {
      switch (errorMsgPosition) {
        case 'bottom-left':
          return 'left-0';
        case 'bottom-right':
          return 'right-0';
      }
    };
    return (
      <div className='relative'>
        <div className='relative'>
          <input
            type={isPassword ? (shouldShowPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-400 bg-background  py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 pl-3 pr-8',
              className,
              error && 'border-red-500 ',
              !error && 'focus:border-gray-500'
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <div className='absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer'>
              {shouldShowPassword ? (
                <>
                  <EyeOff
                    color='#6b7280'
                    strokeWidth='1'
                    className='hover:scale-110 transition-all'
                    onClick={() => setShouldShowPassword((prev) => !prev)}
                  />
                </>
              ) : (
                <>
                  <Eye
                    color='#6b7280'
                    strokeWidth='1'
                    className='hover:scale-110 transition-all'
                    onClick={() => setShouldShowPassword((prev) => !prev)}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {error && shouldShowErrorMsg && (
          <p className={cn('text-xs text-red-500 absolute -bottom-4', getErrorMsgPosition())}>{error.message}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
