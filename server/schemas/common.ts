import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid identifier');

/** Query-string booleans arrive as "true" / "false" strings. */
export const booleanQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(5),
});

/** Arrays are passed in the query string as JSON, e.g. `?lotsId=["a","b"]`. */
export const jsonStringArrayQuery = z
  .string()
  .transform((value, ctx) => {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed as string[];
      }
    } catch {
      // handled below
    }

    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Expected a JSON array of strings' });
    return z.NEVER;
  })
  .optional();

export const positiveMoney = z.number().finite().positive();
