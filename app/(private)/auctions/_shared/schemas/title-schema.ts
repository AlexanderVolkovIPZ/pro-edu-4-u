import { TFunction } from 'i18next';
import { z } from 'zod';

export const getTitleSchema = (t: TFunction) =>
  z.object({
    title: z
      .string()
      .min(5, {
        message: t('validation.object_must_be_at_least', {
          object: t('validation.title'),
          value: 5,
          measurement: t('validation.characters'),
        }),
      })
      .max(30, {
        message: t('validation.object_must_be_at_most', {
          object: t('validation.title'),
          value: 30,
          measurement: t('validation.characters'),
        }),
      }),
  });
