import { NextResponse } from 'next/server';
import { getRefunds } from '@/lib/services/refund-service';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['all', 'pending', 'approved', 'rejected', 'completed']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const validation = schema.safeParse(queryParams);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.errors }, { status: 400 });
  }

  const { status, search, page, limit } = validation.data;

  try {
    const { refunds, total } = await getRefunds({ status, search, page, limit });
    return NextResponse.json({ refunds, total });
  } catch (error) {
    console.error('Failed to fetch refunds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
