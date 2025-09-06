import { NextRequest, NextResponse } from 'next/server'
// Temporarily using mock service until database is configured
import { ProductService } from '@/lib/services/product-service-temp'
import { getAuthenticatedUser } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      maxPrice: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    }

    const result = await ProductService.getProducts(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For now, we'll check user role from user metadata
    // In production, you'd want to verify this more securely
    if (user.user_metadata?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Temporarily disabled - will implement once database is configured
    return NextResponse.json(
      { error: 'Product creation temporarily disabled' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
