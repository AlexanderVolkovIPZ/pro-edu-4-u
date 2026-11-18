import prismaDb from '@/lib/prismadb';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { adminUpdateUserSchema, listUsersQuerySchema } from '../schemas/user.schema';

type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
type UpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Fields that only an administrator may change. */
const ADMIN_ONLY_FIELDS = ['email', 'role', 'isActive'] as const;

export class UserService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy
  ) {}

  /** Administrators list every user except themselves. */
  async list(admin: Principal, { page, limit }: ListUsersQuery) {
    this.policy.assertAdmin(admin);

    const where = { id: { not: admin.id } };

    const [total, users] = await Promise.all([
      this.db.user.count({ where }),
      this.db.user.findMany({ where, select: publicUserSelect, take: limit, skip: (page - 1) * limit }),
    ]);

    return { users, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  /**
   * Users may edit their own profile fields; only administrators may change
   * email, role or activity status. Passwords are changed through
   * `AuthService.changePassword`, never through this method.
   */
  async update(actor: Principal, targetUserId: string, data: UpdateUserInput) {
    this.policy.assertSelfOrAdmin(actor, targetUserId);

    if (!this.policy.isAdmin(actor)) {
      const restricted = ADMIN_ONLY_FIELDS.filter((field) => data[field] !== undefined);
      if (restricted.length) {
        throw HttpError.forbidden(`Only administrators may change: ${restricted.join(', ')}`);
      }
    }

    return this.db.user.update({ where: { id: targetUserId }, data, select: publicUserSelect });
  }
}

export const userService = new UserService();
