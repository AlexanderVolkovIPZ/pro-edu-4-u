import prismaDb from '@/lib/prismadb';
import { PrismaClient } from '@prisma/client';

export class CategoryService {
  constructor(private readonly db: PrismaClient = prismaDb) {}

  async list() {
    return this.db.category.findMany();
  }
}

export const categoryService = new CategoryService();
