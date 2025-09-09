'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { ShoppingCart, Plus, Check, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
// Using simple notifications instead of toast

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    stock?: number
  }
  variantId?: string
  quantity?: number
  customConfiguration?: any
  estimatedDeliveryDays?: number
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  showText?: boolean
  disabled?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function AddToCartButton({
  product,
  variantId,
  quantity = 1,
  customConfiguration,
  estimatedDeliveryDays,
  className = '',
  size = 'default',
  variant = 'default',
  showText = true,
  disabled = false,
  onSuccess,
  onError
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { user } = useAuthStore()
  const { addToCartAPI, addItem, setIsOpen } = useCartStore()

  const handleAddToCart = async () => {
    if (disabled || isAdding) return

    setIsAdding(true)

    try {
      // Check stock availability
      if (product.stock !== undefined && product.stock <= 0) {
        throw new Error('Product is out of stock')
      }

      if (user) {
        // User is logged in - use API for server persistence
        await addToCartAPI({
          productId: product.id,
          variantId,
          quantity,
          customConfiguration,
          estimatedDeliveryDays
        })
      } else {
        // User is not logged in - use local storage only
        await addItem({
          productId: product.id,
          variantId,
          name: product.name,
          slug: `product-${product.id}`,
          price: product.price,
          quantity,
          imageUrl: product.image,
          customConfiguration,
          maxQuantity: product.stock,
          estimatedDeliveryDays
        })
      }

      // Show success state briefly
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1500)

      // Show success by opening cart sidebar
      setIsOpen(true)

      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add item to cart'
      console.error('Add to cart error:', errorMessage)
      
      // Show user-friendly error message
      if (errorMessage.includes('Unauthorized')) {
        console.log('Guest cart operation failed - this should not happen for guest users')
      } else {
        console.error('Cart error:', errorMessage)
      }
      
      onError?.(errorMessage)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Adding...</span>}
        </>
      )
    }

    if (justAdded) {
      return (
        <>
          <Check className="h-4 w-4 text-green-600" />
          {showText && <span className="ml-2">Added!</span>}
        </>
      )
    }

    return (
      <>
        {showText ? (
          <ShoppingCart className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {showText && <span className="ml-2">Add to Cart</span>}
      </>
    )
  }

  const isDisabled = disabled || isAdding || (product.stock !== undefined && product.stock <= 0)

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      size={size}
      variant={justAdded ? 'outline' : variant}
      className={`${className} ${justAdded ? 'border-green-600 text-green-600' : ''}`}
      aria-label={`Add ${product.name} to cart`}
    >
      {getButtonContent()}
    </Button>
  )
}

// Quick add variant for product cards
export function QuickAddButton({
  product,
  className = ''
}: {
  product: AddToCartButtonProps['product']
  className?: string
}) {
  return (
    <AddToCartButton
      product={product}
      showText={false}
      size="sm"
      variant="outline"
      className={`${className} hover:bg-primary hover:text-primary-foreground`}
    />
  )
}
