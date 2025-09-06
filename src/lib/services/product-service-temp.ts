// Temporary service using Supabase directly instead of Prisma
// This will make the app functional while you set up the database properly

import { supabase } from '@/lib/supabase'

// Mock data for temporary use
const mockCategories = [
  {
    id: '1',
    name: 'Formal Suits',
    slug: 'formal-suits',
    description: 'Professional business suits for the modern woman',
    image: null,
    parentId: null,
    position: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    name: 'Business Dresses',
    slug: 'business-dresses',
    description: 'Elegant dresses for professional settings',
    image: null,
    parentId: null,
    position: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Corporate Uniforms',
    slug: 'corporate-uniforms',
    description: 'Custom uniform solutions for businesses',
    image: null,
    parentId: null,
    position: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Blazers',
    slug: 'blazers',
    description: 'Professional blazers and jackets',
    image: null,
    parentId: null,
    position: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockProducts = [
  {
    id: '1',
    name: 'Executive Power Suit',
    slug: 'executive-power-suit',
    description: 'A sophisticated two-piece suit perfect for boardroom meetings and formal business events.',
    shortDescription: 'Professional two-piece business suit',
    type: 'STANDARD',
    status: 'ACTIVE',
    sku: 'EPS-001',
    price: 459.00,
    compareAtPrice: 599.00,
    costPrice: 280.00,
    trackQuantity: true,
    quantity: 25,
    weight: 1.2,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['business', 'formal', 'suit', 'professional'],
    basePrice: 459.00,
    estimatedDeliveryDays: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '1',
        url: '/images/executive-suit-1.jpg',
        altText: 'Executive Power Suit - Front View',
        position: 0
      }
    ],
    categories: [mockCategories[0]]
  },
  {
    id: '2',
    name: 'Classic Business Dress',
    slug: 'classic-business-dress',
    description: 'Elegant sheath dress designed for the professional woman who values both style and comfort.',
    shortDescription: 'Professional sheath dress',
    type: 'STANDARD',
    status: 'ACTIVE',
    sku: 'CBD-001',
    price: 299.00,
    compareAtPrice: 379.00,
    costPrice: 180.00,
    trackQuantity: true,
    quantity: 40,
    weight: 0.8,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['business', 'dress', 'professional', 'elegant'],
    basePrice: 299.00,
    estimatedDeliveryDays: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '2',
        url: '/images/business-dress-1.jpg',
        altText: 'Classic Business Dress',
        position: 0
      }
    ],
    categories: [mockCategories[1]]
  },
  {
    id: '3',
    name: 'Custom Corporate Uniform',
    slug: 'custom-corporate-uniform',
    description: 'Fully customizable uniform solution with embroidered branding options for corporate teams.',
    shortDescription: 'Customizable corporate uniform',
    type: 'CUSTOMIZABLE',
    status: 'ACTIVE',
    sku: 'CCU-001',
    price: 349.00,
    compareAtPrice: 449.00,
    costPrice: 200.00,
    trackQuantity: true,
    quantity: 60,
    weight: 1.0,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['uniform', 'corporate', 'custom', 'branding'],
    basePrice: 349.00,
    estimatedDeliveryDays: 14,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '3',
        url: '/images/corporate-uniform-1.jpg',
        altText: 'Custom Corporate Uniform',
        position: 0
      }
    ],
    categories: [mockCategories[2]]
  },
  {
    id: '4',
    name: 'Professional Blazer',
    slug: 'professional-blazer',
    description: 'Versatile blazer that pairs perfectly with dresses, pants, or skirts for a polished professional look.',
    shortDescription: 'Versatile professional blazer',
    type: 'STANDARD',
    status: 'ACTIVE',
    sku: 'PB-001',
    price: 229.00,
    compareAtPrice: 289.00,
    costPrice: 140.00,
    trackQuantity: true,
    quantity: 35,
    weight: 0.9,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['blazer', 'professional', 'versatile', 'business'],
    basePrice: 229.00,
    estimatedDeliveryDays: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '4',
        url: '/images/professional-blazer-1.jpg',
        altText: 'Professional Blazer',
        position: 0
      }
    ],
    categories: [mockCategories[3]]
  },
  {
    id: '5',
    name: 'Modern Pantsuit',
    slug: 'modern-pantsuit',
    description: 'Contemporary pantsuit with a modern fit, perfect for today\'s dynamic business environment.',
    shortDescription: 'Modern professional pantsuit',
    type: 'STANDARD',
    status: 'ACTIVE',
    sku: 'MPS-001',
    price: 399.00,
    compareAtPrice: 499.00,
    costPrice: 240.00,
    trackQuantity: true,
    quantity: 20,
    weight: 1.1,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['pantsuit', 'modern', 'professional', 'contemporary'],
    basePrice: 399.00,
    estimatedDeliveryDays: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '5',
        url: '/images/modern-pantsuit-1.jpg',
        altText: 'Modern Pantsuit',
        position: 0
      }
    ],
    categories: [mockCategories[0]]
  },
  {
    id: '6',
    name: 'Elegant Work Dress',
    slug: 'elegant-work-dress',
    description: 'Sophisticated work dress with a flattering silhouette, ideal for important meetings and presentations.',
    shortDescription: 'Sophisticated work dress',
    type: 'STANDARD',
    status: 'ACTIVE',
    sku: 'EWD-001',
    price: 259.00,
    compareAtPrice: 329.00,
    costPrice: 155.00,
    trackQuantity: true,
    quantity: 45,
    weight: 0.7,
    requiresShipping: true,
    taxable: true,
    taxCode: null,
    tags: ['dress', 'elegant', 'work', 'sophisticated'],
    basePrice: 259.00,
    estimatedDeliveryDays: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '6',
        url: '/images/elegant-work-dress-1.jpg',
        altText: 'Elegant Work Dress',
        position: 0
      }
    ],
    categories: [mockCategories[1]]
  }
]

export class ProductService {
  static async getProducts(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    try {
      let filteredProducts = [...mockProducts]

      // Apply category filter
      if (filters?.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.categories.some(cat => 
            cat.slug === filters.category || cat.name.toLowerCase().includes(filters.category!.toLowerCase())
          )
        )
      }

      // Apply price filters
      if (filters?.minPrice) {
        filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!)
      }
      if (filters?.maxPrice) {
        filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!)
      }

      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      // Apply sorting
      if (filters?.sortBy) {
        filteredProducts.sort((a, b) => {
          let aValue, bValue
          switch (filters.sortBy) {
            case 'price':
              aValue = a.price
              bValue = b.price
              break
            case 'name':
              aValue = a.name
              bValue = b.name
              break
            case 'createdAt':
            default:
              aValue = a.createdAt.getTime()
              bValue = b.createdAt.getTime()
              break
          }

          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          }
        })
      }

      // Apply pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 12
      const offset = (page - 1) * limit
      const paginatedProducts = filteredProducts.slice(offset, offset + limit)

      return {
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          page,
          limit,
          totalPages: Math.ceil(filteredProducts.length / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getProductById(id: string) {
    try {
      const product = mockProducts.find(p => p.id === id)
      return product || null
    } catch (error) {
      console.error('Error fetching product by ID:', error)
      throw error
    }
  }

  static async getProductBySlug(slug: string) {
    try {
      const product = mockProducts.find(p => p.slug === slug)
      return product || null
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      throw error
    }
  }

  static async getCategories() {
    try {
      const activeCategories = mockCategories.filter(category => category.isActive)
      
      // Add product counts to match the expected structure
      return activeCategories.map(category => {
        const productCount = mockProducts.filter(product => 
          product.categories.some(cat => cat.id === category.id)
        ).length
        
        return {
          ...category,
          _count: {
            products: productCount
          }
        }
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  static async getCategoryBySlug(slug: string) {
    try {
      const category = mockCategories.find(c => c.slug === slug)
      return category || null
    } catch (error) {
      console.error('Error fetching category by slug:', error)
      throw error
    }
  }

  static async getFeaturedProducts(limit: number = 6) {
    try {
      // Return the first 'limit' products as featured
      return mockProducts.slice(0, limit)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  }

  static async searchProducts(query: string, limit: number = 20) {
    try {
      const searchTerm = query.toLowerCase()
      const results = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      ).slice(0, limit)

      return results
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }
}