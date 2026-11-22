import { ZodError } from 'zod';

/**
 * Error that carries an HTTP status. Services and policies throw it and the
 * route wrapper (`withAuth` / `withErrorHandling`) turns it into a response,
 * so individual handlers never have to build error responses themselves.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Not found') {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new HttpError(409, message);
  }

  static fromZod(error: ZodError) {
    return new HttpError(400, 'Validation failed', error.flatten());
  }
}
