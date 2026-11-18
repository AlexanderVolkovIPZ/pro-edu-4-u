import prismaDb from '@/lib/prismadb';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { HttpError } from '../http/http-error';
import { changePasswordSchema, registerSchema } from '../schemas/auth.schema';
import { Mailer, mailer } from './mail.service';

type RegisterInput = z.infer<typeof registerSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const PASSWORD_SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_TTL = '1h';

export class AuthService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly mail: Mailer = mailer
  ) {}

  /** Creates a credentials account (or adds a password to an OAuth account) and sends the verification e-mail. */
  async register({ email, password }: RegisterInput) {
    const existingUser = await this.db.user.findUnique({ where: { email } });

    if (existingUser?.password) {
      throw HttpError.conflict('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    const user = existingUser
      ? await this.db.user.update({ where: { email }, data: { password: hashedPassword } })
      : await this.db.user.create({ data: { email, password: hashedPassword } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: VERIFICATION_TOKEN_TTL,
    });
    await this.mail.sendVerificationEmail(email, `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`);

    return { id: user.id, email: user.email };
  }

  async verifyEmail(token: string): Promise<void> {
    let userId: string;
    try {
      ({ userId } = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string });
    } catch {
      throw HttpError.badRequest('Invalid or expired token!');
    }

    await this.db.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  }

  async changePassword(userId: string, { oldPassword, newPassword }: ChangePasswordInput): Promise<void> {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { id: true, password: true } });

    if (!user?.password) {
      throw HttpError.badRequest('Password change is not allowed for accounts authenticated via external providers');
    }

    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrectPassword) {
      throw HttpError.forbidden('Current password is incorrect');
    }

    await this.db.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS) },
    });
  }
}

export const authService = new AuthService();
