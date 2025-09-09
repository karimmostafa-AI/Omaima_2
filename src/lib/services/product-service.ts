import { prisma } from '@/lib/db'
import type { Product, Category, ProductStatus } from '.prisma/client'

export interface ProductWithCategories extends Product {
  categories: Category[]
}

export interface ProductFilters {
  search?: string
  status?: ProductStatus
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
      page = 1,
      limit = 12
    } = filters

    const skip = (page - 1) * limit

    const where: any = {
      status: status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products: products as ProductWithCategories[],
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
