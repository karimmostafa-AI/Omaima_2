import { import { describe, it, expect, beforeEach, vi } from 'vitest' vi } from 'vitest'
import { SecurityService } from '@/lib/services/security-service'
import { createClient } from '@/lib/supabase-middleware'

// Mock Supabase client
vi.mock('@/lib/supabase-middleware', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      })),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }))
    }))
  }))
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123'
  }
})

describe('SecurityService', () => {
  let securityService: SecurityService

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
    securityService = new SecurityService()
  })

  describe('IP Validation', () => {
    it('should allow localhost IPs in development', async () => {
      process.env.NODE_ENV = 'development'
      
      const isAllowed = await securityService.validateIPAddress('127.0.0.1')
      expect(isAllowed).toBe(true)
    })

    it('should allow private network IPs in development', async () => {
      process.env.NODE_ENV = 'development'
      
      const isAllowed = await securityService.validateIPAddress('192.168.1.100')
      expect(isAllowed).toBe(true)
    })

    it('should validate against custom IP ranges', async () => {
      const allowedRanges = ['192.168.1.0/24', '10.0.0.0/8']
      
      const isAllowed = await securityService.validateIPAddress('192.168.1.50', allowedRanges)
      expect(isAllowed).toBe(true)
      
      const isNotAllowed = await securityService.validateIPAddress('203.0.113.1', allowedRanges)
      expect(isNotAllowed).toBe(false)
    })

    it('should handle IP validation errors gracefully', async () => {
      // Mock database error
      const mockSupabase = createClient() as any
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => {
            throw new Error('Database error')
          }
        })
      })

      const isAllowed = await securityService.validateIPAddress('127.0.0.1')
      expect(isAllowed).toBe(true) // Should be permissive on error
    })

    it('should add IP to whitelist', async () => {
      const rule = {
        name: 'Office Network',
        cidr: '192.168.1.0/24',
        description: 'Main office network',
        isActive: true
      }

      const result = await securityService.addIPToWhitelist(rule)
      expect(result.success).toBe(true)
    })

    it('should remove IP from whitelist', async () => {
      const result = await securityService.removeIPFromWhitelist('rule-id-123')
      expect(result.success).toBe(true)
    })
  })

  describe('Session Management', () => {
    it('should create secure session', async () => {
      const sessionMetadata = {
        userAgent: 'Mozilla/5.0 (Test Browser)',
        ip: '127.0.0.1',
        deviceFingerprint: 'test-fingerprint',
        location: { country: 'US', city: 'New York' }
      }

      const session = await securityService.createSecureSession('user-123', sessionMetadata)
      expect(session).toBeDefined()
    })

    it('should validate session successfully', async () => {
      // Mock valid session
      const mockSupabase = createClient() as any
      mockSupabase.auth = {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123' },
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
          },
          error: null
        })
      }

      const validation = await securityService.validateSession('valid-token')
      expect(validation.isValid).toBe(true)
      expect(validation.user).toBeDefined()
    })

    it('should detect expired session', async () => {
      // Mock expired session
      const mockSupabase = createClient() as any
      mockSupabase.auth = {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123' },
              expires_at: Math.floor(Date.now() / 1000) - 100 // Expired
            }
          },
          error: null
        })
      }

      const validation = await securityService.validateSession('expired-token')
      expect(validation.needsRefresh).toBe(true)
    })

    it('should terminate all user sessions', async () => {
      await securityService.terminateAllUserSessions('user-123')
      
      const mockSupabase = createClient() as any
      expect(mockSupabase.from).toHaveBeenCalledWith('user_sessions')
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
      // Mock rate limit data showing max attempts reached
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        timestamp: Date.now()
      }))
      
      const result = await securityService.checkRateLimit('user-123', 'login')
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Rate limit exceeded')
    })

    it('should reset rate limit after window expires', async () => {
      // Mock old rate limit data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        timestamp: Date.now() - (16 * 60 * 1000) // 16 minutes ago (expired)
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
      expect(result.allowed).toBe(true) // Should be permissive on error
    })
  })

  describe('Security Event Logging', () => {
    it('should log security event', async () => {
      const event = {
        type: 'login' as const,
        userId: 'user-123',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
        details: { action: 'successful_login' }
      }

      await securityService.logSecurityEvent(event)
      
      // Check that event was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'security_events',
        expect.stringContaining('login')
      )
    })

    it('should handle logging errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const event = {
        type: 'login' as const,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date()
      }

      // Should not throw error
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

      const mockSupabase = createClient() as any
      mockSupabase.from.mockReturnValue({
        select: () => ({
          gte: () => ({
            eq: () => ({ data: mockEvents })
          })
        })
      })

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

      const mockSupabase = createClient() as any
      mockSupabase.from.mockReturnValue({
        select: () => ({
          gte: () => ({
            eq: () => ({ data: mockEvents })
          })
        })
      })

      const alert = await securityService.detectSuspiciousActivity({
        ip: '127.0.0.1'
      })

      expect(alert).toBeDefined()
      expect(alert?.type).toBe('brute_force')
      expect(alert?.severity).toBe('critical')
    })

    it('should return null for normal activity', async () => {
      const mockSupabase = createClient() as any
      mockSupabase.from.mockReturnValue({
        select: () => ({
          gte: () => ({
            eq: () => ({ data: [] })
          })
        })
      })

      const alert = await securityService.detectSuspiciousActivity({
        ip: '127.0.0.1'
      })

      expect(alert).toBeNull()
    })

    it('should trigger security alert', async () => {
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
      
      const mockSupabase = createClient() as any
      expect(mockSupabase.from).toHaveBeenCalledWith('security_alerts')
    })
  })

  describe('Utility Functions', () => {
    it('should extract client IP from request headers', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            const headers: Record<string, string> = {
              'x-forwarded-for': '203.0.113.1, 192.168.1.1',
              'x-real-ip': '203.0.113.1',
              'cf-connecting-ip': '203.0.113.1'
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

      const mockSupabase = createClient() as any
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({ data: mockEvents })
            })
          })
        })
      })

      const events = await securityService.getUserSecurityEvents('user-123')
      expect(events).toHaveLength(2)
    })
  })

  describe('IP Range Validation', () => {
    it('should validate IPv4 CIDR ranges correctly', async () => {
      const allowedRanges = ['192.168.1.0/24']
      
      // Should allow IPs in range
      expect(await securityService.validateIPAddress('192.168.1.1', allowedRanges)).toBe(true)
      expect(await securityService.validateIPAddress('192.168.1.254', allowedRanges)).toBe(true)
      
      // Should reject IPs outside range
      expect(await securityService.validateIPAddress('192.168.2.1', allowedRanges)).toBe(false)
      expect(await securityService.validateIPAddress('10.0.0.1', allowedRanges)).toBe(false)
    })

    it('should handle exact IP matches', async () => {
      const allowedIPs = ['203.0.113.1', '198.51.100.1']
      
      expect(await securityService.validateIPAddress('203.0.113.1', allowedIPs)).toBe(true)
      expect(await securityService.validateIPAddress('203.0.113.2', allowedIPs)).toBe(false)
    })
  })
})"