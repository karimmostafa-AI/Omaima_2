import { NextResponse } from 'next/server'
// Temporarily using mock service until database is configured
import { ProductService } from '@/lib/services/product-service-temp'

export async function GET() {
  try {
    const categories = await ProductService.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
