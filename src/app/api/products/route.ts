import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';
import { getCurrentUser, isAdmin } from '@/lib/auth';

const getProductsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const validation = getProductsSchema.safeParse(queryParams);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.errors }, { status: 400 });
  }

  try {
    const data = await ProductService.getProducts(validation.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // TODO: Add Zod validation for the request body in Sprint 2
  // TODO: Implement the actual product creation logic in Sprint 2

  // For now, return 503 to indicate the endpoint is temporarily disabled
  return NextResponse.json(
    { error: 'Endpoint temporarily disabled for security hardening.' },
    { status: 503 }
  );
}
