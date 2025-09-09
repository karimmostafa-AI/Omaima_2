import { NextRequest, NextResponse } from 'next/server'
import { registerCustomer, createSession, type RegisterData } from '@/lib/auth-utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const registerData: RegisterData = validation.data
    
    // Register the user
    const result = await registerCustomer(registerData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Create session for the new user
    if (result.user) {
      await createSession(result.user)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        name: result.user?.name,
        role: result.user?.role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
