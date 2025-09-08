import { NextRequest, NextResponse } from 'next/server'
import { createApiResponse } from '@/lib/api-helpers'

// Mock templates data
const TEMPLATES = [
  {
    id: 'template-1',
    name: 'Professional Suit',
    description: 'Classic two-piece professional suit perfect for business meetings and formal occasions.',
    category: 'suits',
    base_price: 299.99,
    estimated_delivery_days: 14,
    fabric_requirements: 3.5,
    estimated_fabric_yards: 3.5,
    available_components: ['jacket', 'pants', 'vest'],
    default_configuration: {
      jacket_style: 'single-breasted',
      pants_style: 'straight',
      fit_type: 'regular'
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'template-2',
    name: 'Modern Blazer Set',
    description: 'Contemporary blazer with matching skirt or pants, ideal for professional settings.',
    category: 'blazers',
    base_price: 249.99,
    estimated_delivery_days: 12,
    fabric_requirements: 2.8,
    estimated_fabric_yards: 2.8,
    available_components: ['blazer', 'skirt', 'pants'],
    default_configuration: {
      blazer_style: 'tailored',
      bottom_style: 'pencil-skirt',
      fit_type: 'slim'
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'template-3',
    name: 'Executive Dress',
    description: 'Sophisticated dress design perfect for executive meetings and professional events.',
    category: 'dresses',
    base_price: 199.99,
    estimated_delivery_days: 10,
    fabric_requirements: 2.2,
    estimated_fabric_yards: 2.2,
    available_components: ['dress', 'belt'],
    default_configuration: {
      dress_style: 'sheath',
      sleeve_style: 'three-quarter',
      fit_type: 'regular'
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function GET() {
  try {
    return NextResponse.json(
      createApiResponse({
        templates: TEMPLATES,
        total: TEMPLATES.length
      })
    )
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      createApiResponse(null, {
        message: 'Failed to fetch templates',
        code: 'FETCH_ERROR'
      }),
      { status: 500 }
    )
  }
}