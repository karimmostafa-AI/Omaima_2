import { NextRequest, NextResponse } from 'next/server'
// Temporarily using mock service until database is configured
import { ProductService } from '@/lib/services/product-service-temp'
import { getAuthenticatedUser } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const product = await ProductService.getProductById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    // Check if user is admin
    const user = await getAuthenticatedUser()
    if (!user || user.user_metadata?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Temporarily disabled - will implement once database is configured
    return NextResponse.json(
      { error: 'Product updates temporarily disabled' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    // Check if user is admin
    const user = await getAuthenticatedUser()
    if (!user || user.user_metadata?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Temporarily disabled - will implement once database is configured
    return NextResponse.json(
      { error: 'Product deletion temporarily disabled' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
