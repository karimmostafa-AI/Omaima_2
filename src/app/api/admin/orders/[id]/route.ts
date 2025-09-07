import { NextResponse } from 'next/server';
import { z } from 'zod';

const changeStatusSchema = z.object({
  action: z.literal('change_status'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
});

const changePaymentStatusSchema = z.object({
  action: z.literal('change_payment_status'),
  isPaid: z.boolean(),
});

const assignRiderSchema = z.object({
  action: z.literal('assign_rider'),
  riderId: z.string(),
});

const requestBodySchema = z.union([
  changeStatusSchema,
  changePaymentStatusSchema,
  assignRiderSchema,
]);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  try {
    const body = await request.json();
    const parsedBody = requestBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.errors }, { status: 400 });
    }

    const { action } = parsedBody.data;

    switch (action) {
      case 'change_status':
        console.log(`Updating order ${orderId} status to: ${parsedBody.data.status}`);
        // In a real app, update the database here
        return NextResponse.json({ success: true, message: `Order ${orderId} status updated to ${parsedBody.data.status}` });

      case 'change_payment_status':
        console.log(`Updating order ${orderId} payment status to: ${parsedBody.data.isPaid ? 'Paid' : 'Unpaid'}`);
        // In a real app, update the database here
        return NextResponse.json({ success: true, message: `Order ${orderId} payment status updated` });

      case 'assign_rider':
        console.log(`Assigning rider ${parsedBody.data.riderId} to order ${orderId}`);
        // In a real app, update the database here
        return NextResponse.json({ success: true, message: `Rider ${parsedBody.data.riderId} assigned to order ${orderId}` });

      default:
        // This case should be impossible with Zod validation, but it's good practice
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to process PATCH request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
