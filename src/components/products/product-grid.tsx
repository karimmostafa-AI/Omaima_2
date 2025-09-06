"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import type { ProductWithDetails } from '@/lib/services/product-service'

interface ProductGridProps {
  products: ProductWithDetails[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = (product: ProductWithDetails) => {
    const mainImage = product.images[0]
    
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      quantity: 1,
      imageUrl: mainImage?.url,
      estimatedDeliveryDays: product.estimatedDeliveryDays,
      maxQuantity: product.trackQuantity ? product.quantity || 0 : 99,
    })
  }

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(price))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const mainImage = product.images[0]
        const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
        const discountPercentage = hasDiscount
          ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
          : 0

        return (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative aspect-[4/5] overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.altText || product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👔</span>
                    </div>
                    <p className="text-sm">No Image</p>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.type === 'CUSTOMIZABLE' && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Customizable
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.status === 'DRAFT' && (
                  <Badge variant="outline">
                    Draft
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black"
                    asChild
                  >
                    <Link href={`/products/${product.slug}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Categories */}
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Product Name */}
              <div>
                <Link 
                  href={`/products/${product.slug}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.trackQuantity && (product.quantity || 0) <= 0}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {product.trackQuantity && (product.quantity || 0) <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'
                }
              </Button>

              {/* Delivery Info */}
              {product.estimatedDeliveryDays > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Ready in {product.estimatedDeliveryDays} days
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
