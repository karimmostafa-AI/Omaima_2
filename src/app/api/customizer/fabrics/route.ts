import { NextRequest, NextResponse } from 'next/server'
import { createApiResponse } from '@/lib/api-helpers'

// Mock fabrics data
const FABRICS = [
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
]

export async function GET() {
  try {
    return NextResponse.json(
      createApiResponse({
        fabrics: FABRICS,
        total: FABRICS.length
      })
    )
  } catch (error) {
    console.error('Fabrics API error:', error)
    return NextResponse.json(
      createApiResponse(null, {
        message: 'Failed to fetch fabrics',
        code: 'FETCH_ERROR'
      }),
      { status: 500 }
    )
  }
}