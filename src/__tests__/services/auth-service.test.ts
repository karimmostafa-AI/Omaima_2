import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationService } from '@/lib/services/auth-service';
import { securityService } from '@/lib/services/security-service';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/lib/services/security-service');
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      exchangeCodeForSession: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    }))
  }
}));

const mockSecurityService = securityService as any;

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'CUSTOMER',
          mfa_enabled: false
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      } as User;

      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: mockUser
      } as Session;

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSecurityService.checkRateLimit.mockResolvedValue({ 
        allowed: true, 
        remaining: 5,
        resetTime: new Date()
      });
      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeUndefined();
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        details: { email: 'test@example.com', rememberMe: false }
      });
    });

    it('should handle rate limiting', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: new Date()
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBe('Too many login attempts. Please try again later.');
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue({ 
        allowed: true, 
        remaining: 5,
        resetTime: new Date()
      });
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      mockSecurityService.incrementRateLimit.mockResolvedValue();
      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBe('Invalid credentials');
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'failed_login',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        details: { 
          email: 'test@example.com',
          error: 'Invalid credentials'
        }
      });
    });

    it('should require MFA for admin users', async () => {
      const mockAdminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: {
          role: 'ADMIN',
          mfa_enabled: true
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      } as User;

      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: mockAdminUser
      } as Session;

      mockSecurityService.checkRateLimit.mockResolvedValue({ 
        allowed: true, 
        remaining: 5,
        resetTime: new Date()
      });
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockAdminUser, session: mockSession },
        error: null
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signIn({
        email: 'admin@example.com',
        password: 'password123'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.requiresMFA).toBe(true);
      expect(result.user).toEqual(mockAdminUser);
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
        user_metadata: {
          role: 'CUSTOMER',
          first_name: 'John',
          last_name: 'Doe'
        },
        email_confirmed_at: undefined,
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      } as User;

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.user).toEqual(mockUser);
      expect(result.requiresEmailVerification).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'John',
            last_name: 'Doe',
            phone: undefined,
            role: 'CUSTOMER',
            marketing_consent: false,
            mfa_enabled: false,
            social_providers: []
          }
        }
      });
    });

    it('should handle signup errors', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' }
      });

      const result = await authService.signUp({
        email: 'existing@example.com',
        password: 'password123'
      }, {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBe('Email already registered');
    });
  });

  describe('signInWithProvider', () => {
    it('should successfully initiate social authentication', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: 'https://oauth-url.com', provider: 'google' },
        error: null
      });

      const result = await authService.signInWithProvider('google', {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBeUndefined();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback?provider=google'),
          scopes: 'openid profile email',
          queryParams: {
            ip: '127.0.0.1',
            user_agent: 'test-agent'
          }
        }
      });
    });

    it('should handle social authentication errors', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider error' }
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signInWithProvider('facebook', {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBe('OAuth provider error');
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue({ 
        allowed: true, 
        remaining: 2,
        resetTime: new Date()
      });

      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: {},
        error: null
      });

      mockSecurityService.incrementRateLimit.mockResolvedValue();
      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.resetPassword('user@example.com', {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBeUndefined();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        {
          redirectTo: expect.stringContaining('/auth/reset-password')
        }
      );
    });

    it('should handle password reset errors', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue({ 
        allowed: true, 
        remaining: 2,
        resetTime: new Date()
      });

      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });

      const result = await authService.resetPassword('nonexistent@example.com', {
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.error).toBe('User not found');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      } as User;

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.auth.signOut as any).mockResolvedValue({
        error: null
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      await authService.signOut({
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'logout',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });
    });

    it('should handle signout errors gracefully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null
      });

      (supabase.auth.signOut as any).mockResolvedValue({
        error: { message: 'Session error' }
      });

      // Should not throw an error
      await expect(authService.signOut({
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      })).resolves.toBeUndefined();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session', async () => {
      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh'
      } as Session;

      const mockUser = { id: 'user-123' } as User;

      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      });

      const result = await authService.refreshSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('should handle session refresh errors', async () => {
      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid refresh token' }
      });

      const result = await authService.refreshSession();

      expect(result.session).toBeNull();
      expect(result.error).toBe('Invalid refresh token');
    });
  });
});