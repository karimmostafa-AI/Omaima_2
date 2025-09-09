"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface WishlistProduct {
  id: string
  name: string
  price: number
  image: string
  slug: string
  addedAt: string
}

const WISHLIST_STORAGE_KEY = 'product_wishlist'

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing wishlist items:', error)
        localStorage.removeItem(WISHLIST_STORAGE_KEY)
      }
    }
  }, [])

  const saveToStorage = (items: WishlistProduct[]) => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    setWishlistItems(items)
  }

  const addToWishlist = (product: Omit<WishlistProduct, 'addedAt'>) => {
    if (wishlistItems.find(item => item.id === product.id)) {
      toast.info('Product is already in wishlist')
      return false
    }

    const wishlistProduct: WishlistProduct = {
      ...product,
      addedAt: new Date().toISOString()
    }

    const updatedItems = [wishlistProduct, ...wishlistItems]
    saveToStorage(updatedItems)
    toast.success('Product added to wishlist')
    return true
  }

  const removeFromWishlist = (productId: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== productId)
    saveToStorage(updatedItems)
    toast.success('Product removed from wishlist')
  }

  const clearWishlist = () => {
    saveToStorage([])
    toast.success('Wishlist cleared')
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const toggleWishlist = (product: Omit<WishlistProduct, 'addedAt'>) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlistItems.length
  }
}
