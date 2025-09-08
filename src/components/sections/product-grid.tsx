"use client"

import React, { useState } from 'react'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ListFilter, LayoutGrid, View } from 'lucide-react'

interface ProductGridProps {
  products: Product[];
  // Other props for categories, brands etc. would be passed here
  // For now, we are simplifying and just passing products.
}

function ProductCard({ product }: { product: Product }) {
  const firstImage = product.images?.[0]?.url || '/placeholder.svg'

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative bg-muted">
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg truncate">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{product.category?.name || 'Uncategorized'}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-semibold text-xl">
            ${product.price.toFixed(2)}
          </p>
          {product.compareAtPrice && (
            <p className="text-muted-foreground line-through">
              ${product.compareAtPrice.toFixed(2)}
            </p>
          )}
        </div>
        <Button className="w-full mt-4">Add to Cart</Button>
      </CardContent>
    </Card>
  )
}


export default function ProductGrid({ products }: ProductGridProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  if (!products) {
    return <div>Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Products</h2>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort by <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Featured</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem>Newest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={layout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayout('grid')}>
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button variant={layout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayout('list')}>
            <ListFilter className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
