"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, X, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedSearchProps {
  trigger?: React.ReactNode
  className?: string
}

interface SearchCriteria {
  query: string
  category: string
  priceMin: string
  priceMax: string
  materials: string[]
  sizes: string[]
  colors: string[]
  inStock: boolean
  isCustomizable: boolean
  isReadyMade: boolean
}

interface SearchAnalytics {
  totalSearches: number
  topKeywords: Array<{ keyword: string; count: number }>
  popularFilters: Array<{ filter: string; count: number }>
  recentTrends: Array<{ term: string; growth: number }>
}

export function AdvancedSearch({ trigger, className }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    query: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    materials: searchParams.get('materials')?.split(',') || [],
    sizes: searchParams.get('sizes')?.split(',') || [],
    colors: searchParams.get('colors')?.split(',') || [],
    inStock: searchParams.get('inStock') === 'true',
    isCustomizable: searchParams.get('isCustomizable') === 'true',
    isReadyMade: searchParams.get('isReadyMade') === 'true'
  })

  useEffect(() => {
    if (showAnalytics) {
      fetchSearchAnalytics()
    }
  }, [showAnalytics])

  const fetchSearchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/search')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching search analytics:', error)
      // Mock data for demonstration
      setAnalytics({
        totalSearches: 1247,
        topKeywords: [
          { keyword: 'black suit', count: 89 },
          { keyword: 'wool blazer', count: 67 },
          { keyword: 'navy uniform', count: 54 },
          { keyword: 'custom fit', count: 43 },
          { keyword: 'cotton dress', count: 38 }
        ],
        popularFilters: [
          { filter: 'In Stock', count: 234 },
          { filter: 'Customizable', count: 189 },
          { filter: 'Black Color', count: 156 },
          { filter: 'Wool Material', count: 143 },
          { filter: 'Premium Quality', count: 127 }
        ],
        recentTrends: [
          { term: 'sustainable fashion', growth: 45 },
          { term: 'work from home attire', growth: 32 },
          { term: 'versatile pieces', growth: 28 },
          { term: 'eco-friendly fabrics', growth: 24 },
          { term: 'minimalist wardrobe', growth: 19 }
        ]
      })
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchCriteria.query) params.set('search', searchCriteria.query)
    if (searchCriteria.category && searchCriteria.category !== 'all') params.set('category', searchCriteria.category)
    if (searchCriteria.priceMin) params.set('priceMin', searchCriteria.priceMin)
    if (searchCriteria.priceMax) params.set('priceMax', searchCriteria.priceMax)
    if (searchCriteria.materials.length > 0) params.set('materials', searchCriteria.materials.join(','))
    if (searchCriteria.sizes.length > 0) params.set('sizes', searchCriteria.sizes.join(','))
    if (searchCriteria.colors.length > 0) params.set('colors', searchCriteria.colors.join(','))
    if (searchCriteria.inStock) params.set('inStock', 'true')
    if (searchCriteria.isCustomizable) params.set('isCustomizable', 'true')
    if (searchCriteria.isReadyMade) params.set('isReadyMade', 'true')

    // Track search analytics
    trackSearch(searchCriteria)
    
    router.push(`/products?${params.toString()}`)
    setOpen(false)
  }

  const trackSearch = async (criteria: SearchCriteria) => {
    try {
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: criteria.query,
          filters: Object.fromEntries(
            Object.entries(criteria).filter(([key, value]) => 
              key !== 'query' && (
                (typeof value === 'boolean' && value) ||
                (typeof value === 'string' && value) ||
                (Array.isArray(value) && value.length > 0)
              )
            )
          ),
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  }

  const clearCriteria = () => {
    setSearchCriteria({
      query: '',
      category: 'all',
      priceMin: '',
      priceMax: '',
      materials: [],
      sizes: [],
      colors: [],
      inStock: false,
      isCustomizable: false,
      isReadyMade: false
    })
  }

  const toggleArrayValue = (array: string[], value: string): string[] => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value]
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={cn("gap-2", className)}>
      <Filter className="h-4 w-4" />
      Advanced Search
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="p-2 bg-gradient-to-br from-[#cf1773] to-[#b91c5c] rounded-xl">
                <Search className="h-5 w-5 text-white" />
              </div>
              Advanced Search
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="text-sm px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2 mb-6">
            Find exactly what you're looking for with our powerful search filters
          </p>
        </DialogHeader>

        <div className="px-8 pb-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Search Analytics */}
          {showAnalytics && analytics && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-100 space-y-4 mb-8">
              <h3 className="font-semibold text-lg text-gray-900">Search Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Top Keywords
                  </h4>
                  <div className="space-y-2">
                    {analytics.topKeywords.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">{item.keyword}</span>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Popular Filters
                  </h4>
                  <div className="space-y-2">
                    {analytics.popularFilters.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">{item.filter}</span>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Trending Searches
                  </h4>
                  <div className="space-y-2">
                    {analytics.recentTrends.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">{item.term}</span>
                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+{item.growth}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <div className="space-y-8">
            {/* Basic Search */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <Label className="text-base font-semibold text-gray-900 mb-3 block">Search Keywords</Label>
              <Input
                placeholder="Enter search terms..."
                value={searchCriteria.query}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, query: e.target.value }))}
                className="h-12 text-base border-0 bg-white shadow-sm focus:ring-2 focus:ring-[#cf1773]/20 focus:border-[#cf1773] rounded-xl"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category and Price */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#cf1773] rounded-full"></div>
                  Category & Price
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
                    <Select
                      value={searchCriteria.category}
                      onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-[#cf1773] focus:ring-[#cf1773]/20 rounded-xl">
                        <SelectValue placeholder="Any category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any category</SelectItem>
                        <SelectItem value="suits">Suits</SelectItem>
                        <SelectItem value="blazers">Blazers</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="uniforms">Uniforms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Min Price</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={searchCriteria.priceMin}
                        onChange={(e) => setSearchCriteria(prev => ({ ...prev, priceMin: e.target.value }))}
                        className="h-11 border-gray-200 focus:border-[#cf1773] focus:ring-[#cf1773]/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Max Price</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={searchCriteria.priceMax}
                        onChange={(e) => setSearchCriteria(prev => ({ ...prev, priceMax: e.target.value }))}
                        className="h-11 border-gray-200 focus:border-[#cf1773] focus:ring-[#cf1773]/20 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials and Attributes */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Materials & Sizes
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Materials</Label>
                    <div className="flex flex-wrap gap-2">
                      {['wool', 'cotton', 'silk', 'linen', 'polyester'].map((material) => (
                        <Badge
                          key={material}
                          variant={searchCriteria.materials.includes(material) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105",
                            searchCriteria.materials.includes(material) 
                              ? "bg-[#cf1773] text-white border-[#cf1773] shadow-md" 
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          )}
                          onClick={() => setSearchCriteria(prev => ({
                            ...prev,
                            materials: toggleArrayValue(prev.materials, material)
                          }))}
                        >
                          {material}
                          {searchCriteria.materials.includes(material) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Sizes</Label>
                    <div className="flex flex-wrap gap-2">
                      {['xs', 's', 'm', 'l', 'xl', 'xxl'].map((size) => (
                        <Badge
                          key={size}
                          variant={searchCriteria.sizes.includes(size) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105",
                            searchCriteria.sizes.includes(size) 
                              ? "bg-[#cf1773] text-white border-[#cf1773] shadow-md" 
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          )}
                          onClick={() => setSearchCriteria(prev => ({
                            ...prev,
                            sizes: toggleArrayValue(prev.sizes, size)
                          }))}
                        >
                          {size.toUpperCase()}
                          {searchCriteria.sizes.includes(size) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Colors
              </h3>
              <div className="flex flex-wrap gap-3">
                {['black', 'white', 'gray', 'navy', 'brown', 'blue'].map((color) => (
                  <Badge
                    key={color}
                    variant={searchCriteria.colors.includes(color) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 capitalize",
                      searchCriteria.colors.includes(color) 
                        ? "bg-[#cf1773] text-white border-[#cf1773] shadow-md" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    )}
                    onClick={() => setSearchCriteria(prev => ({
                      ...prev,
                      colors: toggleArrayValue(prev.colors, color)
                    }))}
                  >
                    {color}
                    {searchCriteria.colors.includes(color) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Product Type Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Product Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id="inStock"
                    checked={searchCriteria.inStock}
                    onCheckedChange={(checked) => 
                      setSearchCriteria(prev => ({ ...prev, inStock: Boolean(checked) }))
                    }
                    className="data-[state=checked]:bg-[#cf1773] data-[state=checked]:border-[#cf1773]"
                  />
                  <Label htmlFor="inStock" className="cursor-pointer text-sm font-medium text-gray-700">In Stock Only</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id="customizable"
                    checked={searchCriteria.isCustomizable}
                    onCheckedChange={(checked) => 
                      setSearchCriteria(prev => ({ ...prev, isCustomizable: Boolean(checked) }))
                    }
                    className="data-[state=checked]:bg-[#cf1773] data-[state=checked]:border-[#cf1773]"
                  />
                  <Label htmlFor="customizable" className="cursor-pointer text-sm font-medium text-gray-700">Customizable</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id="readyMade"
                    checked={searchCriteria.isReadyMade}
                    onCheckedChange={(checked) => 
                      setSearchCriteria(prev => ({ ...prev, isReadyMade: Boolean(checked) }))
                    }
                    className="data-[state=checked]:bg-[#cf1773] data-[state=checked]:border-[#cf1773]"
                  />
                  <Label htmlFor="readyMade" className="cursor-pointer text-sm font-medium text-gray-700">Ready-made</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 bg-gray-50 -mx-8 px-8 py-6 mt-8">
            <Button 
              variant="outline" 
              onClick={clearCriteria}
              className="px-6 py-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Clear All
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="px-6 py-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSearch}
                className="px-8 py-3 h-auto bg-gradient-to-r from-[#cf1773] to-[#b91c5c] text-white hover:from-[#b91c5c] hover:to-[#a11854] shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
