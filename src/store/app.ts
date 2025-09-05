import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  User,
  Cart,
  CartItem,
  CustomGarmentConfig
} from '@/types';

// =============================================
// Global App State Interface
// =============================================

export interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  // Cart management
  cart: Cart | null;
  cartCount: number;
  isCartOpen: boolean;
  cartLoading: boolean;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchQuery: string;
  
  // Notifications
  toastNotifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration: number;
    timestamp: string;
  }>;
  
  // Global loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Error handling
  errors: Record<string, string>;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  
  // Cart Actions
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id' | 'added_at'>) => Promise<void>;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<void>;
  removeDiscountCode: (code: string) => Promise<void>;
  
  // UI Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  setSearchQuery: (query: string) => void;
  
  // Toast Notifications
  addToast: (toast: Omit<AppState['toastNotifications'][0], 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading States
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  clearLoadingState: (key: string) => void;
  
  // Error Handling
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Utility
  resetState: () => void;
}

// =============================================
// API Helper Functions
// =============================================

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Generate unique ID for toasts
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// =============================================
// App Store Implementation
// =============================================

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        
        cart: null,
        cartCount: 0,
        isCartOpen: false,
        cartLoading: false,
        
        theme: 'system',
        sidebarOpen: false,
        mobileMenuOpen: false,
        searchQuery: '',
        
        toastNotifications: [],
        
        globalLoading: false,
        loadingStates: {},
        
        errors: {},
        
        // Auth Actions
        login: async (email: string, password: string) => {
          set((state) => {
            state.isLoading = true;
            state.authError = null;
          });
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password, rememberMe: true }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Login failed');
            }
            
            set((state) => {
              state.user = data.user;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.authError = null;
            });
            
            // Fetch user's cart after successful login
            await get().fetchCart();
            
            get().addToast({
              type: 'success',
              title: 'Welcome back!',
              message: `Successfully logged in as ${data.user.firstName} ${data.user.lastName}`,
              duration: 3000,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            
            set((state) => {
              state.isLoading = false;
              state.authError = errorMessage;
            });
            
            get().addToast({
              type: 'error',
              title: 'Login Failed',
              message: errorMessage,
              duration: 5000,
            });
            
            throw error;
          }
        },
        
        register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
          set((state) => {
            state.isLoading = true;
            state.authError = null;
          });
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
              if (data.details) {
                const firstError = data.details[0];
                throw new Error(firstError?.message || data.error);
              }
              throw new Error(data.error || 'Registration failed');
            }
            
            set((state) => {
              state.isLoading = false;
              state.authError = null;
            });
            
            get().addToast({
              type: 'success',
              title: 'Account Created!',
              message: data.message || 'Please check your email to verify your account.',
              duration: 5000,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            
            set((state) => {
              state.isLoading = false;
              state.authError = errorMessage;
            });
            
            get().addToast({
              type: 'error',
              title: 'Registration Failed',
              message: errorMessage,
              duration: 5000,
            });
            
            throw error;
          }
        },
        
        logout: async () => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
            });
            
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.cart = null;
              state.cartCount = 0;
              state.isLoading = false;
              state.authError = null;
            });
            
            get().addToast({
              type: 'success',
              title: 'Logged out',
              message: 'See you next time!',
              duration: 2000,
            });
          } catch (error) {
            // Even if logout fails on server, clear local state
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.cart = null;
              state.cartCount = 0;
              state.isLoading = false;
            });
            
            console.error('Logout error:', error);
          }
        },
        
        refreshAuth: async () => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            const response = await fetch('/api/auth/me', {
              method: 'GET',
            });

            if (response.ok) {
              const data = await response.json();
              
              set((state) => {
                state.user = data.user;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
              
              // Fetch user's cart
              await get().fetchCart();
            } else {
              set((state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
              });
            }
          } catch (error) {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
            });
          }
        },
        
        updateProfile: async (userData: Partial<User>) => {
          if (!get().isAuthenticated) {
            throw new Error('User not authenticated');
          }
          
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            const response = await fetch('/api/auth/me', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
              if (data.details) {
                const firstError = data.details[0];
                throw new Error(firstError?.message || data.error);
              }
              throw new Error(data.error || 'Failed to update profile');
            }
            
            set((state) => {
              state.user = { ...state.user, ...data.user };
              state.isLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Profile Updated',
              message: data.message || 'Your profile has been updated successfully',
              duration: 3000,
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
            });
            
            const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
            get().addToast({
              type: 'error',
              title: 'Update Failed',
              message: errorMessage,
              duration: 5000,
            });
            
            throw error;
          }
        },
        
        // Cart Actions
        fetchCart: async () => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const cart = await apiRequest<Cart>('/api/cart');
            
            set((state) => {
              state.cart = cart;
              state.cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
              state.cartLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.cart = error instanceof Error ? error.message : 'Failed to fetch cart';
            });
          }
        },
        
        addToCart: async (item: Omit<CartItem, 'id' | 'added_at'>) => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const updatedCart = await apiRequest<Cart>('/api/cart/items', {
              method: 'POST',
              body: JSON.stringify(item),
            });
            
            set((state) => {
              state.cart = updatedCart;
              state.cartCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
              state.cartLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Added to Cart',
              message: `${item.product_name} has been added to your cart`,
              duration: 3000,
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.cartAdd = error instanceof Error ? error.message : 'Failed to add item to cart';
            });
            
            get().addToast({
              type: 'error',
              title: 'Add to Cart Failed',
              message: error instanceof Error ? error.message : 'Failed to add item to cart',
              duration: 5000,
            });
            
            throw error;
          }
        },
        
        updateCartItem: async (itemId: string, updates: Partial<CartItem>) => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const updatedCart = await apiRequest<Cart>(`/api/cart/items/${itemId}`, {
              method: 'PATCH',
              body: JSON.stringify(updates),
            });
            
            set((state) => {
              state.cart = updatedCart;
              state.cartCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
              state.cartLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.cartUpdate = error instanceof Error ? error.message : 'Failed to update cart item';
            });
            
            throw error;
          }
        },
        
        removeFromCart: async (itemId: string) => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const updatedCart = await apiRequest<Cart>(`/api/cart/items/${itemId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              state.cart = updatedCart;
              state.cartCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
              state.cartLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Item Removed',
              message: 'Item has been removed from your cart',
              duration: 2000,
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.cartRemove = error instanceof Error ? error.message : 'Failed to remove cart item';
            });
            
            throw error;
          }
        },
        
        clearCart: async () => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            await apiRequest('/api/cart/clear', {
              method: 'POST',
            });
            
            set((state) => {
              state.cart = {
                ...state.cart!,
                items: [],
                subtotal: 0,
                tax_amount: 0,
                total_amount: 0,
                discount_codes: [],
              };
              state.cartCount = 0;
              state.cartLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Cart Cleared',
              message: 'All items have been removed from your cart',
              duration: 2000,
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.cartClear = error instanceof Error ? error.message : 'Failed to clear cart';
            });
            
            throw error;
          }
        },
        
        applyDiscountCode: async (code: string) => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const updatedCart = await apiRequest<Cart>('/api/cart/discount', {
              method: 'POST',
              body: JSON.stringify({ code }),
            });
            
            set((state) => {
              state.cart = updatedCart;
              state.cartLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Discount Applied',
              message: `Discount code "${code}" has been applied to your cart`,
              duration: 3000,
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.discount = error instanceof Error ? error.message : 'Failed to apply discount code';
            });
            
            get().addToast({
              type: 'error',
              title: 'Discount Code Failed',
              message: error instanceof Error ? error.message : 'Invalid or expired discount code',
              duration: 5000,
            });
            
            throw error;
          }
        },
        
        removeDiscountCode: async (code: string) => {
          set((state) => {
            state.cartLoading = true;
          });
          
          try {
            const updatedCart = await apiRequest<Cart>('/api/cart/discount', {
              method: 'DELETE',
              body: JSON.stringify({ code }),
            });
            
            set((state) => {
              state.cart = updatedCart;
              state.cartLoading = false;
            });
            
            get().addToast({
              type: 'success',
              title: 'Discount Removed',
              message: `Discount code "${code}" has been removed`,
              duration: 2000,
            });
          } catch (error) {
            set((state) => {
              state.cartLoading = false;
              state.errors.discountRemove = error instanceof Error ? error.message : 'Failed to remove discount code';
            });
            
            throw error;
          }
        },
        
        // UI Actions
        toggleTheme: () => {
          set((state) => {
            const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
            const currentIndex = themes.indexOf(state.theme);
            state.theme = themes[(currentIndex + 1) % themes.length];
          });
        },
        
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.theme = theme;
          });
        },
        
        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },
        
        toggleMobileMenu: () => {
          set((state) => {
            state.mobileMenuOpen = !state.mobileMenuOpen;
          });
        },
        
        toggleCart: () => {
          set((state) => {
            state.isCartOpen = !state.isCartOpen;
          });
        },
        
        setSearchQuery: (query: string) => {
          set((state) => {
            state.searchQuery = query;
          });
        },
        
        // Toast Notifications
        addToast: (toast) => {
          const newToast = {
            ...toast,
            id: generateId(),
            timestamp: new Date().toISOString(),
          };
          
          set((state) => {
            state.toastNotifications.push(newToast);
          });
          
          // Auto remove after duration
          if (toast.duration > 0) {
            setTimeout(() => {
              get().removeToast(newToast.id);
            }, toast.duration);
          }
        },
        
        removeToast: (id: string) => {
          set((state) => {
            state.toastNotifications = state.toastNotifications.filter(toast => toast.id !== id);
          });
        },
        
        clearToasts: () => {
          set((state) => {
            state.toastNotifications = [];
          });
        },
        
        // Loading States
        setGlobalLoading: (loading: boolean) => {
          set((state) => {
            state.globalLoading = loading;
          });
        },
        
        setLoadingState: (key: string, loading: boolean) => {
          set((state) => {
            if (loading) {
              state.loadingStates[key] = true;
            } else {
              delete state.loadingStates[key];
            }
          });
        },
        
        clearLoadingState: (key: string) => {
          set((state) => {
            delete state.loadingStates[key];
          });
        },
        
        // Error Handling
        setError: (key: string, error: string) => {
          set((state) => {
            state.errors[key] = error;
          });
        },
        
        clearError: (key: string) => {
          set((state) => {
            delete state.errors[key];
          });
        },
        
        clearAllErrors: () => {
          set((state) => {
            state.errors = {};
          });
        },
        
        // Utility
        resetState: () => {
          set((state) => {
            // Reset to initial state but preserve theme
            const currentTheme = state.theme;
            
            Object.assign(state, {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              authError: null,
              cart: null,
              cartCount: 0,
              isCartOpen: false,
              cartLoading: false,
              theme: currentTheme,
              sidebarOpen: false,
              mobileMenuOpen: false,
              searchQuery: '',
              toastNotifications: [],
              globalLoading: false,
              loadingStates: {},
              errors: {},
            });
          });
        },
      })),
      {
        name: 'omaima-app-storage',
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          cart: state.cart,
          cartCount: state.cartCount,
        }),
      }
    ),
    { name: 'omaima-app-store' }
  )
);

// =============================================
// Selector Hooks
// =============================================

export const useAuth = () =>
  useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    authError: state.authError,
    login: state.login,
    register: state.register,
    logout: state.logout,
    refreshAuth: state.refreshAuth,
    updateProfile: state.updateProfile,
  }));

export const useCart = () =>
  useAppStore((state) => ({
    cart: state.cart,
    cartCount: state.cartCount,
    isCartOpen: state.isCartOpen,
    cartLoading: state.cartLoading,
    fetchCart: state.fetchCart,
    addToCart: state.addToCart,
    updateCartItem: state.updateCartItem,
    removeFromCart: state.removeFromCart,
    clearCart: state.clearCart,
    toggleCart: state.toggleCart,
    applyDiscountCode: state.applyDiscountCode,
    removeDiscountCode: state.removeDiscountCode,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    mobileMenuOpen: state.mobileMenuOpen,
    searchQuery: state.searchQuery,
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    toggleMobileMenu: state.toggleMobileMenu,
    setSearchQuery: state.setSearchQuery,
  }));

export const useToasts = () =>
  useAppStore((state) => ({
    toastNotifications: state.toastNotifications,
    addToast: state.addToast,
    removeToast: state.removeToast,
    clearToasts: state.clearToasts,
  }));

export const useLoading = () =>
  useAppStore((state) => ({
    globalLoading: state.globalLoading,
    loadingStates: state.loadingStates,
    setGlobalLoading: state.setGlobalLoading,
    setLoadingState: state.setLoadingState,
    clearLoadingState: state.clearLoadingState,
  }));

export const useErrors = () =>
  useAppStore((state) => ({
    errors: state.errors,
    setError: state.setError,
    clearError: state.clearError,
    clearAllErrors: state.clearAllErrors,
  }));
