import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createClient } from '@/lib/supabase-middleware';
import { securityService } from '@/lib/services/security-service';

// Mock dependencies
jest.mock('@/lib/supabase-middleware');
jest.mock('@/lib/services/security-service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

// Helper to create mock request
function createMockRequest(url: string, options: Partial<NextRequest> = {}): NextRequest {
  const request = new NextRequest(url, {
    method: 'GET',
    headers: {
      'user-agent': 'test-agent',
      'x-forwarded-for': '127.0.0.1',
      ...options.headers
    }
  });
  
  return request;
}

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);
    mockSecurityService.getClientIP.mockReturnValue('127.0.0.1');
    mockSecurityService.logSecurityEvent.mockResolvedValue();
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', async () => {
      const request = createMockRequest('https://example.com/');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });

    it('should allow access to auth routes', async () => {
      const authRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/reset-password',
        '/auth/callback'
      ];

      for (const route of authRoutes) {
        const request = createMockRequest(`https://example.com${route}`);
        const response = await middleware(request);
        
        expect(response).toEqual(NextResponse.next());
      }
    });

    it('should allow access to API auth routes', async () => {
      const apiRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/callback',
        '/api/auth/get-ip'
      ];

      for (const route of apiRoutes) {
        const request = createMockRequest(`https://example.com${route}`);
        const response = await middleware(request);
        
        expect(response).toEqual(NextResponse.next());
      }
    });

    it('should bypass middleware for static assets', async () => {
      const staticRoutes = [
        '/_next/static/css/app.css',
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml'
      ];

      for (const route of staticRoutes) {
        const request = createMockRequest(`https://example.com${route}`);
        const response = await middleware(request);
        
        expect(response).toEqual(NextResponse.next());
      }
    });
  });

  describe('Protected Routes - No Authentication', () => {
    it('should redirect unauthenticated users to login for protected routes', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const protectedRoutes = [
        '/dashboard',
        '/admin',
        '/staff',
        '/customize'
      ];

      for (const route of protectedRoutes) {
        const request = createMockRequest(`https://example.com${route}`);
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/auth/login');
        expect(response.headers.get('location')).toContain(`redirect=${encodeURIComponent(route)}`);
      }
    });

    it('should handle session errors', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' }
      });

      const request = createMockRequest('https://example.com/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/login');
    });
  });

  describe('Protected Routes - With Authentication', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      user_metadata: {
        role: 'CUSTOMER',
        mfa_enabled: false
      }
    };

    const mockSession = {
      access_token: 'token123',
      user: mockUser
    };

    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                role: 'CUSTOMER',
                mfaEnabled: false,
                isActive: true
              },
              error: null
            })
          })
        })
      } as any);
    });

    it('should allow access to customer routes for authenticated customers', async () => {
      const request = createMockRequest('https://example.com/dashboard');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
        details: {
          action: 'route_access_attempt',
          path: '/dashboard',
          method: 'GET'
        }
      });
    });

    it('should deny access to admin routes for non-admin users', async () => {
      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
    });

    it('should deny access to staff routes for customer users', async () => {
      const request = createMockRequest('https://example.com/staff');
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
    });
  });

  describe('Admin Routes - Enhanced Security', () => {
    const mockAdminUser = {
      id: 'admin-123',
      email: 'admin@example.com',
      user_metadata: {
        role: 'ADMIN',
        mfa_enabled: true
      }
    };

    const mockAdminSession = {
      access_token: 'admin-token',
      user: mockAdminUser
    };

    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockAdminSession },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'admin-123',
                role: 'ADMIN',
                mfaEnabled: true,
                isActive: true
              },
              error: null
            })
          })
        })
      } as any);
    });

    it('should allow admin access with whitelisted IP', async () => {
      mockSecurityService.isIPWhitelisted.mockResolvedValue(true);
      mockSecurityService.validateAdminSession.mockResolvedValue(true);
      mockSecurityService.checkRateLimit.mockResolvedValue(true);

      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockSecurityService.isIPWhitelisted).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should deny admin access from non-whitelisted IP', async () => {
      mockSecurityService.getClientIP.mockReturnValue('203.0.113.1');
      mockSecurityService.isIPWhitelisted.mockResolvedValue(false);

      const request = createMockRequest('https://example.com/admin', {
        headers: { 'x-forwarded-for': '203.0.113.1' }
      });
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'ip_blocked',
        userId: 'admin-123',
        ip: '203.0.113.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
        details: {
          action: 'admin_access_denied',
          reason: 'ip_not_whitelisted',
          path: '/admin'
        }
      });
    });

    it('should deny admin access without MFA', async () => {
      // Mock admin user without MFA
      const adminWithoutMFA = {
        ...mockAdminUser,
        user_metadata: {
          role: 'ADMIN',
          mfa_enabled: false
        }
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { ...mockAdminSession, user: adminWithoutMFA } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'admin-123',
                role: 'ADMIN',
                mfaEnabled: false,
                isActive: true
              },
              error: null
            })
          })
        })
      } as any);

      mockSecurityService.isIPWhitelisted.mockResolvedValue(true);

      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
    });

    it('should handle rate limiting for admin routes', async () => {
      mockSecurityService.isIPWhitelisted.mockResolvedValue(true);
      mockSecurityService.checkRateLimit.mockResolvedValue(false);

      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(429);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'admin-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
        details: {
          action: 'rate_limit_exceeded',
          path: '/admin'
        }
      });
    });

    it('should validate admin session timeout', async () => {
      mockSecurityService.isIPWhitelisted.mockResolvedValue(true);
      mockSecurityService.checkRateLimit.mockResolvedValue(true);
      mockSecurityService.validateAdminSession.mockResolvedValue(false);

      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'admin-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: expect.any(Date),
        details: {
          action: 'admin_session_expired',
          path: '/admin'
        }
      });
    });
  });

  describe('Staff Routes', () => {
    it('should allow staff access for staff users', async () => {
      const staffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        user_metadata: {
          role: 'STAFF',
          mfa_enabled: false
        }
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token', user: staffUser } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'staff-123',
                role: 'STAFF',
                mfaEnabled: false,
                isActive: true
              },
              error: null
            })
          })
        })
      } as any);

      const request = createMockRequest('https://example.com/staff');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });

    it('should allow admin access to staff routes', async () => {
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: {
          role: 'ADMIN',
          mfa_enabled: true
        }
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token', user: adminUser } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'admin-123',
                role: 'ADMIN',
                mfaEnabled: true,
                isActive: true
              },
              error: null
            })
          })
        })
      } as any);

      const request = createMockRequest('https://example.com/staff');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });
  });

  describe('IP Address Detection', () => {
    it('should correctly extract IP from x-forwarded-for header', async () => {
      const request = createMockRequest('https://example.com/dashboard', {
        headers: { 'x-forwarded-for': '192.168.1.100, 10.0.0.1' }
      });

      mockSecurityService.getClientIP.mockReturnValue('192.168.1.100');

      await middleware(request);

      expect(mockSecurityService.getClientIP).toHaveBeenCalledWith(request);
    });

    it('should handle missing IP headers gracefully', async () => {
      mockSecurityService.getClientIP.mockReturnValue('unknown');
      
      const request = createMockRequest('https://example.com/dashboard', {
        headers: {}
      });

      await middleware(request);

      expect(mockSecurityService.getClientIP).toHaveBeenCalledWith(request);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: 'user-123' } } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      } as any);

      const request = createMockRequest('https://example.com/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/login');
    });

    it('should handle security service errors', async () => {
      mockSecurityService.logSecurityEvent.mockRejectedValue(new Error('Logging error'));
      
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const request = createMockRequest('https://example.com/dashboard');
      
      // Should not throw despite logging error
      const response = await middleware(request);
      expect(response.status).toBe(307);
    });
  });
});