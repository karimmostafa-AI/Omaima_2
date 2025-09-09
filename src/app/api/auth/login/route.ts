import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    if (validateAdminCredentials(email, password)) {
      const user = {
        id: 'admin-user-id',
        email: email,
        role: 'ADMIN' as const
      }
      
      await createSession(user)
      
      return NextResponse.json({ success: true, user })
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
