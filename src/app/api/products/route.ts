import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ProductStatus } from '@prisma/client';

const getProductsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const productCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes only'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  sku: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  trackQuantity: z.boolean(),
  quantity: z.number().int().optional(),
  weight: z.number().positive().optional(),
  requiresShipping: z.boolean(),
  taxable: z.boolean(),
  taxCode: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  basePrice: z.number().positive('Base price must be positive'),
  estimatedDeliveryDays: z.number().int().positive('Estimated delivery must be a positive number'),
  categoryIds: z.array(z.string()).min(1, 'Product must have at least one category'),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    position: z.number().int(),
  })).min(1, 'Product must have at least one image'),
  variants: z.array(z.object({
    title: z.string(),
    option1: z.string().optional(),
    option2: z.string().optional(),
    option3: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    position: z.number().int(),
    quantity: z.number().int(),
    weight: z.number().positive().optional(),
  })).optional(),
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
