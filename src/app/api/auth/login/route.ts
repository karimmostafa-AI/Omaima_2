import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createSession, type LoginData } from '@/lib/auth-utils'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const loginData: LoginData = validation.data
    
    // Authenticate user (admin or customer)
    const result = await authenticateUser(loginData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Create session
    if (result.user) {
      await createSession(result.user)
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        name: result.user?.name,
        role: result.user?.role
      }
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
