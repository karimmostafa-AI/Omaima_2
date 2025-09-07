import { NextResponse } from 'next/server';
import { getRefundById, updateRefund } from '@/lib/services/refund-service';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  notes: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const refund = await getRefundById(params.id);
    if (!refund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }
    return NextResponse.json(refund);
  } catch (error) {
    console.error(`Failed to fetch refund ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const { status, notes } = validation.data;
    const updatedRefund = await updateRefund(params.id, { status, notes });

    if (!updatedRefund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRefund);
  } catch (error) {
    console.error(`Failed to update refund ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
