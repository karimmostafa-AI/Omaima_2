import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { z } from 'zod'
import { ProductStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

// Base schema for creation, which we can extend for updates
const productUpdateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes only').optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sku: z.string().optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  trackQuantity: z.boolean().optional(),
  quantity: z.number().int().optional(),
  weight: z.number().positive().optional(),
  requiresShipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  taxCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  basePrice: z.number().positive('Base price must be positive').optional(),
  estimatedDeliveryDays: z.number().int().positive('Estimated delivery must be a positive number').optional(),
  categoryIds: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    position: z.number().int(),
  })).optional(),
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
}).partial();

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const product = await ProductService.getProduct(params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const user = await getCurrentUser();
  if (!user || !await isAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = productUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  if (Object.keys(validation.data).length === 0) {
    return NextResponse.json({ error: 'At least one field must be provided to update.' }, { status: 400 });
  }

  try {
    const updatedProduct = await ProductService.updateProduct(params.id, validation.data);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    // Handle cases where the product to update doesn't exist
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const user = await getCurrentUser();
  if (!user || !await isAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await ProductService.deleteProduct(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
     // Handle cases where the product to delete doesn't exist
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
