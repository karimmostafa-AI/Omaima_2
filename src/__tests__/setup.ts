import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {} as Crypto
}
global.crypto.randomUUID = vi.fn(() => {
  const chars = '0123456789abcdef'
  const segments = [8, 4, 4, 4, 12]
  return segments.map(len => 
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('')
  ).join('-') as `${string}-${string}-${string}-${string}-${string}`
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    length: 0,
    key: vi.fn(),
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
    configurable: true,
  })
}

// Mock hasPointerCapture for Radix UI components in JSDOM
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

// Mock scrollIntoView for Radix UI components in JSDOM
if (typeof window !== 'undefined' && !window.Element.prototype.scrollIntoView) {
  window.Element.prototype.scrollIntoView = vi.fn();
}

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
  },
})

// Mock environment variables - TypeScript-safe approach
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
  try {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      configurable: true
    })
  } catch {
    // If NODE_ENV is read-only, use Object.defineProperty on process.env itself
    try {
      Object.defineProperty(process, 'env', {
        value: { ...process.env, NODE_ENV: 'test' },
        writable: true,
        configurable: true
      })
    } catch {
      // Last resort: use type assertion to bypass TypeScript readonly check
      ;(process.env as any).NODE_ENV = 'test'
    }
  }
}

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'