import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { Category } from '@prisma/client';

interface GetCategoriesParams {
  page?: number;
  limit?: number;
}

export const getCategories = async ({ page = 1, limit = 10 }: GetCategoriesParams = {}) => {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { position: 'asc' },
    }),
    prisma.category.count(),
  ]);
  return { categories, total };
};

export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({ where: { id } });
};

export const createCategory = async (data: Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at' | 'position'>) => {
  const maxPosition = await prisma.category.aggregate({ _max: { position: true } });
  const newPosition = (maxPosition._max.position || 0) + 1;

  return prisma.category.create({
    data: {
      ...data,
      slug: slugify(data.name),
      position: newPosition,
    },
  });
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>>) => {
  const updateData = { ...data };
  if (data.name) {
    updateData.slug = slugify(data.name);
  }
  return prisma.category.update({
    where: { id },
    data: updateData,
  });
};
