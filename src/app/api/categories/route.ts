import { NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/services/category-service';
import { z } from 'zod';

const getCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const validation = getCategoriesSchema.safeParse(queryParams);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.errors }, { status: 400 });
  }

  const { page, limit } = validation.data;

  try {
    const { categories, total } = await getCategories({ page, limit });
    return NextResponse.json({ categories, total });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const newCategory = await createCategory(validation.data);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
