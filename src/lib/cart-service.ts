interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  slug: string
  price: number
  quantity: number
  imageUrl?: string
  customConfiguration?: any
  maxQuantity?: number
  estimatedDeliveryDays?: number
}

interface AddToCartData {
  productId: string
  variantId?: string
  quantity?: number
  customConfiguration?: any
  estimatedDeliveryDays?: number
}

interface CartSummary {
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  itemCount: number
}

class CartService {
  private baseUrl = '/api/cart'

  async getCart(): Promise<{ items: CartItem[] } | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch cart')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching cart:', error)
      return null
    }
  }

  async addToCart(data: AddToCartData): Promise<{ item: CartItem } | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add item to cart')
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<{ item: CartItem } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update cart item')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw error
    }
  }

  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove item from cart')
      }

      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear cart')
      }

      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  // Helper methods for cart calculations
  calculateSummary(items: CartItem[], discountCodes: string[] = []): CartSummary {
    const TAX_RATE = 0.08 // 8%
    const FREE_SHIPPING_THRESHOLD = 100
    const SHIPPING_COST = 15

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Calculate discount (simplified - in real app, this would call an API)
    let discountAmount = 0
    if (discountCodes.includes('WELCOME10')) {
      discountAmount = subtotal * 0.1 // 10% discount
    }
    
    const discountedSubtotal = subtotal - discountAmount
    const taxAmount = discountedSubtotal * TAX_RATE
    const shippingAmount = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total = discountedSubtotal + taxAmount + shippingAmount
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      total,
      itemCount
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }
}

export const cartService = new CartService()
export type { CartItem, AddToCartData, CartSummary }
