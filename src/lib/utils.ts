import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PriceBreakdown, CustomGarmentConfig } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================
// Formatting Utilities
// =============================================

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const dateObj = new Date(date)
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return formatDate(date)
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// =============================================
// Text Utilities
// =============================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function generateOrderNumber(): string {
  const prefix = 'OM'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}

// =============================================
// Validation Utilities
// =============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,2}[\s\-]?[\(]?[\d]{3}[\)]?[\s\-]?[\d]{3}[\s\-]?[\d]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateMeasurement(value: number, min: number = 10, max: number = 200): boolean {
  return value >= min && value <= max
}

// =============================================
// Customization Utilities
// =============================================

export function calculateCustomizationPrice(config: Partial<CustomGarmentConfig>): PriceBreakdown {
  let basePrice = 200 // Base suit price
  let fabricCost = 0
  let componentModifiers: Record<string, number> = {}
  let personalizationCosts: Record<string, number> = {}
  let premiumUpcharges = 0

  // Calculate fabric cost
  if (config.components?.fabric) {
    fabricCost = config.components.fabric.pricePerUnit * 3 // Estimate 3 units needed
  }

  // Calculate component modifiers
  if (config.components?.jacket) {
    const jacket = config.components.jacket
    if (jacket.buttonCount > 2) {
      componentModifiers['extra_buttons'] = 25
    }
    if (jacket.lapelType === 'peaked') {
      componentModifiers['peaked_lapels'] = 50
    }
    if (jacket.lining) {
      componentModifiers['custom_lining'] = 75
    }
  }

  // Calculate personalization costs
  if (config.personalizations?.monogram) {
    personalizationCosts['monogram'] = 30
  }
  if (config.personalizations?.embroidery) {
    personalizationCosts['embroidery'] = 85
  }

  const subtotal = basePrice + fabricCost + 
    Object.values(componentModifiers).reduce((sum, val) => sum + val, 0) +
    Object.values(personalizationCosts).reduce((sum, val) => sum + val, 0) +
    premiumUpcharges

  const taxes = subtotal * 0.08 // 8% tax
  const total = subtotal + taxes

  return {
    basePrice,
    fabricCost,
    componentModifiers,
    personalizationCosts,
    premiumUpcharges,
    subtotal,
    taxes,
    total,
    breakdown_details: {
      fabric_units_used: 3,
      labor_cost: basePrice * 0.4,
      materials_cost: fabricCost + Object.values(componentModifiers).reduce((sum, val) => sum + val, 0),
      overhead_percentage: 0.15
    }
  }
}

export function generateCustomizationSummary(config: CustomGarmentConfig): string {
  const parts: string[] = []
  
  if (config.components.jacket) {
    const jacket = config.components.jacket
    parts.push(`${jacket.styleName} jacket with ${jacket.lapelType} lapels`)
    parts.push(`${jacket.buttonCount}-button style`)
  }
  
  if (config.components.fabric) {
    parts.push(`${config.components.fabric.fabricName} fabric in ${config.components.fabric.colorway}`)
  }
  
  if (config.personalizations?.monogram) {
    parts.push(`Monogrammed with "${config.personalizations.monogram.text}"`)
  }
  
  return parts.join(', ')
}

// =============================================
// Array and Object Utilities
// =============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// =============================================
// Local Storage Utilities
// =============================================

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}
