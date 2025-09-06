'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { 
  Heart,
  ShoppingCart,
  Star,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  Eye
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  rating: number
  reviewCount: number
  images: string[]
  category: string
  brand: string
  colors: string[]
  sizes: string[]
  isNew?: boolean
  isSale?: boolean
  inStock: boolean
}

interface ProductGridProps {
  products: Product[]
  categories?: Array<{ id: string; name: string }>
  brands?: Array<{ id: string; name: string }>
  colors?: Array<{ id: string; name: string; hex: string }>
  sizes?: Array<{ id: string; name: string }>
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Blazer Set',
    slug: 'professional-blazer-set',
    price: 199.99,
    compareAtPrice: 249.99,
    rating: 4.8,
    reviewCount: 24,
    images: ['/products/blazer-1.jpg', '/products/blazer-2.jpg'],
    category: 'Blazers',
    brand: 'Omaima',
    colors: ['Navy', 'Black', 'Gray'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isSale: true,
    inStock: true,
  },
  {
    id: '2',
    name: 'Executive Pants',
    slug: 'executive-pants',
    price: 89.99,
    rating: 4.6,
    reviewCount: 18,
    images: ['/products/pants-1.jpg'],
    category: 'Pants',
    brand: 'Omaima',
    colors: ['Black', 'Navy', 'Charcoal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
  },
  // Add more products...
]

const mockCategories = [
  { id: '1', name: 'Blazers' },
  { id: '2', name: 'Pants' },
  { id: '3', name: 'Skirts' },
  { id: '4', name: 'Dresses' },
]

const mockBrands = [
  { id: '1', name: 'Omaima' },
  { id: '2', name: 'Professional' },
]

const mockColors = [
  { id: '1', name: 'Black', hex: '#000000' },
  { id: '2', name: 'Navy', hex: '#000080' },
  { id: '3', name: 'Gray', hex: '#808080' },
]

const mockSizes = [
  { id: '1', name: 'XS' },
  { id: '2', name: 'S' },
  { id: '3', name: 'M' },
  { id: '4', name: 'L' },
  { id: '5', name: 'XL' },
]

function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {product.isNew && (
            <Badge className="bg-green-500 text-white">New</Badge>
          )}
          {product.isSale && discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="h-8 w-8"
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} 
            />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick add to cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button className="w-full" size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>
          
          <h3 className="font-semibold line-clamp-2">
            <Link 
              href={`/products/${product.slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Color options */}
          <div className="flex items-center gap-2">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="h-4 w-4 rounded-full border border-gray-200"
                style={{ 
                  backgroundColor: mockColors.find(c => c.name === color)?.hex || '#ccc' 
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductFilters({ 
  onFilterChange 
}: { 
  onFilterChange: (filters: any) => void 
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {mockCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.id])
                  } else {
                    setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                  }
                }}
              />
              <Label 
                htmlFor={`category-${category.id}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            placeholder="Min" 
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
          <Input 
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {mockColors.map((color) => (
            <button
              key={color.id}
              className={`h-8 w-8 rounded-full border-2 ${
                selectedColors.includes(color.id)
                  ? 'border-primary'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              onClick={() => {
                if (selectedColors.includes(color.id)) {
                  setSelectedColors(selectedColors.filter(id => id !== color.id))
                } else {
                  setSelectedColors([...selectedColors, color.id])
                }
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {mockSizes.map((size) => (
            <Button
              key={size.id}
              variant={selectedSizes.includes(size.id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (selectedSizes.includes(size.id)) {
                  setSelectedSizes(selectedSizes.filter(id => id !== size.id))
                } else {
                  setSelectedSizes([...selectedSizes, size.id])
                }
              }}
            >
              {size.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ 
  products = mockProducts, 
  categories = mockCategories,
  brands = mockBrands,
  colors = mockColors,
  sizes = mockSizes
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (filters: any) => {
    // Handle filter changes
    console.log('Filters changed:', filters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Professional Wear</h1>
          <p className="text-muted-foreground">
            {products.length} products found
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <ProductFilters onFilterChange={handleFilterChange} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-5 w-5" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <ProductFilters onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More / Pagination */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
