import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SimpleUser {
  id: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
}

interface AuthStore {
  user: SimpleUser | null
  loading: boolean
  setUser: (user: SimpleUser | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      
      signOut: () => {
        set({ user: null })
      },
      
      isAdmin: () => {
        const user = get().user
        return user?.role === 'ADMIN'
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user
      }),
    }
  )
)

