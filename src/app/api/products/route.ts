import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';

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

const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  type: z.nativeEnum(ProductType),
  status: z.nativeEnum(ProductStatus),
  price: z.number(),
  sku: z.string().optional(),
  quantity: z.number().optional(),
  trackQuantity: z.boolean(),
  tags: z.array(z.string()),
  categoryIds: z.array(z.string()),
  images: z.array(z.object({
    url: z.string(),
    position: z.number()
  })),
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
});


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 });
    }

    const newProduct = await ProductService.createProduct(validation.data);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
