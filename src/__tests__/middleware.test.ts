import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createClient } from '@/lib/supabase-middleware';
import { securityService } from '@/lib/services/security-service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies with explicit method implementations
vi.mock('@/lib/supabase-middleware', () => ({
  createClient: vi.fn()
}));

vi.mock('@/lib/services/security-service', () => ({
  securityService: {
    getClientIP: vi.fn(),
    logSecurityEvent: vi.fn(),
    validateIPAddress: vi.fn(),
    checkRateLimit: vi.fn(),
    validateSession: vi.fn(),
    isIPWhitelisted: vi.fn(),
    detectSuspiciousActivity: vi.fn(),
    triggerSecurityAlert: vi.fn(),
    getUserSecurityEvents: vi.fn(),
    incrementRateLimit: vi.fn(),
  }
}));

const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
const mockSecurityService = securityService as unknown as {
  getClientIP: ReturnType<typeof vi.fn>;
  logSecurityEvent: ReturnType<typeof vi.fn>;
  validateIPAddress: ReturnType<typeof vi.fn>;
  checkRateLimit: ReturnType<typeof vi.fn>;
  validateSession: ReturnType<typeof vi.fn>;
  isIPWhitelisted: ReturnType<typeof vi.fn>;
  detectSuspiciousActivity: ReturnType<typeof vi.fn>;
  triggerSecurityAlert: ReturnType<typeof vi.fn>;
  getUserSecurityEvents: ReturnType<typeof vi.fn>;
  incrementRateLimit: ReturnType<typeof vi.fn>;
};

// Helper to create mock request with proper Headers
function createMockRequest(url: string, options: { headers?: Record<string, string> } = {}): NextRequest {
  const headers = new Headers({
    'user-agent': 'test-agent',
    'x-forwarded-for': '127.0.0.1',
    ...options.headers
  });

  return new NextRequest(url, {
    method: 'GET',
    headers
  });
}

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);
    mockSecurityService.getClientIP.mockReturnValue('127.0.0.1');
    mockSecurityService.logSecurityEvent.mockResolvedValue(undefined);
    mockSecurityService.detectSuspiciousActivity.mockResolvedValue(null);
    mockSecurityService.triggerSecurityAlert.mockResolvedValue(undefined);
    mockSecurityService.getUserSecurityEvents.mockResolvedValue([]);
    mockSecurityService.incrementRateLimit.mockResolvedValue(undefined);
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
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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
      
      // Check the response is successful (status 200)
      expect(response.status).toBe(200);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'login',
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        details: {
          action: 'route_access_attempt',
          path: '/dashboard',
          method: 'GET'
        }
      });
    });

    it('should redirect unauthenticated users from /admin to login', async () => {
      // Unauthenticated users are now redirected from /admin
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const request = createMockRequest('https://example.com/admin');
      const response = await middleware(request);
      
      // Expect a redirect to the login page
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/login');
    });

    it('should deny access to staff routes for customer users', async () => {
      const request = createMockRequest('https://example.com/staff');
      const response = await middleware(request);
      
      // Should redirect since CUSTOMER role is not in STAFF required roles
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard'); // Customer redirect
    });
  });

  describe('Admin Routes - Enhanced Security (Protected Admin Routes Only)', () => {
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
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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

    it('should allow access to protected admin routes for admin users', async () => {
      // Mock the rate limit check that admin routes use
      mockSecurityService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetTime: new Date(Date.now() + 300000),
      });
      
      // Set up the admin session and user data
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: {
          role: 'ADMIN',
          mfa_enabled: true
        }
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'admin-token', user: adminUser } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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
      
      const request = createMockRequest('https://example.com/admin/protected');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('x-admin-session')).toBe('verified');
      expect(response.headers.get('x-security-level')).toBe('admin');
      expect(response.headers.get('x-rate-limit-remaining')).toBe('5');
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
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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
      
      expect(response.status).toBe(200);
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
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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
      
      expect(response.status).toBe(200);
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
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
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