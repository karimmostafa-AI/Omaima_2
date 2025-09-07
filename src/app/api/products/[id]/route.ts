import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';
import { ProductStatus, ProductType } from '@prisma/client';

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  type: z.nativeEnum(ProductType).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  price: z.number().optional(),
  sku: z.string().optional(),
  quantity: z.number().optional(),
  trackQuantity: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string(),
    position: z.number()
  })).optional(),
  options: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })).optional(),
  variants: z.array(z.object({
    price: z.number(),
    quantity: z.number(),
    sku: z.string().optional(),
    imageId: z.string().optional(),
    optionValues: z.array(z.object({
      optionName: z.string(),
      value: z.string()
    }))
  })).optional(),
}).partial();


interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await ProductService.getProduct(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 });
    }

    const updatedProduct = await ProductService.updateProduct(id, validation.data);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    await ProductService.deleteProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
