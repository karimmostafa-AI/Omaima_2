import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Temporary admin setup endpoint - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Only allow specific admin email
    if (email !== 'admin@omaima.com') {
      return NextResponse.json(
        { error: 'Unauthorized email' },
        { status: 403 }
      )
    }

    // Create admin user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'ADMIN',
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { message: 'Admin user already exists. Try logging in.' },
          { status: 200 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Admin user created successfully',
        user: data.user 
      },
      { status: 201 }
    )
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}