import { ZodTypeAny, z } from 'zod';
import { HttpError } from './http-error';

/** Parses and validates a JSON request body against a Zod schema. */
export async function parseBody<S extends ZodTypeAny>(request: Request, schema: S): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw HttpError.badRequest('Request body must be valid JSON');
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw HttpError.fromZod(result.error);
  }

  return result.data;
}

/** Parses and validates URL search params against a Zod schema. */
export function parseQuery<S extends ZodTypeAny>(request: Request, schema: S): z.infer<S> {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

  const result = schema.safeParse(searchParams);
  if (!result.success) {
    throw HttpError.fromZod(result.error);
  }

  return result.data;
}
