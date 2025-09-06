import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Only allow specific admin email
    if (email !== 'admin@omaima.com') {
      return NextResponse.json(
        { error: 'Unauthorized email' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get all users to find our admin user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      )
    }

    const adminUser = users.find(user => user.email === email)
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    console.log('Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      email_confirmed_at: adminUser.email_confirmed_at,
      user_metadata: adminUser.user_metadata
    })

    // Confirm email if not already confirmed
    if (!adminUser.email_confirmed_at) {
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { 
          email_confirm: true,
          user_metadata: {
            ...adminUser.user_metadata,
            role: 'ADMIN',
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      )
      
      if (confirmError) {
        console.error('Error confirming email:', confirmError)
        return NextResponse.json(
          { error: 'Failed to confirm email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Admin user email confirmed successfully',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          confirmed: true
        }
      })
    }

    return NextResponse.json({
      message: 'Admin user is already confirmed and ready',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        confirmed: true
      }
    })

  } catch (error) {
    console.error('Confirm admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
