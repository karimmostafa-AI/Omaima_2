'use client';

import { useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Minus, Plus, X, Truck, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'

export default function CartPage() {
  const { user } = useAuthStore()
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSummary,
    syncWithServer,
    isLoading
  } = useCartStore()
  
  const summary = getSummary()

  useEffect(() => {
    // Sync with server when user is logged in
    if (user) {
      syncWithServer()
    }
  }, [user, syncWithServer])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Browse our beautiful collection to get started.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-6">
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">👔</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link
                              href={`/products/${item.slug}`}
                              className="hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-lg font-semibold text-primary mb-2">
                            {formatPrice(item.price)}
                          </p>
                          {item.customConfiguration && (
                            <Badge variant="outline" className="mb-2">
                              Custom Design
                            </Badge>
                          )}
                          {item.estimatedDeliveryDays && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Truck className="h-4 w-4 mr-1" />
                              Ready in {item.estimatedDeliveryDays} days
                            </div>
                          )}
                        </div>
                        
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls and Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-lg font-medium w-12 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.maxQuantity != null && item.maxQuantity > 0 && item.quantity >= item.maxQuantity}
                            className="h-8 w-8 p-0"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-lg font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart */}
            <div className="mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({summary.itemCount} items)</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(summary.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {summary.shippingAmount === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(summary.shippingAmount)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(summary.taxAmount)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(summary.total)}</span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {summary.shippingAmount > 0 && summary.subtotal < 100 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-center text-blue-800 mb-2">
                    Add {formatPrice(100 - summary.subtotal)} more for{' '}
                    <span className="font-medium">FREE shipping</span>
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((summary.subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure checkout • Free returns • 30-day guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
