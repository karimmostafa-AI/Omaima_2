import { NextRequest, NextResponse } from 'next/server'
import { createApiResponse } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, configuration, calculated_price } = body

    if (!name || !configuration) {
      return NextResponse.json(
        createApiResponse(null, {
          message: 'Name and configuration are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }),
        { status: 400 }
      )
    }

    // Mock save operation - in a real app, this would save to database
    const savedDesign = {
      id: `design-${Date.now()}`,
      name,
      configuration,
      calculated_price: calculated_price || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Design saved:', savedDesign)

    return NextResponse.json(
      createApiResponse({
        design: savedDesign,
        message: 'Design saved successfully'
      })
    )
  } catch (error) {
    console.error('Save design API error:', error)
    return NextResponse.json(
      createApiResponse(null, {
        message: 'Failed to save design',
        code: 'SAVE_ERROR'
      }),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock designs list - in a real app, this would fetch from database
    const designs = [
      {
        id: 'design-1',
        name: 'Navy Business Suit',
        configuration: {},
        calculated_price: 399.99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    return NextResponse.json(
      createApiResponse({
        designs,
        total: designs.length
      })
    )
  } catch (error) {
    console.error('Get designs API error:', error)
    return NextResponse.json(
      createApiResponse(null, {
        message: 'Failed to fetch designs',
        code: 'FETCH_ERROR'
      }),
      { status: 500 }
    )
  }
}