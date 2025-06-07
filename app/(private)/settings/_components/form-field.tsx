import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTMLInputTypeAttribute } from 'react';
import { FieldError, FieldValues, UseFormRegister } from 'react-hook-form';

type FormFieldProps = {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute;
  register: UseFormRegister<FieldValues>;
  error: FieldError;
  placeholder?: string;
};

const FormField = ({ id, label, type, register, error, placeholder = '' }: FormFieldProps) => (
  <div className='space-y-1'>
    <Label htmlFor={id} className='text-slate-700'>
      {label}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`w-full ${error ? 'border-red-500' : ''}`}
      {...register(id, { required: true })}
      error={error}
    />
  </div>
);

export default FormField;
