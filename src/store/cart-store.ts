import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService, type CartItem as ServiceCartItem, type AddToCartData } from '@/lib/cart-service'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  slug: string
  price: number
  quantity: number
  imageUrl?: string
  customConfiguration?: any // For customized products
  maxQuantity?: number
  estimatedDeliveryDays?: number
}

interface CartSummary {
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  itemCount: number
}

interface CartStore {
  items: CartItem[]
  discountCodes: string[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  applyDiscount: (code: string) => void
  removeDiscount: (code: string) => void
  setIsOpen: (isOpen: boolean) => void
  
  // API Sync
  syncWithServer: (userId?: string) => Promise<void>
  addToCartAPI: (data: AddToCartData) => Promise<void>
  
  // Computed
  getSummary: () => CartSummary
  getItem: (productId: string, variantId?: string, customConfig?: any) => CartItem | undefined
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const TAX_RATE = 0.08 // 8% tax rate
const FREE_SHIPPING_THRESHOLD = 100
const SHIPPING_COST = 15

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCodes: [],
      isOpen: false,
      isLoading: false,
      error: null,

      addItem: async (newItem) => {
        // Optimistic local update
        const existingItem = get().getItem(
          newItem.productId, 
          newItem.variantId, 
          newItem.customConfiguration
        )

        if (existingItem) {
          await get().updateQuantity(existingItem.id, existingItem.quantity + newItem.quantity)
        } else {
          const tempId = `${newItem.productId}-${newItem.variantId || 'default'}-${Date.now()}`
          const item: CartItem = {
            ...newItem,
            id: tempId,
          }
          set((state) => ({ items: [...state.items, item] }))
        }
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id)
          return
        }

        // Optimistic update - always update local state
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
              : item
          )
        }))

        // Only sync with server for authenticated users
        // For guest users, we only use local storage
        // The server sync will happen when they log in via syncWithServer
      },

      removeItem: async (id) => {
        // Always update local state immediately
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }))
        
        // Only sync with server for authenticated users
        // For guest users, we only use local storage
      },

      clearCart: async () => {
        // Always clear local state immediately
        set({ items: [], discountCodes: [] })
        
        // Only sync with server for authenticated users
        // For guest users, we only use local storage
      },

      applyDiscount: (code) => {
        set((state) => ({
          discountCodes: [...new Set([...state.discountCodes, code])]
        }))
      },

      removeDiscount: (code) => {
        set((state) => ({
          discountCodes: state.discountCodes.filter((c) => c !== code)
        }))
      },

      setIsOpen: (isOpen) => {
        set({ isOpen })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      syncWithServer: async () => {
        set({ isLoading: true, error: null })
        try {
          const serverCart = await cartService.getCart()
          if (serverCart && Array.isArray(serverCart.items)) {
            set({ items: serverCart.items as unknown as CartItem[] })
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to sync cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      addToCartAPI: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const result = await cartService.addToCart(data)
          if (result?.item) {
            const item = result.item as unknown as CartItem
            set((state) => {
              const exists = state.items.find((i) => i.id === item.id)
              if (exists) {
                return {
                  items: state.items.map((i) => (i.id === item.id ? item : i)),
                }
              }
              return { items: [...state.items, item] }
            })
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to add to cart' })
          throw e
        } finally {
          set({ isLoading: false })
        }
      },

      getSummary: () => {
        const items = get().items
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        // Calculate discount (simplified - would normally fetch from API)
        let discountAmount = 0
        const discountCodes = get().discountCodes
        if (discountCodes.includes('WELCOME10')) {
          discountAmount = subtotal * 0.1 // 10% discount
        }
        
        const discountedSubtotal = subtotal - discountAmount
        const taxAmount = discountedSubtotal * TAX_RATE
        const shippingAmount = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
        const total = discountedSubtotal + taxAmount + shippingAmount
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

        return {
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount,
          total,
          itemCount
        }
      },

      getItem: (productId, variantId, customConfig) => {
        return get().items.find((item) => {
          const productMatch = item.productId === productId
          const variantMatch = item.variantId === variantId
          
          // For custom products, compare configurations
          if (customConfig) {
            const configMatch = JSON.stringify(item.customConfiguration) === JSON.stringify(customConfig)
            return productMatch && variantMatch && configMatch
          }
          
          return productMatch && variantMatch
        })
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        discountCodes: state.discountCodes,
      }),
    }
  )
)
