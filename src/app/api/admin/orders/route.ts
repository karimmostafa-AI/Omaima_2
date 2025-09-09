import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/services/order-service';
import { OrderStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const status = (searchParams.get('status') || 'all') as OrderStatus | 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || undefined;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: (OrderStatus | 'all')[] = [
      'all',
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Fetch orders
    const result = await getOrders({
      status,
      page,
      limit,
      search
    });

    return NextResponse.json({
      success: true,
      data: result.orders,
      meta: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit,
        hasNextPage: result.currentPage < result.totalPages,
        hasPrevPage: result.currentPage > 1
      }
    });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Export for other HTTP methods if needed
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
