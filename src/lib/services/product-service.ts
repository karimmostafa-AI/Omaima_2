import { prisma } from '@/lib/db'
import type { Product, Category, ProductStatus } from '.prisma/client'

export interface ProductWithCategories extends Product {
  categories: Category[]
}

export interface ProductWithDetails extends Product {
  categories: Category[]
}

export interface ProductFilters {
  search?: string
  status?: ProductStatus
  categoryId?: string
  priceMin?: number
  priceMax?: number
  materials?: string[]
  sizes?: string[]
  colors?: string[]
  brands?: string[]
  inStock?: boolean
  isCustomizable?: boolean
  isReadyMade?: boolean
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity' | 'rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductCreateData {
  name: string
  description?: string
  price: number
  image?: string
  stock: number
  status: ProductStatus
  categoryIds: string[]
}

export class ProductService {
  // Get all products with filters
  static async getProducts(filters: ProductFilters = {}) {
    const {
      search,
      status = 'ACTIVE',
      categoryId,
      priceMin,
      priceMax,
      materials,
      sizes,
      colors,
      brands,
      inStock,
      isCustomizable,
      isReadyMade,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = filters

    const skip = (page - 1) * limit

    const where: any = {
      status: status
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Category filter
    if (categoryId) {
      where.categories = {
        some: {
          id: categoryId
        }
      }
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {}
      if (priceMin !== undefined) {
        where.price.gte = priceMin
      }
      if (priceMax !== undefined) {
        where.price.lte = priceMax
      }
    }

    // Stock filter (using the stock field from current schema)
    if (inStock === true) {
      where.stock = {
        gt: 0
      }
    }

    // Materials filter
    if (materials && materials.length > 0) {
      where.OR = where.OR || []
      const materialConditions = materials.map(material => ({
        materials: {
          contains: material.toLowerCase()
        }
      }))
      where.OR.push(...materialConditions)
    }

    // Sizes filter  
    if (sizes && sizes.length > 0) {
      const existingOR = where.OR || []
      where.OR = []
      const sizeConditions = sizes.map(size => ({
        sizes: {
          contains: size.toLowerCase()
        }
      }))
      
      if (existingOR.length > 0) {
        // Combine with existing OR conditions using AND
        where.AND = [
          { OR: existingOR },
          { OR: sizeConditions }
        ]
      } else {
        where.OR = sizeConditions
      }
    }

    // Colors filter
    if (colors && colors.length > 0) {
      const existingConditions = where.OR || []
      const existingAND = where.AND || []
      
      const colorConditions = colors.map(color => ({
        colors: {
          contains: color.toLowerCase()
        }
      }))
      
      if (existingConditions.length > 0 || existingAND.length > 0) {
        // Add to existing AND conditions
        where.AND = [
          ...(existingAND.length > 0 ? existingAND : [{ OR: existingConditions }]),
          { OR: colorConditions }
        ]
        delete where.OR
      } else {
        where.OR = colorConditions
      }
    }

    // Product type filters
    if (isCustomizable === true) {
      where.isCustomizable = true
    }
    
    if (isReadyMade === true) {
      where.isReadyMade = true
    }

    // Sorting
    let orderBy: any
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder }
        break
      case 'price':
        orderBy = { price: sortOrder }
        break
      case 'popularity':
        // For now, use createdAt as proxy for popularity
        orderBy = { createdAt: 'desc' }
        break
      case 'rating':
        // For now, use createdAt as proxy for rating
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: sortOrder }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products: products as ProductWithDetails[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Get product by ID
  static async getProduct(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true
      }
    })
  }

  // Create new product (Admin only)
  static async createProduct(data: ProductCreateData) {
    const { categoryIds, ...productData } = data

    return await prisma.product.create({
      data: {
        ...productData,
        categories: {
          connect: categoryIds.map(id => ({ id }))
        }
      },
      include: {
        categories: true
      }
    })
  }

  // Update product (Admin only)
  static async updateProduct(id: string, data: Partial<ProductCreateData>) {
    const { categoryIds, ...productData } = data

    return await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        categories: categoryIds ? {
          set: categoryIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        categories: true
      }
    })
  }

  // Delete product (Admin only)
  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id }
    })
  }

  // Get all categories
  static async getCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  }

  // Search products with autocomplete
  static async searchProducts(query: string, limit: number = 10) {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: {
        categories: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string, limit: number = 5) {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query } }
        ]
      },
      select: {
        name: true
      },
      take: limit
    })

    const suggestions = new Set<string>()
    products.forEach(product => {
      suggestions.add(product.name)
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Get product filters data (for dropdowns)
  static async getFiltersData() {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        price: true
      }
    })

    let minPrice = Number.MAX_VALUE
    let maxPrice = 0

    products.forEach(product => {
      if (product.price < minPrice) minPrice = product.price
      if (product.price > maxPrice) maxPrice = product.price
    })

    // Return mock filter data since SQLite doesn't have tags field in current schema
    return {
      materials: ['wool', 'cotton', 'silk', 'linen', 'polyester'].sort(),
      sizes: ['xs', 's', 'm', 'l', 'xl', 'xxl'].sort(),
      colors: ['black', 'white', 'gray', 'navy', 'blue', 'brown'].sort(),
      brands: ['brand-a', 'brand-b', 'brand-c'].sort(),
      priceRange: { 
        min: products.length > 0 ? Math.floor(minPrice) : 0, 
        max: products.length > 0 ? Math.ceil(maxPrice) : 1000 
      }
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 8) {
    return await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        categories: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
}
