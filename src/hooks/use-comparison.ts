"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface ComparisonProduct {
  id: string
  name: string
  price: number
  image: string
  slug: string
  categories: string[]
  tags: string[]
}

const COMPARISON_STORAGE_KEY = 'product_comparison'
const MAX_COMPARISON_ITEMS = 3

export function useComparison() {
  const [comparisonItems, setComparisonItems] = useState<ComparisonProduct[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
    if (stored) {
      try {
        setComparisonItems(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing comparison items:', error)
        localStorage.removeItem(COMPARISON_STORAGE_KEY)
      }
    }
  }, [])

  const saveToStorage = (items: ComparisonProduct[]) => {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(items))
    setComparisonItems(items)
  }

  const addToComparison = (product: ComparisonProduct) => {
    if (comparisonItems.find(item => item.id === product.id)) {
      toast.info('Product is already in comparison')
      return false
    }

    if (comparisonItems.length >= MAX_COMPARISON_ITEMS) {
      toast.error(`You can compare up to ${MAX_COMPARISON_ITEMS} products at once`)
      return false
    }

    const updatedItems = [...comparisonItems, product]
    saveToStorage(updatedItems)
    toast.success('Product added to comparison')
    return true
  }

  const removeFromComparison = (productId: string) => {
    const updatedItems = comparisonItems.filter(item => item.id !== productId)
    saveToStorage(updatedItems)
    toast.success('Product removed from comparison')
  }

  const clearComparison = () => {
    saveToStorage([])
    toast.success('Comparison cleared')
  }

  const isInComparison = (productId: string) => {
    return comparisonItems.some(item => item.id === productId)
  }

  return {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    comparisonCount: comparisonItems.length,
    canAddMore: comparisonItems.length < MAX_COMPARISON_ITEMS
  }
}
