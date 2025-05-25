import { TFunction } from 'i18next';
import z from 'zod';

export const getPasswordSchema = (t: TFunction) =>
  z.object({
    password: z
      .string()
      .min(
        6,
        t('validation.object_must_be_at_least', {
          object: t('validation.password'),
          value: 6,
          measurement: t('validation.characters'),
        })
      )
      .regex(/(?=.*[a-z])/, t('validation.must_contain_at_least_one_lowercase_letter'))
      .regex(/(?=.*[A-Z])/, t('validation.must_contain_at_least_one_uppercase_letter'))
      .regex(/(?=.*\d)/, t('validation.must_contain_at_least_one_number'))
      .default(''),
  });
