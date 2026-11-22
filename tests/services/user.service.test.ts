import { AccessPolicy } from '@/server/auth/access-policy';
import { UserService } from '@/server/services/user.service';
import { PrismaClient, UserRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

const admin = { id: 'admin-id', role: UserRole.ADMIN };
const user = { id: 'user-id', role: UserRole.USER };

function makeService() {
  const db = {
    user: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
  };

  return { db, service: new UserService(db as unknown as PrismaClient, new AccessPolicy()) };
}

describe('UserService.update', () => {
  it('lets users change their own profile', async () => {
    const { db, service } = makeService();

    await service.update(user, user.id, { name: 'New name' });

    expect(db.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'New name' } }));
  });

  it('forbids users to touch other accounts', async () => {
    const { service } = makeService();

    await expect(service.update(user, 'someone-else', { name: 'x' })).rejects.toMatchObject({ status: 403 });
  });

  it('forbids users to change their own role, email or activity', async () => {
    const { db, service } = makeService();

    await expect(service.update(user, user.id, { role: UserRole.ADMIN })).rejects.toMatchObject({ status: 403 });
    await expect(service.update(user, user.id, { isActive: false })).rejects.toMatchObject({ status: 403 });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('lets administrators change any account, including the role', async () => {
    const { db, service } = makeService();

    await service.update(admin, user.id, { role: UserRole.ADMIN, isActive: false });

    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: user.id }, data: { role: UserRole.ADMIN, isActive: false } })
    );
  });
});

describe('UserService.list', () => {
  it('is restricted to administrators', async () => {
    const { service } = makeService();

    await expect(service.list(user, { page: 1, limit: 5 })).rejects.toMatchObject({ status: 403 });
  });

  it('excludes the administrator and paginates', async () => {
    const { db, service } = makeService();
    db.user.count.mockResolvedValue(11);

    const page = await service.list(admin, { page: 2, limit: 5 });

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { not: admin.id } }, skip: 5, take: 5 })
    );
    expect(page).toMatchObject({ total: 11, totalPages: 3, page: 2, limit: 5 });
  });
});
