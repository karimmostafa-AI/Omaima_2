import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { securityService } from '@/lib/services/security-service'
import { authService } from '@/lib/services/auth-service'
import { z } from 'zod'

const adminAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().length(6).optional(),
  action: z.enum(['login', 'validate', 'logout'])
})

const adminSessionSchema = z.object({
  action: z.enum(['create', 'validate', 'terminate']),
  sessionToken: z.string().optional()
})

/**
 * Enhanced admin authentication endpoint
 * Handles admin login with additional security measures
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIP = securityService.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Parse request based on action type
    if (body.action === 'login') {
      return await handleAdminLogin(body, clientIP, userAgent)
    } else if (body.action === 'validate') {
      return await handleAdminValidation(body, clientIP, userAgent)
    } else if (body.action === 'logout') {
      return await handleAdminLogout(body, clientIP, userAgent)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle admin login with enhanced security
 */
async function handleAdminLogin(
  body: any,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    const { email, password, mfaCode } = adminAuthSchema.parse(body)

    // Check rate limiting for admin login attempts
    const rateLimitResult = await securityService.checkRateLimit(
      `admin:${clientIP}`,
      'admin_access'
    )

    if (!rateLimitResult.allowed) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        ip: clientIP,
        userAgent,
        details: {
          reason: 'admin_rate_limit_exceeded',
          email,
          remaining: rateLimitResult.remaining
        }
      })

      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          rateLimited: true,
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    // Validate IP whitelist for admin access
    const isIPAllowed = await securityService.validateIPAddress(clientIP, [
      '192.168.1.0/24',  // Local network
      '10.0.0.0/8',      // Private network
      '127.0.0.1',       // Localhost
      '::1'              // IPv6 localhost
    ])

    if (!isIPAllowed) {
      await securityService.logSecurityEvent({
        type: 'ip_blocked',
        ip: clientIP,
        userAgent,
        details: {
          reason: 'admin_ip_not_whitelisted',
          email
        }
      })

      return NextResponse.json(
        { error: 'Access denied from this IP address' },
        { status: 403 }
      )
    }

    // Authenticate with Supabase
    const result = await authService.signIn(
      { email, password },
      { ip: clientIP, userAgent }
    )

    if (result.error) {
      // Increment rate limit on failed attempt
      await securityService.incrementRateLimit(`admin:${clientIP}`, 'admin_access')
      
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Verify admin role
    if (!result.user || result.user.user_metadata?.role !== 'ADMIN') {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId: result.user?.id,
        ip: clientIP,
        userAgent,
        details: {
          reason: 'insufficient_privileges',
          email,
          role: result.user?.user_metadata?.role
        }
      })

      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Check MFA requirement
    if (result.requiresMFA) {
      if (!mfaCode) {
        return NextResponse.json({
          requiresMFA: true,
          message: 'Multi-factor authentication required'
        })
      }

      // Verify MFA code
      const mfaResult = await authService.verifyMFA(result.user.id, mfaCode)
      if (!mfaResult.success) {
        return NextResponse.json(
          { error: mfaResult.error || 'Invalid MFA code' },
          { status: 401 }
        )
      }
    }

    // Create admin session
    const adminSession = await authService.createAdminSession(
      result.user.id,
      clientIP,
      userAgent
    )

    if (!adminSession) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId: result.user.id,
        ip: clientIP,
        userAgent,
        details: {
          reason: 'admin_session_creation_failed',
          email
        }
      })

      return NextResponse.json(
        { error: 'Failed to create secure admin session' },
        { status: 500 }
      )
    }

    // Log successful admin login
    await securityService.logSecurityEvent({
      type: 'admin_access',
      userId: result.user.id,
      ip: clientIP,
      userAgent,
      details: {
        action: 'admin_login_success',
        email,
        sessionId: adminSession.id
      }
    })

    // Create response with admin session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.user_metadata?.role
      },
      adminSession: {
        id: adminSession.id,
        expiresAt: adminSession.expiresAt
      }
    })

    // Set admin session cookie
    response.cookies.set('admin-session-token', adminSession.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60, // 30 minutes
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

/**
 * Validate admin session
 */
async function handleAdminValidation(
  body: any,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    const sessionToken = body.sessionToken
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      )
    }

    const isValid = await authService.validateAdminSession(sessionToken)
    
    if (!isValid) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        ip: clientIP,
        userAgent,
        details: {
          reason: 'invalid_admin_session',
          action: 'session_validation'
        }
      })

      return NextResponse.json(
        { valid: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error('Admin validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle admin logout
 */
async function handleAdminLogout(
  body: any,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    await authService.signOut({ ip: clientIP, userAgent })

    // Clear admin session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin-session-token')
    
    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle admin session management (GET requests)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const clientIP = securityService.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (action === 'session-info') {
      return NextResponse.json({
        ip: clientIP,
        userAgent,
        timestamp: new Date().toISOString(),
        location: 'Unknown Location' // Would be populated by geo-location service
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
