import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  applyDiscount: (code: string) => void
  removeDiscount: (code: string) => void
  setIsOpen: (isOpen: boolean) => void
  
  // Computed
  getSummary: () => CartSummary
  getItem: (productId: string, variantId?: string, customConfig?: any) => CartItem | undefined
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

      addItem: (newItem) => {
        const existingItem = get().getItem(
          newItem.productId, 
          newItem.variantId, 
          newItem.customConfiguration
        )

        if (existingItem) {
          // Update quantity if item already exists
          get().updateQuantity(existingItem.id, existingItem.quantity + newItem.quantity)
        } else {
          // Add new item
          const item: CartItem = {
            ...newItem,
            id: `${newItem.productId}-${newItem.variantId || 'default'}-${Date.now()}`,
          }
          set((state) => ({
            items: [...state.items, item]
          }))
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
              : item
          )
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }))
      },

      clearCart: () => {
        set({ items: [], discountCodes: [] })
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
