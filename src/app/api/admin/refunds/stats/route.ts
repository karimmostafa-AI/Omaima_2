import { NextResponse } from 'next/server';
import { getRefundStats } from '@/lib/services/refund-service';

export async function GET() {
  try {
    const stats = await getRefundStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch refund stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
