import { supabase } from '@/lib/supabase'
import { securityService } from './security-service'
import type { User, Session, Provider } from '@supabase/supabase-js'

export type SocialProvider = 'google' | 'facebook' | 'github' | 'apple'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  marketingConsent?: boolean
}

export interface AuthResult {
  user?: User
  session?: Session
  error?: string
  requiresMFA?: boolean
  requiresEmailVerification?: boolean
}

export interface MFASetupResult {
  secret: string
  qrCode: string
  backupCodes: string[]
  error?: string
}

export interface AdminSession {
  id: string
  userId: string
  sessionToken: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface SocialProviderConfig {
  google: {
    clientId: string
    scopes: string[]
    redirectUri: string
  }
  facebook: {
    appId: string
    version: string
    scopes: string[]
  }
  github: {
    clientId: string
    scopes: string[]
  }
  apple: {
    clientId: string
    teamId: string
    keyId: string
  }
}

/**
 * Professional Authentication Service
 * 
 * Provides comprehensive authentication functionality including:
 * - Standard email/password authentication
 * - Social authentication (Google, Facebook, GitHub, Apple)
 * - Multi-factor authentication
 * - Admin security features
 * - Session management
 * - Security monitoring
 */
export class AuthenticationService {
  private supabase = supabase
  private securityService = securityService

  // ==========================================
  // Standard Authentication Methods
  // ==========================================

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials, metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    try {
      const { email, password, rememberMe = false } = credentials
      
      // Check rate limiting
      const rateLimitResult = await this.securityService.checkRateLimit(email, 'login')
      if (!rateLimitResult.allowed) {
        return { error: 'Too many login attempts. Please try again later.' }
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Increment rate limit on failed attempt
        await this.securityService.incrementRateLimit(email, 'login')
        
        // Log failed login attempt
        await this.securityService.logSecurityEvent({
          type: 'failed_login',
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { email, error: error.message }
        })

        return { error: error.message }
      }

      if (data.user && data.session) {
        // Log successful login
        await this.securityService.logSecurityEvent({
          type: 'login',
          userId: data.user.id,
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { email, rememberMe }
        })

        // Check if MFA is required
        const userMetadata = data.user.user_metadata
        if (userMetadata?.mfa_enabled && userMetadata?.role === 'ADMIN') {
          return {
            user: data.user,
            session: data.session,
            requiresMFA: true
          }
        }

        return {
          user: data.user,
          session: data.session
        }
      }

      return { error: 'Authentication failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred during sign in' }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(userData: RegisterData, metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    try {
      const { email, password, firstName, lastName, phone, marketingConsent = false } = userData

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            role: 'CUSTOMER',
            marketing_consent: marketingConsent,
            mfa_enabled: false,
            social_providers: []
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Log registration
        await this.securityService.logSecurityEvent({
          type: 'login',
          userId: data.user.id,
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { action: 'registration', email }
        })

        return {
          user: data.user,
          session: data.session || undefined,
          requiresEmailVerification: !data.user.email_confirmed_at
        }
      }

      return { error: 'Registration failed' }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred during registration' }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(metadata?: { ip?: string; userAgent?: string }): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      await this.supabase.auth.signOut()

      if (user) {
        await this.securityService.logSecurityEvent({
          type: 'logout',
          userId: user.id,
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, metadata?: { ip?: string; userAgent?: string }): Promise<{ error?: string }> {
    try {
      // Check rate limiting
      const rateLimitResult = await this.securityService.checkRateLimit(email, 'password_reset')
      if (!rateLimitResult.allowed) {
        return { error: 'Too many password reset attempts. Please try again later.' }
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      // Increment rate limit
      await this.securityService.incrementRateLimit(email, 'password_reset')

      // Log password reset request
      await this.securityService.logSecurityEvent({
        type: 'login',
        ip: metadata?.ip || 'unknown',
        userAgent: metadata?.userAgent || 'unknown',
        timestamp: new Date(),
        details: { action: 'password_reset_request', email }
      })

      return {}
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Failed to send password reset email' }
    }
  }

  // ==========================================
  // Social Authentication Methods
  // ==========================================

  /**
   * Sign in with social provider
   */
  async signInWithProvider(provider: SocialProvider, metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?provider=${provider}`,
          scopes: this.getScopesForProvider(provider),
          queryParams: metadata ? { 
            ip: metadata.ip,
            user_agent: metadata.userAgent 
          } : undefined
        }
      })

      if (error) {
        await this.securityService.logSecurityEvent({
          type: 'failed_login',
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { provider, error: error.message }
        })
        return { error: error.message }
      }

      // OAuth will redirect, success will be handled in callback
      return {}
    } catch (error) {
      console.error(`${provider} sign in error:`, error)
      return { error: `Failed to sign in with ${provider}` }
    }
  }

  /**
   * Google OAuth sign in
   */
  async signInWithGoogle(metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    return this.signInWithProvider('google', metadata)
  }

  /**
   * Facebook OAuth sign in
   */
  async signInWithFacebook(metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    return this.signInWithProvider('facebook', metadata)
  }

  /**
   * GitHub OAuth sign in
   */
  async signInWithGitHub(metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    return this.signInWithProvider('github', metadata)
  }

  /**
   * Apple Sign-In
   */
  async signInWithApple(metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    return this.signInWithProvider('apple', metadata)
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider: SocialProvider, code: string, metadata?: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code)

      if (error) {
        await this.securityService.logSecurityEvent({
          type: 'failed_login',
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { provider, error: error.message, action: 'oauth_callback' }
        })
        return { error: error.message }
      }

      if (data.user && data.session) {
        // Update user metadata to include social provider
        const existingProviders = data.user.user_metadata?.social_providers || []
        if (!existingProviders.includes(provider)) {
          await this.supabase.auth.updateUser({
            data: {
              social_providers: [...existingProviders, provider]
            }
          })
        }

        // Log successful OAuth login
        await this.securityService.logSecurityEvent({
          type: 'login',
          userId: data.user.id,
          ip: metadata?.ip || 'unknown',
          userAgent: metadata?.userAgent || 'unknown',
          timestamp: new Date(),
          details: { provider, action: 'oauth_success' }
        })

        return {
          user: data.user,
          session: data.session
        }
      }

      return { error: 'OAuth authentication failed' }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return { error: 'Failed to process OAuth callback' }
    }
  }

  // ==========================================
  // Admin Security Methods
  // ==========================================

  /**
   * Validate admin access with enhanced security
   */
  async validateAdminAccess(userId: string, ipAddress: string, userAgent: string): Promise<boolean> {
    try {
      // Get user data
      const { data: user, error } = await this.supabase.auth.getUser()
      if (error || !user || user.user.id !== userId) {
        return false
      }

      // Check admin role
      if (user.user.user_metadata?.role !== 'ADMIN') {
        return false
      }

      // Validate IP whitelist for admin access
      const isIPAllowed = await this.securityService.validateIPAddress(ipAddress, [
        '192.168.1.0/24', // Local network
        '10.0.0.0/8',     // Private network
        '127.0.0.1'       // Localhost
      ])

      if (!isIPAllowed) {
        await this.securityService.logSecurityEvent({
          type: 'ip_blocked',
          userId,
          ip: ipAddress,
          userAgent,
          timestamp: new Date(),
          details: { action: 'admin_access_blocked' }
        })
        return false
      }

      // Check for suspicious activity
      const suspiciousActivity = await this.securityService.detectSuspiciousActivity({
        userId,
        ip: ipAddress
      })

      if (suspiciousActivity) {
        await this.securityService.triggerSecurityAlert(suspiciousActivity)
        return false
      }

      return true
    } catch (error) {
      console.error('Admin access validation error:', error)
      return false
    }
  }

  /**
   * Create admin session with enhanced security
   */
  async createAdminSession(userId: string, ipAddress: string, userAgent: string): Promise<AdminSession | null> {
    try {
      // Validate admin access first
      const hasAccess = await this.validateAdminAccess(userId, ipAddress, userAgent)
      if (!hasAccess) {
        return null
      }

      const adminSession: AdminSession = {
        id: crypto.randomUUID(),
        userId,
        sessionToken: crypto.randomUUID(),
        ipAddress,
        userAgent,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        isActive: true
      }

      // Store in database
      await this.supabase
        .from('admin_sessions')
        .insert(adminSession)

      await this.securityService.logSecurityEvent({
        type: 'admin_access',
        userId,
        ip: ipAddress,
        userAgent,
        timestamp: new Date(),
        details: { action: 'admin_session_created' }
      })

      return adminSession
    } catch (error) {
      console.error('Create admin session error:', error)
      return null
    }
  }

  /**
   * Validate admin session
   */
  async validateAdminSession(sessionToken: string): Promise<boolean> {
    try {
      const { data: session } = await this.supabase
        .from('admin_sessions')
        .select('*')
        .eq('sessionToken', sessionToken)
        .eq('isActive', true)
        .single()

      if (!session) {
        return false
      }

      if (new Date(session.expiresAt) < new Date()) {
        // Expire the session
        await this.supabase
          .from('admin_sessions')
          .update({ isActive: false })
          .eq('sessionToken', sessionToken)
        
        return false
      }

      return true
    } catch (error) {
      console.error('Admin session validation error:', error)
      return false
    }
  }

  // ==========================================
  // Multi-Factor Authentication Methods
  // ==========================================

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: string): Promise<MFASetupResult> {
    try {
      // Generate TOTP secret
      const secret = this.generateTOTPSecret()
      const qrCode = this.generateQRCode(userId, secret)
      const backupCodes = this.generateBackupCodes()

      // Update user metadata
      const { error } = await this.supabase.auth.updateUser({
        data: {
          mfa_enabled: true,
          mfa_secret: secret,
          backup_codes: backupCodes
        }
      })

      if (error) {
        return { secret: '', qrCode: '', backupCodes: [], error: error.message }
      }

      await this.securityService.logSecurityEvent({
        type: 'mfa_enabled',
        userId,
        ip: 'unknown',
        userAgent: 'unknown',
        timestamp: new Date()
      })

      return { secret, qrCode, backupCodes }
    } catch (error) {
      console.error('Enable MFA error:', error)
      return { secret: '', qrCode: '', backupCodes: [], error: 'Failed to enable MFA' }
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you'd verify the TOTP code
      // For now, simulate verification
      const isValid = code.length === 6 && /^\d+$/.test(code)
      
      if (isValid) {
        await this.securityService.logSecurityEvent({
          type: 'login',
          userId,
          ip: 'unknown',
          userAgent: 'unknown',
          timestamp: new Date(),
          details: { action: 'mfa_verified' }
        })
      }

      return { success: isValid, error: isValid ? undefined : 'Invalid MFA code' }
    } catch (error) {
      console.error('Verify MFA error:', error)
      return { success: false, error: 'Failed to verify MFA code' }
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private getScopesForProvider(provider: SocialProvider): string {
    const scopes = {
      google: 'openid profile email',
      facebook: 'email public_profile',
      github: 'user:email read:user',
      apple: 'name email'
    }
    return scopes[provider] || ''
  }

  private generateTOTPSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  private generateQRCode(userId: string, secret: string): string {
    const issuer = 'Omaima'
    const label = `${issuer}:${userId}`
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
  }

  private generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 10; i++) {
      let code = ''
      for (let j = 0; j < 8; j++) {
        code += Math.floor(Math.random() * 10)
      }
      codes.push(code)
    }
    return codes
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      return error ? null : user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      return error ? null : session
    } catch (error) {
      console.error('Get current session error:', error)
      return null
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      return { session: data.session, error: error?.message }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { session: null, error: 'Failed to refresh session' }
    }
  }
}

// Export singleton instance
export const authService = new AuthenticationService()
export default authService