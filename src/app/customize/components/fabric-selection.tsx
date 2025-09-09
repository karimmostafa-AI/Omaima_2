"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCustomizerStore } from '@/store/customizer'
import { Fabric } from '@/types'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Search, Palette, Info, SlidersHorizontal, X } from 'lucide-react'
import Image from 'next/image'

export function FabricSelection() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { configuration, setFabric } = useCustomizerStore()

  useEffect(() => {
    fetchFabrics()
  }, [])

  const fetchFabrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customizer/fabrics')
      if (response.ok) {
        const data = await response.json()
        setFabrics(data.fabrics || [])
      }
    } catch (error) {
      console.error('Failed to fetch fabrics:', error)
      // Fallback with mock data for development
      setFabrics([
        {
          id: 'fabric-1',
          name: 'Premium Wool Blend',
          fabric_code: 'PWB-001',
          description: 'High-quality wool blend perfect for professional attire',
          composition: '70% Wool, 25% Polyester, 5% Elastane',
          weight: 280,
          price_per_unit: 45.99,
          color_name: 'Charcoal Gray',
          color_hex: '#36454F',
          pattern_type: 'solid',
          image_url: '/api/placeholder/fabric/300/200',
          swatch_image_url: '/api/placeholder/swatch/50/50',
          stock_quantity: 50,
          min_order_quantity: 1,
          is_premium: true,
          season: 'year-round',
          care_instructions: 'Dry clean only',
          origin_country: 'Italy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fabric-2',
          name: 'Classic Cotton Stretch',
          fabric_code: 'CCS-002',
          description: 'Comfortable cotton blend with stretch for all-day wear',
          composition: '95% Cotton, 5% Elastane',
          weight: 220,
          price_per_unit: 32.99,
          color_name: 'Navy Blue',
          color_hex: '#1B365D',
          pattern_type: 'solid',
          image_url: '/api/placeholder/fabric/300/200',
          swatch_image_url: '/api/placeholder/swatch/50/50',
          stock_quantity: 75,
          min_order_quantity: 1,
          is_premium: false,
          season: 'spring-summer',
          care_instructions: 'Machine wash cold',
          origin_country: 'Turkey',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fabric-3',
          name: 'Luxe Silk Blend',
          fabric_code: 'LSB-003',
          description: 'Elegant silk blend for special occasions',
          composition: '60% Silk, 35% Viscose, 5% Elastane',
          weight: 180,
          price_per_unit: 89.99,
          color_name: 'Midnight Black',
          color_hex: '#000000',
          pattern_type: 'solid',
          image_url: '/api/placeholder/fabric/300/200',
          swatch_image_url: '/api/placeholder/swatch/50/50',
          stock_quantity: 25,
          min_order_quantity: 1,
          is_premium: true,
          season: 'year-round',
          care_instructions: 'Dry clean only',
          origin_country: 'France',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fabric-4',
          name: 'Performance Ponte',
          fabric_code: 'PP-004',
          description: 'Modern ponte fabric with wrinkle resistance',
          composition: '75% Polyester, 20% Rayon, 5% Spandex',
          weight: 240,
          price_per_unit: 28.99,
          color_name: 'Burgundy',
          color_hex: '#722F37',
          pattern_type: 'solid',
          image_url: '/api/placeholder/fabric/300/200',
          swatch_image_url: '/api/placeholder/swatch/50/50',
          stock_quantity: 60,
          min_order_quantity: 1,
          is_premium: false,
          season: 'year-round',
          care_instructions: 'Machine wash warm',
          origin_country: 'USA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFabricSelect = (fabricId: string) => {
    setFabric(fabricId)
  }

  const [priceRange, setPriceRange] = useState([0, 100])
  const [selectedComposition, setSelectedComposition] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sortBy, setSortBy] = useState('name')

  const filteredFabrics = fabrics.filter(fabric => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fabric.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fabric.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fabric.fabric_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'premium' && fabric.is_premium) ||
                          (selectedCategory === 'standard' && !fabric.is_premium) ||
                          fabric.pattern_type === selectedCategory
    
    const matchesPrice = fabric.price_per_unit >= priceRange[0] && fabric.price_per_unit <= priceRange[1]
    
    const matchesComposition = !selectedComposition || 
                              fabric.composition.toLowerCase().includes(selectedComposition.toLowerCase())
    
    const matchesSeason = !selectedSeason || fabric.season === selectedSeason
    
    const matchesStock = !onlyInStock || fabric.stock_quantity > 0

    return matchesSearch && matchesCategory && matchesPrice && matchesComposition && matchesSeason && matchesStock
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price_per_unit - b.price_per_unit
      case 'price-desc':
        return b.price_per_unit - a.price_per_unit
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  const categories = [
    { value: 'all', label: 'All Fabrics' },
    { value: 'premium', label: 'Premium' },
    { value: 'standard', label: 'Standard' },
    { value: 'solid', label: 'Solid' },
    { value: 'pattern', label: 'Patterned' }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Fabric</h2>
        <p className="text-gray-600">Choose the material that matches your style and comfort preferences.</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by fabric name, color, composition, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Advanced Filters */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPriceRange([0, 100])
                setSelectedComposition('')
                setSelectedSeason('')
                setOnlyInStock(false)
                setSortBy('name')
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price Range (${priceRange[0]} - ${priceRange[1]})</Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            
            {/* Composition Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Composition</Label>
              <Select value={selectedComposition} onValueChange={setSelectedComposition}>
                <SelectTrigger>
                  <SelectValue placeholder="Any composition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any composition</SelectItem>
                  <SelectItem value="wool">Wool</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="silk">Silk</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                  <SelectItem value="polyester">Polyester</SelectItem>
                  <SelectItem value="viscose">Viscose</SelectItem>
                  <SelectItem value="elastane">Elastane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Season Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Season</Label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Any season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any season</SelectItem>
                  <SelectItem value="spring-summer">Spring/Summer</SelectItem>
                  <SelectItem value="fall-winter">Fall/Winter</SelectItem>
                  <SelectItem value="year-round">Year Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stock-filter"
                checked={onlyInStock}
                onCheckedChange={setOnlyInStock}
              />
              <Label htmlFor="stock-filter" className="text-sm font-medium cursor-pointer">
                In Stock Only
              </Label>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Fabric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFabrics.map((fabric) => {
          const isSelected = configuration.components.fabric.fabricId === fabric.id
          const isOutOfStock = fabric.stock_quantity === 0
          
          return (
            <Card 
              key={fabric.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary border-primary' : 
                isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'
              }`}
              onClick={() => !isOutOfStock && handleFabricSelect(fabric.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-200"
                      style={{ backgroundColor: fabric.color_hex }}
                    />
                    <div>
                      <CardTitle className="text-lg">{fabric.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={fabric.is_premium ? "default" : "secondary"}>
                          {fabric.is_premium ? 'Premium' : 'Standard'}
                        </Badge>
                        {isOutOfStock && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{fabric.description}</p>
                    <div className="text-xs text-gray-500">
                      <div><strong>Color:</strong> {fabric.color_name}</div>
                      <div><strong>Composition:</strong> {fabric.composition}</div>
                      <div><strong>Weight:</strong> {fabric.weight}g/m²</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm border-t pt-3">
                    <div>
                      <span className="text-gray-500">Price per yard:</span>
                      <div className="font-semibold text-primary">
                        {formatPrice(fabric.price_per_unit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">In stock:</span>
                      <div className="font-medium">
                        {fabric.stock_quantity} yards
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info className="w-3 h-3" />
                    <span>{fabric.care_instructions}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={isSelected ? "default" : "outline"}
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isOutOfStock) handleFabricSelect(fabric.id)
                    }}
                  >
                    {isOutOfStock ? 'Out of Stock' : 
                     isSelected ? 'Selected' : 'Select Fabric'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredFabrics.length === 0 && !loading && (
        <div className="text-center py-12">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fabrics Found</h3>
          <p className="text-gray-600">
            {searchTerm ? 
              'Try adjusting your search or filter criteria.' : 
              'No fabrics available at the moment.'}
          </p>
        </div>
      )}
    </div>
  )
}