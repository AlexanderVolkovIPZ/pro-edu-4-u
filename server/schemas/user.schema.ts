import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { paginationQuery } from './common';

/** Fields a user may change on their own profile. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
});

/** Fields only an administrator may change on any account. */
export const adminUpdateUserSchema = updateProfileSchema.extend({
  email: z.string().trim().email().max(254).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = paginationQuery;
