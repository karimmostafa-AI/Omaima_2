import { AuthenticationService } from '@/lib/services/auth-service';
import { securityService } from '@/lib/services/security-service';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/services/security-service');
jest.mock('@/lib/supabase');

const mockSecurityService = securityService as jest.Mocked<typeof securityService>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'CUSTOMER',
          mfa_enabled: false
        }
      };

      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: mockUser
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signIn('test@example.com', 'password123', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
        details: { action: 'standard_login' }
      });
    });

    it('should handle rate limiting', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(false);

      const result = await authService.signIn('test@example.com', 'password123', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded. Please try again later.');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle IP validation failure', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateIPAddress.mockResolvedValue(false);

      const result = await authService.signIn('test@example.com', 'password123', {
        ipAddress: '192.168.1.100',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied from this location');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'failed_login',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
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
        }
      };

      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: mockAdminUser
      };

      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAdminUser, session: mockSession },
        error: null
      });

      const result = await authService.signIn('admin@example.com', 'password123', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
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
        }
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signUp('newuser@example.com', 'password123', {
        firstName: 'John',
        lastName: 'Doe'
      }, {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'CUSTOMER',
            mfa_enabled: false,
            social_providers: [],
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      });
    });

    it('should handle signup errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' }
      });

      const result = await authService.signUp('existing@example.com', 'password123', {}, {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('signInWithSocial', () => {
    it('should successfully initiate social authentication', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth-url.com' },
        error: null
      });

      const result = await authService.signInWithSocial('google', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(result.redirectUrl).toBe('https://oauth-url.com');
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback?provider=google'),
          scopes: 'openid profile email'
        }
      });
    });

    it('should handle social authentication errors', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider error' }
      });

      const result = await authService.signInWithSocial('facebook', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('OAuth provider error');
    });
  });

  describe('validateMFA', () => {
    it('should successfully validate MFA code', async () => {
      const mockUser = {
        id: 'user-123',
        user_metadata: {
          mfa_secret: 'SECRET123'
        }
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock TOTP validation (would normally use a real TOTP library)
      const result = await authService.validateMFA('123456', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
    });

    it('should handle invalid MFA codes', async () => {
      const mockUser = {
        id: 'user-123',
        user_metadata: {
          mfa_secret: 'SECRET123'
        }
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.validateMFA('000000', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid verification code');
    });
  });

  describe('adminSignIn', () => {
    it('should successfully sign in admin with enhanced security', async () => {
      const mockAdminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: {
          role: 'ADMIN',
          mfa_enabled: true
        }
      };

      const mockSession = {
        access_token: 'admin-token',
        refresh_token: 'admin-refresh',
        user: mockAdminUser
      };

      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.isIPWhitelisted.mockResolvedValue(true);
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAdminUser, session: mockSession },
        error: null
      });

      const result = await authService.adminSignIn('admin@example.com', 'adminpass123', {
        ipAddress: '127.0.0.1',
        userAgent: 'admin-agent'
      });

      expect(result.success).toBe(true);
      expect(result.requiresMFA).toBe(true);
      expect(mockSecurityService.isIPWhitelisted).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should reject admin login from non-whitelisted IP', async () => {
      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.isIPWhitelisted.mockResolvedValue(false);

      const result = await authService.adminSignIn('admin@example.com', 'adminpass123', {
        ipAddress: '203.0.113.1',
        userAgent: 'admin-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Admin access denied from this IP address');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null
      });

      const result = await authService.resetPassword('user@example.com', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        {
          redirectTo: expect.stringContaining('/auth/reset-password')
        }
      );
    });

    it('should handle password reset errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });

      const result = await authService.resetPassword('nonexistent@example.com', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      mockSecurityService.logSecurityEvent.mockResolvedValue();

      const result = await authService.signOut({
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'logout',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date)
      });
    });

    it('should handle signout errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Session error' }
      });

      const result = await authService.signOut({
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session error');
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session', async () => {
      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh'
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await authService.refreshSession();

      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockSession);
    });

    it('should handle session refresh errors', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' }
      });

      const result = await authService.refreshSession();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid refresh token');
    });
  });
});