import { createClient } from '@supabase/supabase-js'

// Mock configuration for demonstration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Create Supabase client with mock fallback
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Mock authentication service for development
export class MockAuthService {
  private users = new Map([
    ['admin@omaima.com', { 
      id: 'admin-1', 
      email: 'admin@omaima.com', 
      password: 'admin123', 
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    }],
    ['user@omaima.com', { 
      id: 'user-1', 
      email: 'user@omaima.com', 
      password: 'user123', 
      role: 'CUSTOMER',
      firstName: 'Test',
      lastName: 'User'
    }]
  ])

  async signInWithPassword(email: string, password: string) {
    const user = this.users.get(email)
    if (user && user.password === password) {
      const session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          },
          email_confirmed_at: new Date().toISOString()
        }
      }
      return { data: { user: session.user, session }, error: null }
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
  }

  async signUp(email: string, password: string, options?: any) {
    const userId = `user-${Date.now()}`
    const user = {
      id: userId,
      email,
      password,
      role: options?.data?.role || 'CUSTOMER',
      firstName: options?.data?.first_name || '',
      lastName: options?.data?.last_name || ''
    }
    
    this.users.set(email, user)
    
    return {
      data: {
        user: {
          id: userId,
          email,
          user_metadata: options?.data || {},
          email_confirmed_at: new Date().toISOString()
        },
        session: null
      },
      error: null
    }
  }

  async signOut() {
    return { error: null }
  }

  async resetPasswordForEmail(email: string) {
    return { error: null }
  }

  async updateUser(updates: any) {
    return { error: null }
  }

  async getSession() {
    return { data: { session: null }, error: null }
  }

  async getUser() {
    return { data: { user: null }, error: null }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

// Use mock service if Supabase is not properly configured
const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')

export const authService = isMockMode ? new MockAuthService() : supabase.auth
export default supabase