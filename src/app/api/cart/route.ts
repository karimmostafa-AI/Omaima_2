import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create cart for the user
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
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
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    }

    // Transform cart items to match the frontend interface
    const transformedItems = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: `product-${item.productId}`, // You might want to add a slug field to Product model
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.product.image,
      customConfiguration: item.customConfiguration,
      maxQuantity: item.product.stock > 0 ? item.product.stock : undefined,
      estimatedDeliveryDays: item.estimatedDeliveryDays
    }))

    return NextResponse.json({
      id: cart.id,
      items: transformedItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      productId, 
      variantId, 
      quantity = 1, 
      customConfiguration,
      estimatedDeliveryDays 
    } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, status: true, stock: true, image: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
    }

    // Check stock availability
    if (product.stock > 0 && quantity > product.stock) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId || null,
        customConfiguration: customConfiguration ? customConfiguration : null
      }
    })

    let cartItem
    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity
      
      // Check stock again for updated quantity
      if (product.stock > 0 && newQuantity > product.stock) {
        return NextResponse.json({ error: 'Insufficient stock for requested quantity' }, { status: 400 })
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          variantId: variantId,
          quantity: quantity,
          price: product.price, // Store current price
          customConfiguration: customConfiguration,
          estimatedDeliveryDays: estimatedDeliveryDays
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
    }

    // Transform to match frontend interface
    const transformedItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      name: cartItem.product.name,
      slug: `product-${cartItem.productId}`,
      price: cartItem.price,
      quantity: cartItem.quantity,
      imageUrl: cartItem.product.image,
      customConfiguration: cartItem.customConfiguration,
      maxQuantity: cartItem.product.stock > 0 ? cartItem.product.stock : undefined,
      estimatedDeliveryDays: cartItem.estimatedDeliveryDays
    }

    return NextResponse.json({ 
      message: existingItem ? 'Cart item updated' : 'Item added to cart',
      item: transformedItem 
    }, { status: existingItem ? 200 : 201 })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear entire cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
