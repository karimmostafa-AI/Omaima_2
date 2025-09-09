import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple MVP Auth Store
// For MVP, we only need basic auth state

export interface AppState {
  user: { id: string; email: string; name?: string; role: 'ADMIN' | 'CUSTOMER' } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            authError: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            authError: errorMessage,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, authError: null });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorMessage = Array.isArray(data.details) 
              ? data.details.join(', ') 
              : data.error || 'Registration failed';
            throw new Error(errorMessage);
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            authError: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            authError: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear the state completely
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authError: null,
          });
          
          // Force clear the persisted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('omaima-auth-storage');
            sessionStorage.removeItem('omaima-auth-storage');
          }
        }
      },

      refreshAuth: async () => {
        set({ isLoading: true, authError: null });

        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include', // Ensure cookies are included
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                authError: null,
              });
            } else {
              // Invalid response structure
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                authError: null,
              });
            }
          } else if (response.status === 401) {
            // Unauthorized - clear state and storage
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              authError: null,
            });
            
            // Clear persisted storage on unauthorized
            if (typeof window !== 'undefined') {
              localStorage.removeItem('omaima-auth-storage');
              sessionStorage.removeItem('omaima-auth-storage');
            }
          } else {
            // Other error status
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              authError: 'Authentication check failed',
            });
          }
        } catch (error) {
          console.error('Auth refresh error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authError: 'Network error during authentication',
          });
        }
      },
    }),
    {
      name: 'omaima-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for convenience
export const useAuth = () => useAppStore((state) => state);
