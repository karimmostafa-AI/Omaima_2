import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    // Find the cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        cart: {
          userId: user.id
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            status: true,
            stock: true
          }
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Check stock availability
    if (cartItem.product.stock > 0 && quantity > cartItem.product.stock) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    // Update the quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            status: true,
            stock: true
          }
        }
      }
    })

    // Transform to match frontend interface
    const transformedItem = {
      id: updatedItem.id,
      productId: updatedItem.productId,
      variantId: updatedItem.variantId,
      name: updatedItem.product.name,
      slug: `product-${updatedItem.productId}`,
      price: updatedItem.price,
      quantity: updatedItem.quantity,
      imageUrl: updatedItem.product.image,
      customConfiguration: updatedItem.customConfiguration,
      maxQuantity: updatedItem.product.stock > 0 ? updatedItem.product.stock : undefined,
      estimatedDeliveryDays: updatedItem.estimatedDeliveryDays
    }

    return NextResponse.json({
      message: 'Cart item updated successfully',
      item: transformedItem
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        cart: {
          userId: user.id
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Cart item removed successfully' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
