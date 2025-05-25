import { TFunction } from 'i18next';
import z from 'zod';

export const getEmailSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .email({ message: t('validation.invalid_email_format') })
      .default(''),
  });
