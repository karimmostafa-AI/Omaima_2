import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const supabase = await createClient()
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Create user object from Supabase data
    const user = {
      id: data.user.id,
      email: data.user.email!,
      firstName: data.user.user_metadata?.first_name || 'Admin',
      lastName: data.user.user_metadata?.last_name || 'User',
      role: data.user.user_metadata?.role || 'CUSTOMER',
      emailVerified: !!data.user.email_confirmed_at,
      isActive: true,
      avatar: data.user.user_metadata?.avatar_url,
      createdAt: data.user.created_at,
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
