import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';

export async function GET() {
  try {
    const filtersData = await ProductService.getFiltersData();
    return NextResponse.json(filtersData);
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter data' },
      { status: 500 }
    );
  }
}
