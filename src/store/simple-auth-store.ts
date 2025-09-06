import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'

interface SimpleUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN'
  emailVerified: boolean
}

interface SimpleAuthStore {
  user: SimpleUser | null
  loading: boolean
  
  // Basic Actions
  setUser: (user: SimpleUser | null) => void
  setLoading: (loading: boolean) => void
  
  // Authentication Actions
  signIn: (email: string, password: string) => Promise<{ user?: SimpleUser; error?: string }>
  signOut: () => Promise<void>
  
  // Utility Functions
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

export const useSimpleAuthStore = create<SimpleAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      signIn: async (email, password) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user && data.session) {
            const authUser: SimpleUser = {
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata?.first_name,
              lastName: data.user.user_metadata?.last_name,
              role: data.user.user_metadata?.role || 'CUSTOMER',
              emailVerified: !!data.user.email_confirmed_at,
            }
            
            set({ user: authUser })
            return { user: authUser }
          }

          return { error: 'Authentication failed' }
        } catch (error) {
          console.error('Sign in error:', error)
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          await supabase.auth.signOut()
          set({ user: null })
        } catch (error) {
          console.error('Sign out error:', error)
        } finally {
          set({ loading: false })
        }
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'ADMIN'
      },

      isAuthenticated: () => {
        const { user } = get()
        return !!user
      },
    }),
    {
      name: 'simple-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
