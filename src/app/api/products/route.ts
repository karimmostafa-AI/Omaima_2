import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ProductStatus } from '@prisma/client';

const getProductsSchema = z.object({
  category: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  materials: z.string().transform(val => val ? val.split(',') : undefined).optional(),
  sizes: z.string().transform(val => val ? val.split(',') : undefined).optional(),
  colors: z.string().transform(val => val ? val.split(',') : undefined).optional(),
  brands: z.string().transform(val => val ? val.split(',') : undefined).optional(),
  inStock: z.string().transform(val => val === 'true').optional(),
  isCustomizable: z.string().transform(val => val === 'true').optional(),
  isReadyMade: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'popularity', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const productCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  image: z.string().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  status: z.nativeEnum(ProductStatus),
  categoryIds: z.array(z.string()).min(1, 'Product must have at least one category'),
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

  if (!user || !await isAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = productCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  try {
    const newProduct = await ProductService.createProduct(validation.data);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
