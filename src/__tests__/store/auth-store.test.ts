import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      linkIdentity: vi.fn(),
      unlinkIdentity: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    }
  }
}))

// Mock security service
vi.mock('@/lib/services/security-service', () => ({
  securityService: {
    logSecurityEvent: vi.fn(),
    getSecurityEvents: vi.fn().mockResolvedValue([]),
    checkSuspiciousActivity: vi.fn().mockResolvedValue({ suspicious: false }),
    validateIPAddress: vi.fn().mockResolvedValue(true),
    checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 5, resetTime: new Date() }),
    incrementRateLimit: vi.fn(),
    getClientIP: vi.fn().mockReturnValue('127.0.0.1')
  }
}))

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123'
  }
})

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)'
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000'
    }
  }
})

describe('AuthStore', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    user_metadata: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'CUSTOMER',
      mfa_enabled: false,
      social_providers: []
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z'
  }

  const mockSession: Session = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Reset store state
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      securityLevel: 'basic',
      mfaEnabled: false,
      lastActivity: null,
      ipAddress: null,
      socialProviders: [],
      linkedAccounts: [],
      adminSession: null,
      adminPermissions: []
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Authentication', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockSignIn = supabase.auth.signInWithPassword as MockedFunction<typeof supabase.auth.signInWithPassword>
      mockSignIn.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password')
        expect(response.user).toBeDefined()
        expect(response.session).toBeDefined()
        expect(response.error).toBeUndefined()
      })

      expect(result.current.user).toEqual(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com',
        role: 'CUSTOMER'
      }))
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })

    it('should handle sign in error', async () => {
      const mockSignIn = supabase.auth.signInWithPassword as MockedFunction<typeof supabase.auth.signInWithPassword>
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'wrong-password')
        expect(response.error).toBe('Invalid credentials')
      })

      expect(result.current.user).toBeNull()
    })

    it('should sign up successfully', async () => {
      const mockSignUp = supabase.auth.signUp as MockedFunction<typeof supabase.auth.signUp>
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password', {
          first_name: 'John',
          last_name: 'Doe'
        })
        expect(response.user).toBeDefined()
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            role: 'CUSTOMER',
            mfa_enabled: false,
            social_providers: [],
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      })
    })

    it('should sign out successfully', async () => {
      const mockSignOut = supabase.auth.signOut as MockedFunction<typeof supabase.auth.signOut>
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthStore())

      // Set initial user state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          role: 'CUSTOMER',
          emailVerified: true
        })
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('Social Authentication', () => {
    it('should initiate Google OAuth flow', async () => {
      const mockSignInWithOAuth = supabase.auth.signInWithOAuth as MockedFunction<typeof supabase.auth.signInWithOAuth>
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com', provider: 'google' },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.signInWithGoogle()
        expect(response.error).toBeUndefined()
      })

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback?provider=google'),
          scopes: 'openid profile email'
        }
      })
    })

    it('should handle social auth errors', async () => {
      const mockSignInWithOAuth = supabase.auth.signInWithOAuth as MockedFunction<typeof supabase.auth.signInWithOAuth>
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: null, provider: 'google' },
        error: { message: 'OAuth error' } as any
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.signInWithProvider('google')
        expect(response.error).toBe('OAuth error')
      })
    })

    it('should link social account', async () => {
      const mockLinkIdentity = supabase.auth.linkIdentity as MockedFunction<typeof supabase.auth.linkIdentity>
      mockLinkIdentity.mockResolvedValue({ error: null, data: {} as any })

      const { result } = renderHook(() => useAuthStore())

      // Set initial user
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          role: 'CUSTOMER',
          emailVerified: true
        })
      })

      await act(async () => {
        const response = await result.current.linkSocialAccount('facebook')
        expect(response.error).toBeUndefined()
      })

      expect(mockLinkIdentity).toHaveBeenCalledWith({
        provider: 'facebook'
      })
    })
  })

  describe('Multi-Factor Authentication', () => {
    it('should enable MFA', async () => {
      const mockUpdateUser = supabase.auth.updateUser as MockedFunction<typeof supabase.auth.updateUser>
      mockUpdateUser.mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: { ...mockUser.user_metadata, mfa_enabled: true } } },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser(mockUser as any)
      })

      await act(async () => {
        const response = await result.current.enableMFA()
        expect(response.secret).toBeDefined()
        expect(response.qrCode).toBeDefined()
        expect(response.backupCodes).toHaveLength(10)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mfa_enabled: true,
          mfa_secret: expect.any(String),
          backup_codes: expect.any(Array)
        })
      })
    })

    it('should verify MFA code', async () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser(mockUser as any)
      });

      await act(async () => {
        const response = await result.current.verifyMFA('123456')
        expect(response.success).toBe(true)
      })
    })

    it('should reject invalid MFA code', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const response = await result.current.verifyMFA('invalid')
        expect(response.success).toBe(false)
        expect(response.error).toBeDefined()
      })
    })
  })

  describe('Admin Security', () => {
    it('should validate admin access', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Set admin user
      act(() => {
        result.current.setUser({
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
          emailVerified: true,
          mfaEnabled: true
        })
      })

      await act(async () => {
        const hasAccess = await result.current.validateAdminAccess()
        expect(hasAccess).toBe(false) // No admin session
      })
    })

    it('should create admin session', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Set admin user
      act(() => {
        result.current.setUser({
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
          emailVerified: true,
          mfaEnabled: true
        })
      })

      await act(async () => {
        const session = await result.current.createAdminSession('127.0.0.1', 'Mozilla/5.0')
        expect(session).toBeDefined()
        expect(session?.userId).toBe('admin-123')
        expect(session?.ipAddress).toBe('127.0.0.1')
      })
    })
  })

  describe('Security Monitoring', () => {
    it('should log security events', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logSecurityEvent({
          type: 'login',
          userId: 'user-123',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0'
        })
      })

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should detect suspicious activity', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const activity = await result.current.checkSuspiciousActivity()
        expect(activity.suspicious).toBe(false)
      })
    })
  })

  describe('Utility Functions', () => {
    it('should check user roles', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          role: 'ADMIN',
          emailVerified: true
        })
      })

      // Test the new hierarchical logic
      expect(result.current.hasRole('ADMIN')).toBe(true)
      expect(result.current.hasRole('STAFF')).toBe(true)
      expect(result.current.hasRole('CUSTOMER')).toBe(true)
      expect(result.current.isAdmin()).toBe(true)

      // Test a non-admin user
      act(() => {
        result.current.setUser({
          id: 'user-456',
          email: 'customer@example.com',
          role: 'CUSTOMER',
          emailVerified: true
        })
      })

      expect(result.current.hasRole('ADMIN')).toBe(false)
      expect(result.current.hasRole('STAFF')).toBe(false)
      expect(result.current.hasRole('CUSTOMER')).toBe(true)
      expect(result.current.isAdmin()).toBe(false)
    })

    it('should get user full name', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          emailVerified: true
        })
      })

      expect(result.current.getFullName()).toBe('John Doe')
    })

    it('should get user initials', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          emailVerified: true
        })
      })

      expect(result.current.getInitials()).toBe('JD')
    })
  })

  describe('Session Management', () => {
    it('should refresh session', async () => {
      const mockRefreshSession = supabase.auth.refreshSession as MockedFunction<typeof supabase.auth.refreshSession>
      mockRefreshSession.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.refreshSession()
      })

      expect(mockRefreshSession).toHaveBeenCalled()
    })

    it('should validate session', async () => {
      const mockGetSession = supabase.auth.getSession as MockedFunction<typeof supabase.auth.getSession>
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const isValid = await result.current.validateSession()
        expect(isValid).toBe(true)
      })
    })

    it('should handle session validation failure', async () => {
      const mockGetSession = supabase.auth.getSession as MockedFunction<typeof supabase.auth.getSession>
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const isValid = await result.current.validateSession()
        expect(isValid).toBe(false)
      })
    })

    it('should update last activity', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.updateLastActivity()
      })

      expect(result.current.lastActivity).toBeInstanceOf(Date)
    })
  })
})