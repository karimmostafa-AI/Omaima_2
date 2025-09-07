import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/auth/callback/route'
import { securityService } from '@/lib/services/security-service'

// Hoisted mock functions
const mockRedirect = vi.hoisted(() => vi.fn())
const mockCookiesSet = vi.hoisted(() => vi.fn())
const mockExchangeCodeForSession = vi.hoisted(() => vi.fn())
const mockUpdateUser = vi.hoisted(() => vi.fn())

const mockSupabaseClient = {
  auth: {
    exchangeCodeForSession: mockExchangeCodeForSession,
    updateUser: mockUpdateUser
  }
}

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient
}))

vi.mock('@/lib/services/security-service')

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      redirect: mockRedirect,
      json: vi.fn()
    }
  }
})

// Create a properly mocked response with cookies
const createMockResponse = () => ({
  cookies: {
    set: mockCookiesSet
  }
})

describe('/api/auth/callback', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      social_providers: []
    }
  }

  const mockSession = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockReturnValue(createMockResponse())
    vi.mocked(securityService.getClientIP).mockReturnValue('127.0.0.1')
    
    // Set up default environment
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

    // Default mock for successful code exchange
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    })
    mockUpdateUser.mockResolvedValue({ error: null })
  })

  describe('OAuth Success Flow', () => {
    it('should handle successful Google OAuth callback', async () => {
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(null)

      await GET(request)

      // Verify code exchange was called
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('auth_code_123')
      
      // Verify user metadata update
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          social_providers: ['google']
        }
      })

      // Verify security logging
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'login',
          userId: 'user-123',
          ip: '127.0.0.1',
          userAgent: 'unknown',
          details: {
            provider: 'google',
            action: 'oauth_success',
            email: 'test@example.com'
          }
        })
      )

      // Verify redirect to dashboard
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/dashboard', 'http://localhost:3000')
      )

      // Verify cookies were set
      expect(mockCookiesSet).toHaveBeenCalledWith('sb-access-token', 'access-token-123', expect.objectContaining({
        httpOnly: true,
        secure: false, // Development mode
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      }))
    })

    it('should handle Facebook OAuth callback', async () => {
      const url = 'http://localhost:3000/auth/callback?code=fb_code_123&provider=facebook'
      const request = new NextRequest(url)
      
      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(null)

      await GET(request)

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            provider: 'facebook'
          })
        })
      )
    })

    it('should set secure cookies in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(null)

      await GET(request)

      expect(mockCookiesSet).toHaveBeenCalledWith('sb-access-token', 'access-token-123', expect.objectContaining({
        secure: true // Production mode
      }))
      
      vi.unstubAllEnvs()
    })
  })

  describe('OAuth Error Handling', () => {
    it('should handle OAuth error parameters', async () => {
      const url = 'http://localhost:3000/auth/callback?error=access_denied&error_description=User+denied+access&provider=google'
      const request = new NextRequest(url)

      await GET(request)

      // Verify error logging
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'failed_login',
        ip: '127.0.0.1',
        userAgent: 'unknown',
        details: {
          provider: 'google',
          error: 'access_denied',
          errorDescription: 'User denied access',
          action: 'oauth_callback_error'
        }
      })

      // Verify redirect to login with error
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/auth/login?error=oauth_error&message=User+denied+access', 'http://localhost:3000')
      )
    })

    it('should handle missing authorization code', async () => {
      const url = 'http://localhost:3000/auth/callback?provider=google'
      const request = new NextRequest(url)

      await GET(request)

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'failed_login',
          details: expect.objectContaining({
            error: 'missing_code',
            action: 'oauth_callback_no_code'
          })
        })
      )

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/auth/login?error=oauth_error&message=Invalid+OAuth+response', 'http://localhost:3000')
      )
    })

    it('should handle code exchange failure', async () => {
      const url = 'http://localhost:3000/auth/callback?code=invalid_code&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid authorization code' }
      })

      await GET(request)

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'failed_login',
          details: expect.objectContaining({
            error: 'Invalid authorization code',
            action: 'oauth_code_exchange_failed'
          })
        })
      )
    })

    it('should handle missing user session after code exchange', async () => {
      const url = 'http://localhost:3000/auth/callback?code=valid_code&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      await GET(request)

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            error: 'no_user_session',
            action: 'oauth_callback_no_session'
          })
        })
      )
    })
  })

  describe('Security Features', () => {
    it('should detect and handle suspicious activity', async () => {
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })
      mockUpdateUser.mockResolvedValue({ error: null })

      const mockSuspiciousActivity = {
        id: 'alert-123',
        type: 'multiple_failed_logins',
        severity: 'high' as const,
        ip: '127.0.0.1',
        details: {},
        timestamp: new Date(),
        resolved: false
      }
      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(mockSuspiciousActivity)

      await GET(request)

      expect(securityService.triggerSecurityAlert).toHaveBeenCalledWith(mockSuspiciousActivity)
    })

    it('should redirect to security verification for critical alerts', async () => {
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })
      mockUpdateUser.mockResolvedValue({ error: null })

      const criticalAlert = {
        id: 'alert-123',
        type: 'brute_force',
        severity: 'critical' as const,
        ip: '127.0.0.1',
        details: {},
        timestamp: new Date(),
        resolved: false
      }
      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(criticalAlert)

      await GET(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/auth/security-verification', 'http://localhost:3000')
      )
    })

    it('should update social providers list correctly', async () => {
      const existingUser = {
        ...mockUser,
        user_metadata: {
          social_providers: ['facebook']
        }
      }
      
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: existingUser, session: mockSession },
        error: null
      })
      mockUpdateUser.mockResolvedValue({ error: null })

      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(null)

      await GET(request)

      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          social_providers: ['facebook', 'google']
        }
      })
    })

    it('should not duplicate existing social providers', async () => {
      const existingUser = {
        ...mockUser,
        user_metadata: {
          social_providers: ['google', 'facebook']
        }
      }
      
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockResolvedValue({
        data: { user: existingUser, session: mockSession },
        error: null
      })
      mockUpdateUser.mockResolvedValue({ error: null })

      vi.mocked(securityService.detectSuspiciousActivity).mockResolvedValue(null)

      await GET(request)

      // Should not call updateUser since Google is already in the list
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  describe('Exception Handling', () => {
    it('should handle unexpected exceptions gracefully', async () => {
      const url = 'http://localhost:3000/auth/callback?code=auth_code_123&provider=google'
      const request = new NextRequest(url)
      
      mockExchangeCodeForSession.mockRejectedValue(new Error('Network error'))

      await GET(request)

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'failed_login',
          details: expect.objectContaining({
            error: 'Network error',
            action: 'oauth_callback_exception'
          })
        })
      )

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/auth/login?error=oauth_error&message=An+unexpected+error+occurred', 'http://localhost:3000')
      )
    })
  })
})