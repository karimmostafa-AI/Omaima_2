import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';

const suggestionsSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const validation = suggestionsSchema.safeParse(queryParams);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.errors }, { status: 400 });
  }

  const { query, limit = 5 } = validation.data;

  try {
    const suggestions = await ProductService.getSearchSuggestions(query, limit);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
