import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

const schema = z.object({
  status: z.nativeEnum(ProductStatus),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const { status } = validation.data;
    const updatedProduct = await ProductService.toggleProductStatus(params.id, status);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Failed to toggle product status for ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to toggle product status' },
      { status: 500 }
    );
  }
}
