import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-middleware'
import type { SecurityEvent } from '@/types'

interface SessionMetadata {
  userAgent: string
  ip: string
  deviceFingerprint?: string
  location?: {
    country?: string
    city?: string
  }
}

interface SessionValidation {
  isValid: boolean
  user?: any
  needsRefresh?: boolean
  error?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  error?: string
}

interface SecurityAlert {
  id: string
  type: 'multiple_failed_logins' | 'suspicious_ip' | 'unusual_location' | 'brute_force'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ip: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
}

interface IPWhitelistRule {
  id: string
  name: string
  cidr: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Security service for handling authentication security features
 */
export class SecurityService {
  private supabase = createClient()

  // ==========================================
  // IP Security Methods
  // ==========================================

  /**
   * Validate if an IP address is allowed based on whitelist rules
   */
  async validateIPAddress(ip: string, allowedRanges: string[] = []): Promise<boolean> {
    try {
      // For development, allow localhost and common development IPs
      if (process.env.NODE_ENV === 'development') {
        const devIPs = ['127.0.0.1', '::1', 'localhost']
        if (devIPs.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.')) {
          return true
        }
      }

      // Check against custom allowed ranges
      if (allowedRanges.length > 0) {
        return this.isIPInRanges(ip, allowedRanges)
      }

      // Check against database whitelist
      const { data: whitelistRules } = await this.supabase
        .from('ip_whitelist')
        .select('*')
        .eq('isActive', true)

      if (!whitelistRules || whitelistRules.length === 0) {
        // If no whitelist rules, allow all (default behavior)
        return true
      }

      const allowedCIDRs = whitelistRules.map(rule => rule.cidr)
      return this.isIPInRanges(ip, allowedCIDRs)

    } catch (error) {
      console.error('IP validation error:', error)
      // On error, be permissive but log the issue
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        ip,
        userAgent: 'unknown',
        details: { error: 'IP validation failed', message: error }
      })
      return true
    }
  }

  /**
   * Check if IP is in CIDR ranges
   */
  private isIPInRanges(ip: string, cidrs: string[]): boolean {
    // Simplified IP range checking - in production use proper CIDR library
    for (const cidr of cidrs) {
      if (cidr.includes('/')) {
        const [network, bits] = cidr.split('/')
        if (this.isIPInNetwork(ip, network, parseInt(bits))) {
          return true
        }
      } else if (ip === cidr) {
        return true
      }
    }
    return false
  }

  /**
   * Simple network check (IPv4 only for demo)
   */
  private isIPInNetwork(ip: string, network: string, bits: number): boolean {
    const ipNum = this.ipToNumber(ip)
    const networkNum = this.ipToNumber(network)
    const mask = -1 << (32 - bits)
    
    return (ipNum & mask) === (networkNum & mask)
  }

  /**
   * Convert IP to number for comparison
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
  }

  /**
   * Add IP to whitelist
   */
  async addIPToWhitelist(rule: Omit<IPWhitelistRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('ip_whitelist')
        .insert({
          ...rule,
          createdAt: new Date(),
          updatedAt: new Date()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Add IP whitelist error:', error)
      return { success: false, error: 'Failed to add IP to whitelist' }
    }
  }

  /**
   * Remove IP from whitelist
   */
  async removeIPFromWhitelist(ruleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('ip_whitelist')
        .delete()
        .eq('id', ruleId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Remove IP whitelist error:', error)
      return { success: false, error: 'Failed to remove IP from whitelist' }
    }
  }

  /**
   * Check if an IP address is whitelisted
   */
  async isIPWhitelisted(ip: string): Promise<boolean> {
    try {
      return await this.validateIPAddress(ip)
    } catch (error) {
      console.error('IP whitelist check error:', error)
      return false
    }
  }

  // ==========================================
  // Session Management Methods
  // ==========================================

  /**
   * Create a secure session with metadata
   */
  async createSecureSession(userId: string, metadata: SessionMetadata): Promise<any> {
    try {
      const sessionData = {
        userId,
        ...metadata,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
      }

      const { data, error } = await this.supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        throw error
      }

      await this.logSecurityEvent({
        type: 'login',
        userId,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        details: { action: 'session_created' }
      })

      return data
    } catch (error) {
      console.error('Create secure session error:', error)
      throw error
    }
  }

  /**
   * Validate session and return user data
   */
  async validateSession(sessionToken: string): Promise<SessionValidation> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error || !session) {
        return { isValid: false, error: 'Invalid session' }
      }

      // Check if session needs refresh
      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const needsRefresh = expiresAt.getTime() - now.getTime() < 5 * 60 * 1000 // 5 minutes

      return {
        isValid: true,
        user: session.user,
        needsRefresh
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return { isValid: false, error: 'Session validation failed' }
    }
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionToken: string): Promise<void> {
    try {
      await this.supabase.auth.signOut()
    } catch (error) {
      console.error('Terminate session error:', error)
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId: string): Promise<void> {
    try {
      // Update all user sessions as inactive
      await this.supabase
        .from('user_sessions')
        .update({ isActive: false })
        .eq('userId', userId)

      await this.logSecurityEvent({
        type: 'logout',
        userId,
        ip: 'system',
        userAgent: 'system',
        details: { action: 'all_sessions_terminated' }
      })
    } catch (error) {
      console.error('Terminate all sessions error:', error)
    }
  }

  // ==========================================
  // Rate Limiting Methods
  // ==========================================

  /**
   * Check rate limit for a specific action
   */
  async checkRateLimit(identifier: string, action: string): Promise<RateLimitResult> {
    try {
      const key = `${action}:${identifier}`
      const windowMs = this.getRateLimitWindow(action)
      const maxAttempts = this.getRateLimitMax(action)
      
      // Get current attempts from storage
      const attempts = await this.getRateLimitAttempts(key, windowMs)
      
      if (attempts >= maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(Date.now() + windowMs),
          error: 'Rate limit exceeded'
        }
      }

      return {
        allowed: true,
        remaining: maxAttempts - attempts - 1,
        resetTime: new Date(Date.now() + windowMs)
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: 1,
        resetTime: new Date(),
        error: 'Rate limit check failed'
      }
    }
  }

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(identifier: string, action: string): Promise<void> {
    try {
      const key = `${action}:${identifier}`
      const windowMs = this.getRateLimitWindow(action)
      
      await this.incrementRateLimitAttempts(key, windowMs)
    } catch (error) {
      console.error('Rate limit increment error:', error)
    }
  }

  private getRateLimitWindow(action: string): number {
    const windows = {
      'login': 15 * 60 * 1000, // 15 minutes
      'password_reset': 60 * 60 * 1000, // 1 hour
      'admin_access': 5 * 60 * 1000, // 5 minutes
      'api_call': 60 * 1000 // 1 minute
    }
    return windows[action as keyof typeof windows] || 60 * 1000
  }

  private getRateLimitMax(action: string): number {
    const limits = {
      'login': 5,
      'password_reset': 3,
      'admin_access': 10,
      'api_call': 100
    }
    return limits[action as keyof typeof limits] || 10
  }

  private async getRateLimitAttempts(key: string, windowMs: number): Promise<number> {
    // In a real implementation, use Redis or similar
    // For now, use localStorage with expiration (only in browser)
    if (typeof window === 'undefined') return 0
    
    const storageKey = `rate_limit_${key}`
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) return 0
    
    const data = JSON.parse(stored)
    if (Date.now() - data.timestamp > windowMs) {
      localStorage.removeItem(storageKey)
      return 0
    }
    
    return data.attempts
  }

  private async incrementRateLimitAttempts(key: string, windowMs: number): Promise<void> {
    // Only use localStorage in browser
    if (typeof window === 'undefined') return
    
    const storageKey = `rate_limit_${key}`
    const stored = localStorage.getItem(storageKey)
    
    let attempts = 1
    let timestamp = Date.now()
    
    if (stored) {
      const data = JSON.parse(stored)
      if (Date.now() - data.timestamp <= windowMs) {
        attempts = data.attempts + 1
        timestamp = data.timestamp
      }
    }
    
    localStorage.setItem(storageKey, JSON.stringify({ attempts, timestamp }))
  }

  // ==========================================
  // Security Monitoring Methods
  // ==========================================

  /**
   * Log security event to database/monitoring system
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'id'>): Promise<void> {
    try {
      const fullEvent: SecurityEvent = {
        id: crypto.randomUUID(), // Always generate an ID
        timestamp: new Date(),
        ...event
      }

      // Store in database
      await this.supabase
        .from('security_events')
        .insert(fullEvent)

      // Also store locally for development
      if (typeof window !== 'undefined') {
        const events = JSON.parse(localStorage.getItem('security_events') || '[]')
        events.push(fullEvent)
        localStorage.setItem('security_events', JSON.stringify(events.slice(-100)))
      }

      // In production, send to security monitoring service
      if (process.env.NODE_ENV === 'production') {
        // await sendToSecurityMonitoring(fullEvent)
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(params: { ip?: string; userId?: string; timeWindow?: number }): Promise<SecurityAlert | null> {
    try {
      const { ip, userId, timeWindow = 60 * 60 * 1000 } = params // Default 1 hour
      const since = new Date(Date.now() - timeWindow)

      let query = this.supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', since.toISOString())

      if (ip) {
        query = query.eq('ip', ip)
      }
      if (userId) {
        query = query.eq('userId', userId)
      }

      const { data: events } = await query

      if (!events || events.length === 0) {
        return null
      }

      // Check for multiple failed logins
      const failedLogins = events.filter(e => e.type === 'failed_login')
      if (failedLogins.length >= 5) {
        return {
          id: crypto.randomUUID(),
          type: 'multiple_failed_logins',
          severity: 'high',
          userId,
          ip: ip || failedLogins[0]?.ip,
          details: { attempts: failedLogins.length, window: timeWindow },
          timestamp: new Date(),
          resolved: false
        }
      }

      // Check for brute force patterns
      if (failedLogins.length >= 10) {
        return {
          id: crypto.randomUUID(),
          type: 'brute_force',
          severity: 'critical',
          userId,
          ip: ip || failedLogins[0]?.ip,
          details: { attempts: failedLogins.length, window: timeWindow },
          timestamp: new Date(),
          resolved: false
        }
      }

      return null
    } catch (error) {
      console.error('Suspicious activity detection error:', error)
      return null
    }
  }

  /**
   * Trigger security alert
   */
  async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Store alert in database
      await this.supabase
        .from('security_alerts')
        .insert(alert)

      // Log as security event
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        userId: alert.userId,
        ip: alert.ip,
        userAgent: 'system',
        details: { alert: alert.type, severity: alert.severity }
      })

      // In production, send notifications to security team
      if (process.env.NODE_ENV === 'production' && alert.severity === 'critical') {
        // await notifySecurityTeam(alert)
      }
    } catch (error) {
      console.error('Failed to trigger security alert:', error)
    }
  }

  /**
   * Get recent security events for a user
   */
  async getUserSecurityEvents(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data: events } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      return events || []
    } catch (error) {
      console.error('Get user security events error:', error)
      return []
    }
  }

  /**
   * Get client IP address from request
   */
  getClientIP(request: Request): string {
    // Check various headers for IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    return 'unknown'
  }

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint(userAgent: string, additionalData?: Record<string, any>): string {
    const data = {
      userAgent,
      ...additionalData,
      timestamp: Date.now()
    }
    
    // Create a hash of the device characteristics
    const dataString = JSON.stringify(data)
    return btoa(dataString).slice(0, 32)
  }
}

// Export singleton instance
export const securityService = new SecurityService()
export default securityService