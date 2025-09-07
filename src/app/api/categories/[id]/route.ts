import { NextResponse } from 'next/server';
import { getCategoryById, updateCategory } from '@/lib/services/category-service';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error(`Failed to fetch category ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const updatedCategory = await updateCategory(params.id, validation.data);

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Failed to update category ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
