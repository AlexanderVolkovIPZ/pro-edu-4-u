import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './http-error';

type ErrorBody = { error: string; details?: unknown };

const json = (status: number, body: ErrorBody) => NextResponse.json(body, { status });

/**
 * Single place that maps thrown errors to HTTP responses:
 *  - HttpError  -> its status
 *  - ZodError   -> 400 with flattened issues
 *  - Prisma P2002 (unique violation) -> 409, P2025 (record not found) -> 404
 *  - anything else -> 500 (and logged with the route label)
 */
export function toErrorResponse(error: unknown, label = 'API'): NextResponse<ErrorBody> {
  if (error instanceof HttpError) {
    return json(error.status, { error: error.message, details: error.details });
  }

  if (error instanceof ZodError) {
    return json(400, { error: 'Validation failed', details: error.flatten() });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return json(409, { error: 'Resource already exists' });
    if (error.code === 'P2025') return json(404, { error: 'Resource not found' });
  }

  console.error(`${label}_ERROR ->`, error);
  return json(500, { error: 'Internal server error' });
}
