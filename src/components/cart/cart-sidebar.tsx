"use client"

import { useCartStore } from '@/store/cart-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, Minus, Plus, X, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSidebar() {
  const { items, updateQuantity, removeItem, getSummary, isOpen, setIsOpen } = useCartStore()
  const summary = getSummary()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Open cart">
          <ShoppingBag className="h-5 w-5" />
          {summary.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {summary.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Shopping Cart ({summary.itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add some beautiful suits to get started
                </p>
                <Button onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 py-6 overflow-auto">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      {/* Product Image */}
                      <div className="relative w-16 h-20 bg-muted rounded-md overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">👔</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-2">
                              <Link
                                href={`/products/${item.slug}`}
                                className="hover:text-primary"
                                onClick={() => setIsOpen(false)}
                              >
                                {item.name}
                              </Link>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.price)}
                            </p>
                            {item.customConfiguration && (
                              <p className="text-xs text-muted-foreground">
                                Custom design
                              </p>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-auto p-1"
                            aria-label="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              className="h-6 w-6 p-0"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.maxQuantity != null && item.maxQuantity > 0 && item.quantity >= item.maxQuantity}
                              className="h-6 w-6 p-0"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Delivery Info */}
                        {item.estimatedDeliveryDays && (
                          <div className="flex items-center mt-1">
                            <Truck className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              Ready in {item.estimatedDeliveryDays} days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  
                  {summary.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(summary.discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {summary.shippingAmount === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(summary.shippingAmount)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(summary.taxAmount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(summary.total)}</span>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {summary.shippingAmount > 0 && summary.subtotal < 100 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-center">
                      Add {formatPrice(100 - summary.subtotal)} more for{' '}
                      <span className="font-medium text-green-600">FREE shipping</span>
                    </p>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-1 mt-2">
                      <div
                        className="bg-green-600 h-1 rounded-full transition-all"
                        style={{ width: `${Math.min((summary.subtotal / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout • Free returns • 30-day guarantee
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
