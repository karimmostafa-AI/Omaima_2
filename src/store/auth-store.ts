import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Provider } from '@supabase/supabase-js'
import type { SecurityEvent } from '@/types'

type SocialProvider = 'google' | 'facebook' | 'github' | 'apple'
type SecurityLevel = 'basic' | 'enhanced' | 'admin'

interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN'
  emailVerified: boolean
  mfaEnabled?: boolean
  lastActivity?: Date
  ipAddress?: string
  socialProviders?: SocialProvider[]
}

interface AdminSession {
  id: string
  userId: string
  sessionToken: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

interface LinkedAccount {
  provider: SocialProvider
  providerId: string
  email: string
  connectedAt: Date
}

interface AuthResult {
  user?: AuthUser
  session?: Session
  error?: string
  requiresMFA?: boolean
}

interface MFASetupResult {
  secret: string
  qrCode: string
  backupCodes: string[]
  error?: string
}

interface AuthStore {
  // User State
  user: AuthUser | null
  session: Session | null
  profile: any | null
  permissions: string[]
  loading: boolean
  
  // Security State
  securityLevel: SecurityLevel
  mfaEnabled: boolean
  lastActivity: Date | null
  ipAddress: string | null
  
  // Social Authentication State
  socialProviders: SocialProvider[]
  linkedAccounts: LinkedAccount[]
  
  // Admin Security State
  adminSession: AdminSession | null
  adminPermissions: string[]
  
  // Basic Actions
  setUser: (user: AuthUser | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setSecurityLevel: (level: SecurityLevel) => void
  
  // Authentication Actions
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: string }>
  
  // Social Authentication Actions
  signInWithProvider: (provider: SocialProvider) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInWithFacebook: () => Promise<AuthResult>
  signInWithGitHub: () => Promise<AuthResult>
  signInWithApple: () => Promise<AuthResult>
  linkSocialAccount: (provider: SocialProvider) => Promise<{ error?: string }>
  unlinkSocialAccount: (provider: SocialProvider) => Promise<{ error?: string }>
  
  // Admin Security Actions
  validateAdminAccess: () => Promise<boolean>
  createAdminSession: (ipAddress: string, userAgent: string) => Promise<AdminSession | null>
  validateAdminSession: (sessionToken: string) => Promise<boolean>
  terminateAdminSession: () => Promise<void>
  
  // Multi-Factor Authentication
  enableMFA: () => Promise<MFASetupResult>
  disableMFA: (code: string) => Promise<{ error?: string }>
  verifyMFA: (code: string) => Promise<{ success: boolean; error?: string }>
  generateBackupCodes: () => Promise<{ codes: string[]; error?: string }>
  
  // Security Monitoring
  logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp' | 'id'>) => Promise<void>
  getSecurityEvents: () => Promise<SecurityEvent[]>
  checkSuspiciousActivity: () => Promise<{ suspicious: boolean; details?: string }>
  
  // Session Management
  refreshSession: () => Promise<void>
  validateSession: () => Promise<boolean>
  updateLastActivity: () => void
  
  // Utility Functions
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  getFullName: () => string
  getInitials: () => string
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      permissions: [],
      loading: false,
      
      // Security State
      securityLevel: 'basic' as SecurityLevel,
      mfaEnabled: false,
      lastActivity: null,
      ipAddress: null,
      
      // Social Authentication State
      socialProviders: [],
      linkedAccounts: [],
      
      // Admin Security State
      adminSession: null,
      adminPermissions: [],

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setSecurityLevel: (level) => set({ securityLevel: level }),

      signIn: async (email, password) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            get().logSecurityEvent({
              type: 'failed_login',
              ip: get().ipAddress || 'unknown',
              userAgent: navigator.userAgent,
              details: { email, error: error.message }
            })
            return { error: error.message }
          }

          if (data.user && data.session) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata?.first_name,
              lastName: data.user.user_metadata?.last_name,
              avatarUrl: data.user.user_metadata?.avatar_url,
              role: data.user.user_metadata?.role || 'CUSTOMER',
              emailVerified: !!data.user.email_confirmed_at,
              mfaEnabled: data.user.user_metadata?.mfa_enabled || false,
              lastActivity: new Date(),
              socialProviders: data.user.user_metadata?.social_providers || []
            }
            
            set({ 
              user: authUser, 
              session: data.session,
              lastActivity: new Date()
            })
            
            get().logSecurityEvent({
              type: 'login',
              userId: authUser.id,
              ip: get().ipAddress || 'unknown',
              userAgent: navigator.userAgent
            })
            
            // Check if MFA is required for admin users
            if (authUser.role === 'ADMIN' && !authUser.mfaEnabled) {
              return { user: authUser, session: data.session, requiresMFA: true }
            }
            
            return { user: authUser, session: data.session }
          }

          return { error: 'Authentication failed' }
        } catch (error) {
          console.error('Sign in error:', error)
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email, password, metadata = {}) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'CUSTOMER',
                mfa_enabled: false,
                social_providers: [],
                ...metadata,
              },
            },
          })

          if (error) {
            return { error: error.message }
          }

          get().logSecurityEvent({
            type: 'login',
            userId: data.user?.id,
            ip: get().ipAddress || 'unknown',
            userAgent: navigator.userAgent,
            details: { action: 'signup', email }
          })

          if (data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata?.first_name,
              lastName: data.user.user_metadata?.last_name,
              avatarUrl: data.user.user_metadata?.avatar_url,
              role: data.user.user_metadata?.role || 'CUSTOMER',
              emailVerified: !!data.user.email_confirmed_at,
              mfaEnabled: false,
              socialProviders: []
            }
            
            return { user: authUser, session: data.session || undefined }
          }

          return {}
        } catch (error) {
          console.error('Sign up error:', error)
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          const currentUser = get().user
          await supabase.auth.signOut()
          
          if (currentUser) {
            get().logSecurityEvent({
              type: 'logout',
              userId: currentUser.id,
              ip: get().ipAddress || 'unknown',
              userAgent: navigator.userAgent
            })
          }
          
          // Clear all authentication state
          set({ 
            user: null, 
            session: null,
            profile: null,
            permissions: [],
            securityLevel: 'basic',
            mfaEnabled: false,
            lastActivity: null,
            socialProviders: [],
            linkedAccounts: [],
            adminSession: null,
            adminPermissions: []
          })
        } catch (error) {
          console.error('Error signing out:', error)
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })

          if (error) {
            return { error: error.message }
          }

          get().logSecurityEvent({
            type: 'login',
            ip: get().ipAddress || 'unknown',
            userAgent: navigator.userAgent,
            details: { action: 'password_reset_request', email }
          })

          return {}
        } catch (error) {
          console.error('Reset password error:', error)
          return { error: 'An unexpected error occurred' }
        }
      },

      updatePassword: async (password) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password,
          })

          if (error) {
            return { error: error.message }
          }

          const currentUser = get().user
          if (currentUser) {
            get().logSecurityEvent({
              type: 'login',
              userId: currentUser.id,
              ip: get().ipAddress || 'unknown',
              userAgent: navigator.userAgent,
              details: { action: 'password_update' }
            })
          }

          return {}
        } catch (error) {
          console.error('Update password error:', error)
          return { error: 'An unexpected error occurred' }
        }
      },

      updateProfile: async (updates) => {
        try {
          const { error } = await supabase.auth.updateUser({
            data: updates,
          })

          if (error) {
            return { error: error.message }
          }

          // Update local user state
          const currentUser = get().user
          if (currentUser) {
            set({ 
              user: { ...currentUser, ...updates } 
            })
          }

          return {}
        } catch (error) {
          console.error('Update profile error:', error)
          return { error: 'An unexpected error occurred' }
        }
      },

      // Social Authentication Methods
      signInWithProvider: async (provider: SocialProvider) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback?provider=${provider}`,
              scopes: getScopesForProvider(provider)
            }
          })

          if (error) {
            get().logSecurityEvent({
              type: 'failed_login',
              ip: get().ipAddress || 'unknown',
              userAgent: navigator.userAgent,
              details: { provider, error: error.message }
            })
            return { error: error.message }
          }

          // OAuth will redirect, so we'll handle success in the callback
          return {}
        } catch (error) {
          console.error(`${provider} sign in error:`, error)
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ loading: false })
        }
      },

      signInWithGoogle: async () => get().signInWithProvider('google'),
      signInWithFacebook: async () => get().signInWithProvider('facebook'),
      signInWithGitHub: async () => get().signInWithProvider('github'),
      signInWithApple: async () => get().signInWithProvider('apple'),

      linkSocialAccount: async (provider: SocialProvider) => {
        try {
          const { error } = await supabase.auth.linkIdentity({
            provider: provider as Provider
          })

          if (error) {
            return { error: error.message }
          }

          // Update linked accounts
          const currentAccounts = get().linkedAccounts
          const newAccount: LinkedAccount = {
            provider,
            providerId: '', // Will be updated from auth state change
            email: get().user?.email || '',
            connectedAt: new Date()
          }
          
          set({ linkedAccounts: [...currentAccounts, newAccount] })
          
          return {}
        } catch (error) {
          console.error(`Link ${provider} account error:`, error)
          return { error: 'An unexpected error occurred' }
        }
      },

      unlinkSocialAccount: async (provider: SocialProvider) => {
        try {
          // Note: unlinkIdentity requires the identity object, not just provider
          // This is a simplified implementation - in production, you'd need to
          // get the specific identity first using getUser() and find the matching identity
          const { data: { user } } = await supabase.auth.getUser()
          if (!user?.identities) {
            return { error: 'No user identities found' }
          }

          const identity = user.identities.find(id => id.provider === provider)
          if (!identity) {
            return { error: `No ${provider} identity found` }
          }

          const { error } = await supabase.auth.unlinkIdentity(identity)

          if (error) {
            return { error: error.message }
          }

          // Update linked accounts
          const currentAccounts = get().linkedAccounts
          set({ 
            linkedAccounts: currentAccounts.filter(acc => acc.provider !== provider) 
          })
          
          return {}
        } catch (error) {
          console.error(`Unlink ${provider} account error:`, error)
          return { error: 'An unexpected error occurred' }
        }
      },

      // Admin Security Methods
      validateAdminAccess: async () => {
        const user = get().user
        if (!user || user.role !== 'ADMIN') {
          return false
        }

        // Check if admin session is valid
        const adminSession = get().adminSession
        if (!adminSession || adminSession.expiresAt < new Date()) {
          return false
        }

        return true
      },

      createAdminSession: async (ipAddress: string, userAgent: string) => {
        const user = get().user
        if (!user || user.role !== 'ADMIN') {
          return null
        }

        try {
          const adminSession: AdminSession = {
            id: crypto.randomUUID(),
            userId: user.id,
            sessionToken: crypto.randomUUID(),
            ipAddress,
            userAgent,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            isActive: true
          }

          set({ adminSession })
          
          get().logSecurityEvent({
            type: 'admin_access',
            userId: user.id,
            ip: ipAddress,
            userAgent,
            details: { action: 'admin_session_created' }
          })

          return adminSession
        } catch (error) {
          console.error('Create admin session error:', error)
          return null
        }
      },

      validateAdminSession: async (sessionToken: string) => {
        const adminSession = get().adminSession
        if (!adminSession || adminSession.sessionToken !== sessionToken) {
          return false
        }

        if (adminSession.expiresAt < new Date()) {
          set({ adminSession: null })
          return false
        }

        return adminSession.isActive
      },

      terminateAdminSession: async () => {
        const adminSession = get().adminSession
        if (adminSession) {
          get().logSecurityEvent({
            type: 'admin_access',
            userId: adminSession.userId,
            ip: adminSession.ipAddress,
            userAgent: adminSession.userAgent,
            details: { action: 'admin_session_terminated' }
          })
        }
        set({ adminSession: null })
      },

      // Multi-Factor Authentication
      enableMFA: async () => {
        const user = get().user
        if (!user) {
          return { secret: '', qrCode: '', backupCodes: [], error: 'No user logged in' }
        }

        try {
          // Generate TOTP secret
          const secret = generateTOTPSecret()
          const qrCode = generateQRCode(user.email, secret)
          const backupCodes = generateBackupCodes()

          // Update user metadata
          const { error } = await supabase.auth.updateUser({
            data: {
              mfa_enabled: true,
              mfa_secret: secret,
              backup_codes: backupCodes
            }
          })

          if (error) {
            return { secret: '', qrCode: '', backupCodes: [], error: error.message }
          }

          set({ mfaEnabled: true })
          
          get().logSecurityEvent({
            type: 'mfa_enabled',
            userId: user.id,
            ip: get().ipAddress || 'unknown',
            userAgent: navigator.userAgent
          })

          return { secret, qrCode, backupCodes }
        } catch (error) {
          console.error('Enable MFA error:', error)
          return { secret: '', qrCode: '', backupCodes: [], error: 'Failed to enable MFA' }
        }
      },

      disableMFA: async (code: string) => {
        const user = get().user
        if (!user) {
          return { error: 'No user logged in' }
        }

        try {
          // Verify MFA code before disabling
          const isValid = await verifyTOTPCode(user.id, code)
          if (!isValid) {
            return { error: 'Invalid verification code' }
          }

          const { error } = await supabase.auth.updateUser({
            data: {
              mfa_enabled: false,
              mfa_secret: null,
              backup_codes: null
            }
          })

          if (error) {
            return { error: error.message }
          }

          set({ mfaEnabled: false })
          
          get().logSecurityEvent({
            type: 'login',
            userId: user.id,
            ip: get().ipAddress || 'unknown',
            userAgent: navigator.userAgent,
            details: { action: 'mfa_disabled' }
          })

          return {}
        } catch (error) {
          console.error('Disable MFA error:', error)
          return { error: 'Failed to disable MFA' }
        }
      },

      verifyMFA: async (code: string) => {
        const user = get().user
        if (!user) {
          return { success: false, error: 'No user logged in' }
        }

        try {
          const isValid = await verifyTOTPCode(user.id, code)
          return { success: isValid, error: isValid ? undefined : 'Invalid code' }
        } catch (error) {
          console.error('Verify MFA error:', error)
          return { success: false, error: 'Failed to verify code' }
        }
      },

      generateBackupCodes: async () => {
        const user = get().user
        if (!user) {
          return { codes: [], error: 'No user logged in' }
        }

        try {
          const backupCodes = generateBackupCodes()
          
          const { error } = await supabase.auth.updateUser({
            data: {
              backup_codes: backupCodes
            }
          })

          if (error) {
            return { codes: [], error: error.message }
          }

          return { codes: backupCodes }
        } catch (error) {
          console.error('Generate backup codes error:', error)
          return { codes: [], error: 'Failed to generate backup codes' }
        }
      },

      // Security Monitoring
      logSecurityEvent: async (event: Omit<SecurityEvent, 'timestamp' | 'id'>) => {
        try {
          const fullEvent: SecurityEvent = {
            id: crypto.randomUUID(), // Always generate an ID
            ...event,
            timestamp: new Date()
          }

          // Store in local storage for development
          const events = JSON.parse(localStorage.getItem('security_events') || '[]')
          events.push(fullEvent)
          localStorage.setItem('security_events', JSON.stringify(events.slice(-100))) // Keep last 100 events

          // In production, this would send to a security monitoring service
          console.log('Security Event:', fullEvent)
        } catch (error) {
          console.error('Failed to log security event:', error)
        }
      },

      getSecurityEvents: async () => {
        try {
          const events = JSON.parse(localStorage.getItem('security_events') || '[]')
          return events.map((event: any) => ({
            id: event.id || crypto.randomUUID(), // Ensure all events have an ID
            ...event,
            timestamp: new Date(event.timestamp)
          }))
        } catch (error) {
          console.error('Failed to get security events:', error)
          return []
        }
      },

      checkSuspiciousActivity: async () => {
        try {
          const events = await get().getSecurityEvents()
          const recentEvents = events.filter(
            event => event.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
          )

          const failedLogins = recentEvents.filter(event => event.type === 'failed_login')
          if (failedLogins.length > 5) {
            return { suspicious: true, details: 'Multiple failed login attempts detected' }
          }

          return { suspicious: false }
        } catch (error) {
          console.error('Failed to check suspicious activity:', error)
          return { suspicious: false }
        }
      },

      // Session Management
      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession()
          if (error) throw error
          
          if (data.session) {
            set({ session: data.session })
          }
        } catch (error) {
          console.error('Failed to refresh session:', error)
          await get().signOut()
        }
      },

      validateSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            await get().signOut()
            return false
          }
          
          set({ session })
          return true
        } catch (error) {
          console.error('Failed to validate session:', error)
          await get().signOut()
          return false
        }
      },

      updateLastActivity: () => {
        set({ lastActivity: new Date() })
      },

      // Utility Functions
      hasRole: (role: string) => {
        const user = get().user
        return user?.role === role
      },

      hasPermission: (permission: string) => {
        const permissions = get().permissions
        return permissions.includes(permission)
      },

      isAdmin: () => {
        return get().hasRole('ADMIN')
      },

      getFullName: () => {
        const user = get().user
        if (!user) return 'Anonymous'
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      },

      getInitials: () => {
        const user = get().user
        if (!user) return '?'
        
        const firstInitial = user.firstName?.[0]?.toUpperCase() || ''
        const lastInitial = user.lastName?.[0]?.toUpperCase() || ''
        
        if (firstInitial && lastInitial) {
          return `${firstInitial}${lastInitial}`
        }
        
        return user.email?.[0]?.toUpperCase() || '?'
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        securityLevel: state.securityLevel,
        mfaEnabled: state.mfaEnabled,
        socialProviders: state.socialProviders,
        linkedAccounts: state.linkedAccounts
      }),
    }
  )
)

// Helper functions for MFA and social auth
function getScopesForProvider(provider: SocialProvider): string {
  switch (provider) {
    case 'google':
      return 'openid profile email'
    case 'facebook':
      return 'email public_profile'
    case 'github':
      return 'user:email read:user'
    case 'apple':
      return 'name email'
    default:
      return ''
  }
}

function generateTOTPSecret(): string {
  // Generate a 32-character base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

function generateQRCode(email: string, secret: string): string {
  // Generate QR code data URL for TOTP
  const issuer = 'Omaima'
  const label = `${issuer}:${email}`
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
  
  // In a real implementation, you'd use a QR code library
  // For now, return the URL that would be encoded
  return otpauthUrl
}

function generateBackupCodes(): string[] {
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

async function verifyTOTPCode(userId: string, code: string): Promise<boolean> {
  // In a real implementation, you'd verify the TOTP code
  // For now, simulate verification
  return code.length === 6 && /^\d+$/.test(code)
}

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    const store = useAuthStore.getState()
    
    if (session?.user) {
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        firstName: session.user.user_metadata?.first_name,
        lastName: session.user.user_metadata?.last_name,
        avatarUrl: session.user.user_metadata?.avatar_url,
        role: session.user.user_metadata?.role || 'CUSTOMER',
        emailVerified: !!session.user.email_confirmed_at,
        mfaEnabled: session.user.user_metadata?.mfa_enabled || false,
        socialProviders: session.user.user_metadata?.social_providers || []
      }
      
      store.setUser(authUser)
      store.setSession(session)
      
      // Update IP address if available
      fetch('/api/auth/get-ip')
        .then(res => res.json())
        .then(data => {
          useAuthStore.setState({ ipAddress: data.ip })
        })
        .catch(() => {})
        
    } else {
      store.setUser(null)
      store.setSession(null)
    }
  })
}
