import getAuthUser from '@/app/actions/get-auth-user';
import { AuthUser } from '@/app/_shared/types/auth-user';
import { UserRole } from '@prisma/client';
import { toErrorResponse } from './error-response';
import { HttpError } from './http-error';

type Params = Record<string, string>;

export type RouteContext<P extends Params> = { params: P };

export type HandlerArgs<P extends Params> = { request: Request; params: P };
export type AuthedHandlerArgs<P extends Params> = HandlerArgs<P> & { authUser: AuthUser };

export type RouteHandler<P extends Params> = (request: Request, context: RouteContext<P>) => Promise<Response>;

type Options = {
  /** Human readable label used when logging unexpected errors. */
  label?: string;
};

type AuthOptions = Options & {
  /** When set, only users with this role may call the handler. */
  role?: UserRole;
};

/**
 * Wraps a route handler with centralised error handling (see `toErrorResponse`).
 * Use it for public endpoints (registration, webhooks, ...).
 */
export function withErrorHandling<P extends Params = Params>(
  handler: (args: HandlerArgs<P>) => Promise<Response>,
  options: Options = {}
): RouteHandler<P> {
  return async (request, context) => {
    try {
      return await handler({ request, params: context?.params ?? ({} as P) });
    } catch (error) {
      return toErrorResponse(error, options.label);
    }
  };
}

/**
 * Decorator for authenticated route handlers. It resolves the current user,
 * rejects anonymous (401) or under-privileged (403) requests and converts
 * every thrown error into a proper HTTP response. Handlers receive the
 * resolved `authUser` and never deal with sessions themselves.
 */
export function withAuth<P extends Params = Params>(
  handler: (args: AuthedHandlerArgs<P>) => Promise<Response>,
  options: AuthOptions = {}
): RouteHandler<P> {
  return withErrorHandling<P>(async ({ request, params }) => {
    const authUser = await getAuthUser();
    if (!authUser) {
      throw HttpError.unauthorized();
    }

    if (options.role && authUser.role !== options.role) {
      throw HttpError.forbidden();
    }

    return handler({ request, params, authUser });
  }, options);
}
