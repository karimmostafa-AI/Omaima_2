import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { securityService } from '@/lib/services/security-service'

/**
 * OAuth callback handler for social authentication
 * Handles callbacks from Google, Facebook, GitHub, and Apple
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const provider = requestUrl.searchParams.get('provider')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Get client info for security logging
  const clientIP = securityService.getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    
    await securityService.logSecurityEvent({
      type: 'failed_login',
      ip: clientIP,
      userAgent,
      details: {
        provider,
        error,
        errorDescription,
        action: 'oauth_callback_error'
      }
    })

    const redirectUrl = new URL('/auth/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'oauth_error')
    redirectUrl.searchParams.set('message', errorDescription || 'OAuth authentication failed')
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    await securityService.logSecurityEvent({
      type: 'failed_login',
      ip: clientIP,
      userAgent,
      details: {
        provider,
        error: 'missing_code',
        action: 'oauth_callback_no_code'
      }
    })

    const redirectUrl = new URL('/auth/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'oauth_error')
    redirectUrl.searchParams.set('message', 'Invalid OAuth response')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    const supabase = createClient()

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      
      await securityService.logSecurityEvent({
        type: 'failed_login',
        ip: clientIP,
        userAgent,
        details: {
          provider,
          error: exchangeError.message,
          action: 'oauth_code_exchange_failed'
        }
      })

      const redirectUrl = new URL('/auth/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'oauth_error')
      redirectUrl.searchParams.set('message', 'Failed to complete OAuth authentication')
      return NextResponse.redirect(redirectUrl)
    }

    if (!data.user || !data.session) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        ip: clientIP,
        userAgent,
        details: {
          provider,
          error: 'no_user_session',
          action: 'oauth_callback_no_session'
        }
      })

      const redirectUrl = new URL('/auth/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'oauth_error')
      redirectUrl.searchParams.set('message', 'Failed to create user session')
      return NextResponse.redirect(redirectUrl)
    }

    // Update user metadata to track social providers
    const existingProviders = data.user.user_metadata?.social_providers || []
    if (provider && !existingProviders.includes(provider)) {
      await supabase.auth.updateUser({
        data: {
          social_providers: [...existingProviders, provider]
        }
      })
    }

    // Log successful OAuth authentication
    await securityService.logSecurityEvent({
      type: 'login',
      userId: data.user.id,
      ip: clientIP,
      userAgent,
      details: {
        provider,
        action: 'oauth_success',
        email: data.user.email
      }
    })

    // Check for suspicious activity
    const suspiciousActivity = await securityService.detectSuspiciousActivity({
      userId: data.user.id,
      ip: clientIP
    })

    if (suspiciousActivity) {
      await securityService.triggerSecurityAlert(suspiciousActivity)
      
      // For critical alerts, require additional verification
      if (suspiciousActivity.severity === 'critical') {
        const redirectUrl = new URL('/auth/security-verification', requestUrl.origin)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Create response with session cookies
    const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

    // Set session cookies
    if (data.session.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    if (data.session.refresh_token) {
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
    }

    // Add success message
    response.cookies.set('auth-success', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute
      path: '/',
    })

    return response

  } catch (error) {
    console.error('OAuth callback error:', error)
    
    await securityService.logSecurityEvent({
      type: 'failed_login',
      ip: clientIP,
      userAgent,
      details: {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'oauth_callback_exception'
      }
    })

    const redirectUrl = new URL('/auth/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'oauth_error')
    redirectUrl.searchParams.set('message', 'An unexpected error occurred')
    return NextResponse.redirect(redirectUrl)
  }
}