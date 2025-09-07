import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SecurityService } from '@/lib/services/security-service'
import { createClient } from '@/lib/supabase-middleware'

vi.mock('@/lib/supabase-middleware');

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123',
  }
});

describe('SecurityService', () => {
  let securityService: SecurityService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      auth: {
        getSession: vi.fn(),
        signOut: vi.fn(),
      },
    };
    (createClient as vi.Mock).mockReturnValue(mockSupabase);
    securityService = new SecurityService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('IP Validation', () => {
    it('should allow localhost IPs in development', async () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development';
      
      const isAllowed = await securityService.validateIPAddress('127.0.0.1')
      expect(isAllowed).toBe(true)

      process.env.NODE_ENV = originalNodeEnv;
    })

    it('should allow private network IPs in development', async () => {
        const originalNodeEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'development';

        const isAllowed = await securityService.validateIPAddress('192.168.1.100')
        expect(isAllowed).toBe(true)

        process.env.NODE_ENV = originalNodeEnv;
    })

    it('should validate against custom IP ranges', async () => {
      const allowedRanges = ['192.168.1.0/24', '10.0.0.0/8']
      
      const isAllowed = await securityService.validateIPAddress('192.168.1.50', allowedRanges)
      expect(isAllowed).toBe(true)
      
      const isNotAllowed = await securityService.validateIPAddress('203.0.113.1', allowedRanges)
      expect(isNotAllowed).toBe(false)
    })

    it('should handle IP validation errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database error')
      })

      const isAllowed = await securityService.validateIPAddress('127.0.0.1')
      expect(isAllowed).toBe(true)
    })

    it('should add IP to whitelist', async () => {
        mockSupabase.insert.mockResolvedValue({ error: null });
      const rule = {
        name: 'Office Network',
        cidr: '192.168.1.0/24',
        description: 'Main office network',
        isActive: true
      }

      const result = await securityService.addIPToWhitelist(rule as any)
      expect(result.success).toBe(true)
    })

    it('should remove IP from whitelist', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });
      const result = await securityService.removeIPFromWhitelist('rule-id-123')
      expect(result.success).toBe(true)
    })
  })

  describe('Session Management', () => {
    it('should create secure session', async () => {
      const sessionMetadata = {
        userAgent: 'Mozilla/5.0 (Test Browser)',
        ip: '127.0.0.1',
      }
      mockSupabase.single.mockResolvedValue({ data: { id: 'session-123' }, error: null });
      mockSupabase.insert.mockReturnValue(mockSupabase);


      const session = await securityService.createSecureSession('user-123', sessionMetadata)

      expect(session).toBeDefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('user_sessions');
    })

    it('should validate session successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123' },
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
          },
          error: null
        })

      const validation = await securityService.validateSession('valid-token')
      expect(validation.isValid).toBe(true)
      expect(validation.user).toBeDefined()
    })

    it('should detect expired session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123' },
              expires_at: Math.floor(Date.now() / 1000) - 100 // Expired
            }
          },
          error: null
        })

      const validation = await securityService.validateSession('expired-token')
      expect(validation.needsRefresh).toBe(true)
    })

    it('should terminate all user sessions', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });
      await securityService.terminateAllUserSessions('user-123')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_sessions')
      expect(mockSupabase.update).toHaveBeenCalledWith({ isActive: false })
      expect(mockSupabase.eq).toHaveBeenCalledWith('userId', 'user-123');
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = await securityService.checkRateLimit('user-123', 'login')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should block requests exceeding rate limit', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        timestamp: Date.now()
      }))
      
      const result = await securityService.checkRateLimit('user-123', 'login')
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Rate limit exceeded')
    })

    it('should reset rate limit after window expires', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        timestamp: Date.now() - (16 * 60 * 1000)
      }))
      
      const result = await securityService.checkRateLimit('user-123', 'login')
      expect(result.allowed).toBe(true)
    })

    it('should increment rate limit counter', async () => {
      await securityService.incrementRateLimit('user-123', 'login')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should handle rate limit errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const result = await securityService.checkRateLimit('user-123', 'login')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Security Event Logging', () => {
    it('should log security event', async () => {
        mockSupabase.insert.mockResolvedValue({ error: null });
      const event = {
        type: 'login' as const,
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        details: { action: 'successful_login' }
      }

      await securityService.logSecurityEvent(event)
      expect(mockSupabase.from).toHaveBeenCalledWith('security_events');
      expect(mockSupabase.insert).toHaveBeenCalled();
    })

    it('should handle logging errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => { throw new Error('DB Down')});

      const event = {
        type: 'login' as const,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      }
      await expect(securityService.logSecurityEvent(event)).resolves.toBeUndefined()
    })
  })

  describe('Suspicious Activity Detection', () => {
    it('should detect multiple failed logins', async () => {
      const mockEvents = Array(6).fill({
        type: 'failed_login',
        ip: '127.0.0.1',
        timestamp: new Date(),
        details: {}
      })
      const eqMock = vi.fn().mockResolvedValue({ data: mockEvents, error: null });
      mockSupabase.gte.mockReturnValue({ eq: eqMock });


      const alert = await securityService.detectSuspiciousActivity({
        ip: '127.0.0.1',
        timeWindow: 60 * 60 * 1000
      })

      expect(alert).toBeDefined()
      expect(alert?.type).toBe('multiple_failed_logins')
      expect(alert?.severity).toBe('high')
    })

    it('should detect brute force attacks', async () => {
      const mockEvents = Array(11).fill({
        type: 'failed_login',
        ip: '127.0.0.1',
        timestamp: new Date(),
        details: {}
      })
      const eqMock = vi.fn().mockResolvedValue({ data: mockEvents, error: null });
      mockSupabase.gte.mockReturnValue({ eq: eqMock });

      const alert = await securityService.detectSuspiciousActivity({
        ip: '127.0.0.1'
      })

      expect(alert).toBeDefined()
      expect(alert?.type).toBe('brute_force')
      expect(alert?.severity).toBe('critical')
    })

    it('should return null for normal activity', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: [], error: null });
      mockSupabase.gte.mockReturnValue({ eq: eqMock });

      const alert = await securityService.detectSuspiciousActivity({
        ip: '127.0.0.1'
      })

      expect(alert).toBeNull()
    })

    it('should trigger security alert', async () => {
        mockSupabase.insert.mockResolvedValue({ error: null });
      const alert = {
        id: 'alert-123',
        type: 'brute_force' as const,
        severity: 'critical' as const,
        ip: '127.0.0.1',
        details: { attempts: 10 },
        timestamp: new Date(),
        resolved: false
      }

      await securityService.triggerSecurityAlert(alert)
      expect(mockSupabase.from).toHaveBeenCalledWith('security_alerts')
      expect(mockSupabase.from).toHaveBeenCalledWith('security_events')
    })
  })

  describe('Utility Functions', () => {
    it('should extract client IP from request headers', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            const headers: Record<string, string> = {
              'x-forwarded-for': '203.0.113.1, 192.168.1.1',
            }
            return headers[header]
          })
        }
      } as any

      const ip = securityService.getClientIP(mockRequest)
      expect(ip).toBe('203.0.113.1')
    })

    it('should generate device fingerprint', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      const additionalData = { screen: '1920x1080', timezone: 'UTC' }
      
      const fingerprint = securityService.generateDeviceFingerprint(userAgent, additionalData)
      expect(fingerprint).toBeDefined()
      expect(fingerprint).toHaveLength(32)
    })

    it('should get user security events', async () => {
      const mockEvents = [
        { type: 'login', userId: 'user-123', timestamp: new Date() },
        { type: 'logout', userId: 'user-123', timestamp: new Date() }
      ]
      mockSupabase.limit.mockResolvedValue({ data: mockEvents, error: null });

      const events = await securityService.getUserSecurityEvents('user-123')
      expect(events).toHaveLength(2)
      expect(mockSupabase.from).toHaveBeenCalledWith('security_events');
    })
  })

  describe('IP Range Validation', () => {
    it('should validate IPv4 CIDR ranges correctly', async () => {
      mockSupabase.eq.mockResolvedValue({data: [{ cidr: '192.168.1.0/24' }]});
      
      expect(await securityService.isIPWhitelisted('192.168.1.1')).toBe(true)
      expect(await securityService.isIPWhitelisted('192.168.1.254')).toBe(true)
      
      mockSupabase.eq.mockResolvedValue({data: [{ cidr: '192.168.1.0/24' }]});
      expect(await securityService.isIPWhitelisted('192.168.2.1')).toBe(false)
    })

    it('should handle exact IP matches', async () => {
        mockSupabase.eq.mockResolvedValue({data: [{ cidr: '203.0.113.1' }, { cidr: '198.51.100.1' }]});
      
      expect(await securityService.isIPWhitelisted('203.0.113.1')).toBe(true)
      expect(await securityService.isIPWhitelisted('203.0.113.2')).toBe(false)
    })
  })
})
