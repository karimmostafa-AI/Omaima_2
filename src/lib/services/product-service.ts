import { prisma } from '@/lib/supabase'
import type { 
  Product, 
  Category, 
  ProductVariant, 
  ProductImage, 
  ProductStatus, 
  ProductType 
} from '@prisma/client'

export interface ProductWithDetails extends Product {
  categories: Category[]
  variants: ProductVariant[]
  images: ProductImage[]
}

export interface ProductFilters {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  status?: ProductStatus
  type?: ProductType
  search?: string
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductCreateData {
  name: string
  slug: string
  description?: string
  shortDescription?: string
  type: ProductType
  status: ProductStatus
  sku?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  trackQuantity: boolean
  quantity?: number
  weight?: number
  requiresShipping: boolean
  taxable: boolean
  taxCode?: string
  tags: string[]
  basePrice: number
  estimatedDeliveryDays: number
  categoryIds: string[]
  images: {
    url: string
    altText?: string
    position: number
  }[]
  variants?: {
    title: string
    option1?: string
    option2?: string
    option3?: string
    sku?: string
    price: number
    compareAtPrice?: number
    costPrice?: number
    position: number
    quantity: number
    weight?: number
  }[]
}

export class ProductService {
  // Get all products with filters
  static async getProducts(filters: ProductFilters = {}) {
    const {
      categoryId,
      priceMin,
      priceMax,
      status = 'ACTIVE',
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = filters

    const skip = (page - 1) * limit

    const where: any = {
      status: status
    }

    if (categoryId) {
      where.categories = {
        some: {
          id: categoryId
        }
      }
    }

    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = priceMin
      if (priceMax) where.price.lte = priceMax
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: true,
          images: {
            orderBy: { position: 'asc' }
          },
          variants: {
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { [sortBy]: sortOrder },
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

  // Get product by ID or slug
  static async getProduct(idOrSlug: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        categories: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          orderBy: { position: 'asc' }
        },
        customizationTemplates: {
          where: { isActive: true },
          include: {
            options: {
              where: { isActive: true },
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    return product as ProductWithDetails | null
  }

  // Create new product (Admin only)
  static async createProduct(data: ProductCreateData) {
    const { categoryIds, images, variants, ...productData } = data

    return await prisma.product.create({
      data: {
        ...productData,
        categories: {
          connect: categoryIds.map(id => ({ id }))
        },
        images: {
          create: images
        },
        variants: variants ? {
          create: variants
        } : undefined
      },
      include: {
        categories: true,
        images: true,
        variants: true
      }
    })
  }

  // Update product (Admin only)
  static async updateProduct(id: string, data: Partial<ProductCreateData>) {
    const { categoryIds, images, variants, ...productData } = data

    return await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        categories: categoryIds ? {
          set: categoryIds.map(id => ({ id }))
        } : undefined,
        images: images ? {
          deleteMany: {},
          create: images
        } : undefined,
        variants: variants ? {
          deleteMany: {},
          create: variants
        } : undefined
      },
      include: {
        categories: true,
        images: true,
        variants: true
      }
    })
  }

  // Delete product (Admin only)
  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id }
    })
  }

  // Toggle product status (Admin only)
  static async toggleProductStatus(id: string, status: ProductStatus) {
    return await prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  // Get all categories
  static async getCategories() {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })
  }

  // Get category by ID or slug
  static async getCategory(idOrSlug: string) {
    return await prisma.category.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ],
        isActive: true
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        },
        products: {
          where: { status: 'ACTIVE' },
          include: {
            images: {
              orderBy: { position: 'asc' },
              take: 1
            }
          },
          take: 12
        }
      }
    })
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 8) {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        // Add featured logic here - could be a featured flag or based on sales
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1
        },
        categories: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Search products
  static async searchProducts(query: string, limit: number = 10) {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1
        },
        categories: true
      },
      take: limit
    })
  }

  // Get product stats for admin
  static async getProductStats() {
    const [totalProducts, activeProducts, draftProducts, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.product.count({ 
        where: { 
          status: 'ACTIVE',
          trackQuantity: true,
          quantity: { lte: 10 }
        } 
      })
    ])

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      lowStockProducts
    }
  }
}
