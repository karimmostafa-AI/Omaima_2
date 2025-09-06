"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 1000])

  const selectedCategory = searchParams.get('category')
  const minPrice = parseFloat(searchParams.get('priceMin') || '0')
  const maxPrice = parseFloat(searchParams.get('priceMax') || '1000')

  useEffect(() => {
    fetchCategories()
    setPriceRange([minPrice || 0, maxPrice || 1000])
  }, [minPrice, maxPrice])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset page when filters change
    params.delete('page')
    
    router.push(`/products?${params.toString()}`)
  }

  const updatePriceFilter = (range: number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (range[0] > 0) {
      params.set('priceMin', range[0].toString())
    } else {
      params.delete('priceMin')
    }
    
    if (range[1] < 1000) {
      params.set('priceMax', range[1].toString())
    } else {
      params.delete('priceMax')
    }
    
    // Reset page when filters change
    params.delete('page')
    
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('priceMin')
    params.delete('priceMax')
    params.delete('page')
    
    router.push(`/products?${params.toString()}`)
  }

  const hasActiveFilters = selectedCategory || minPrice > 0 || maxPrice < 1000

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs h-auto p-0"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button
                    onClick={() => updateFilters('category', null)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(minPrice > 0 || maxPrice < 1000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${minPrice} - ${maxPrice}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete('priceMin')
                      params.delete('priceMax')
                      router.push(`/products?${params.toString()}`)
                    }}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategory === category.slug}
                    onCheckedChange={(checked) => {
                      updateFilters('category', checked ? category.slug : null)
                    }}
                  />
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
                <span className="text-xs text-muted-foreground">
                  {category._count.products}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            onValueCommit={updatePriceFilter}
            max={1000}
            min={0}
            step={25}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Product Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Product Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="customizable" />
            <Label htmlFor="customizable" className="text-sm font-normal cursor-pointer">
              Customizable
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ready-made" />
            <Label htmlFor="ready-made" className="text-sm font-normal cursor-pointer">
              Ready-made
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
