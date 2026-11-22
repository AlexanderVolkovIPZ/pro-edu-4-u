import { HttpError } from '@/server/http/http-error';
import { withAuth, withErrorHandling } from '@/server/http/with-auth';
import { Prisma, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAuthUser = vi.hoisted(() => vi.fn());
vi.mock('@/app/actions/get-auth-user', () => ({ default: getAuthUser }));

const request = new Request('http://localhost/api/test');
const user = { id: 'user-id', role: UserRole.USER };

beforeEach(() => {
  getAuthUser.mockReset();
});

describe('withAuth', () => {
  it('responds 401 for anonymous requests without calling the handler', async () => {
    getAuthUser.mockResolvedValue(null);
    const handler = vi.fn();

    const response = await withAuth(handler)(request, { params: {} });

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('responds 403 when the role does not match', async () => {
    getAuthUser.mockResolvedValue(user);

    const response = await withAuth(async () => NextResponse.json({}), { role: UserRole.ADMIN })(request, {
      params: {},
    });

    expect(response.status).toBe(403);
  });

  it('passes the user and the params to the handler', async () => {
    getAuthUser.mockResolvedValue(user);
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));

    const response = await withAuth<{ id: string }>(handler)(request, { params: { id: '42' } });

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith({ request, params: { id: '42' }, authUser: user });
  });

  it('maps HttpError to its status', async () => {
    getAuthUser.mockResolvedValue(user);

    const response = await withAuth(async () => {
      throw HttpError.notFound('Lot not found');
    })(request, { params: {} });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Lot not found' });
  });

  it('maps validation and database errors', async () => {
    getAuthUser.mockResolvedValue(user);

    const zod = await withAuth(async () => {
      z.object({ amount: z.number() }).parse({ amount: 'x' });
      return NextResponse.json({});
    })(request, { params: {} });
    expect(zod.status).toBe(400);

    const duplicate = await withAuth(async () => {
      throw new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' });
    })(request, { params: {} });
    expect(duplicate.status).toBe(409);
  });

  it('hides unexpected errors behind a 500', async () => {
    getAuthUser.mockResolvedValue(user);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await withAuth(async () => {
      throw new Error('boom');
    })(request, { params: {} });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
    consoleError.mockRestore();
  });
});

describe('withErrorHandling', () => {
  it('does not require authentication', async () => {
    getAuthUser.mockResolvedValue(null);

    const response = await withErrorHandling(async () => NextResponse.json({ ok: true }))(request, { params: {} });

    expect(response.status).toBe(200);
    expect(getAuthUser).not.toHaveBeenCalled();
  });
});
