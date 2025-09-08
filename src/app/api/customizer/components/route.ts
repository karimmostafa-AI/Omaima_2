import { NextRequest, NextResponse } from 'next/server'
import { createApiResponse, getQueryParam } from '@/lib/api-helpers'

// Mock components data
const COMPONENTS: Record<string, any[]> = {
  'jacket_style': [
    {
      id: 'js-1',
      template_id: 'template-1',
      category: 'jacket_style',
      name: 'single_breasted',
      display_name: 'Single Breasted',
      description: 'Classic single-breasted style with clean lines',
      price_modifier: 0,
      price_type: 'fixed',
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'js-2',
      template_id: 'template-1',
      category: 'jacket_style',
      name: 'double_breasted',
      display_name: 'Double Breasted',
      description: 'Formal double-breasted style with overlapping fronts',
      price_modifier: 35.00,
      price_type: 'fixed',
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'lapel_style': [
    {
      id: 'ls-1',
      template_id: 'template-1',
      category: 'lapel_style',
      name: 'notched',
      display_name: 'Notched Lapel',
      description: 'Traditional notched lapel for business wear',
      price_modifier: 0,
      price_type: 'fixed',
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ls-2',
      template_id: 'template-1',
      category: 'lapel_style',
      name: 'peak',
      display_name: 'Peak Lapel',
      description: 'Elegant peak lapel for formal occasions',
      price_modifier: 25.00,
      price_type: 'fixed',
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'button_style': [
    {
      id: 'bs-1',
      template_id: 'template-1',
      category: 'button_style',
      name: 'standard',
      display_name: 'Standard Buttons',
      description: 'Classic matching buttons',
      price_modifier: 0,
      price_type: 'fixed',
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bs-2',
      template_id: 'template-1',
      category: 'button_style',
      name: 'horn',
      display_name: 'Horn Buttons',
      description: 'Premium natural horn buttons',
      price_modifier: 15.00,
      price_type: 'fixed',
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'pants_style': [
    {
      id: 'ps-1',
      template_id: 'template-1',
      category: 'pants_style',
      name: 'straight',
      display_name: 'Straight Leg',
      description: 'Classic straight leg cut',
      price_modifier: 0,
      price_type: 'fixed',
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps-2',
      template_id: 'template-1',
      category: 'pants_style',
      name: 'tapered',
      display_name: 'Tapered',
      description: 'Modern tapered fit',
      price_modifier: 10.00,
      price_type: 'fixed',
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'lining': [
    {
      id: 'l-1',
      template_id: 'template-1',
      category: 'lining',
      name: 'standard',
      display_name: 'Standard Lining',
      description: 'Quality polyester lining',
      price_modifier: 0,
      price_type: 'fixed',
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'l-2',
      template_id: 'template-1',
      category: 'lining',
      name: 'silk',
      display_name: 'Silk Lining',
      description: 'Luxurious silk lining',
      price_modifier: 45.00,
      price_type: 'fixed',
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const templateId = getQueryParam(request, 'templateId')
    
    if (!templateId) {
      return NextResponse.json(
        createApiResponse(null, {
          message: 'Template ID is required',
          code: 'MISSING_TEMPLATE_ID'
        }),
        { status: 400 }
      )
    }

    // Filter components by template ID (for now, return all mock components)
    const filteredComponents: Record<string, any[]> = {}
    
    Object.entries(COMPONENTS).forEach(([category, options]) => {
      filteredComponents[category] = options.filter(option => 
        option.template_id === templateId || templateId === 'template-1' // Fallback for demo
      )
    })

    return NextResponse.json(
      createApiResponse({
        components: filteredComponents,
        template_id: templateId
      })
    )
  } catch (error) {
    console.error('Components API error:', error)
    return NextResponse.json(
      createApiResponse(null, {
        message: 'Failed to fetch components',
        code: 'FETCH_ERROR'
      }),
      { status: 500 }
    )
  }
}