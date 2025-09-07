import { prisma } from '@/lib/supabase';
import type {
  Product,
  Category,
  ProductVariant,
  ProductImage,
  ProductStatus,
  ProductType,
  ProductOption,
  ProductOptionValue,
} from '@prisma/client';

export interface ProductWithDetails extends Product {
  categories: Category[];
  images: ProductImage[];
  options: (ProductOption & {
    values: ProductOptionValue[];
  })[];
  variants: (ProductVariant & {
    optionValues: {
      optionValue: ProductOptionValue & {
        productOption: ProductOption;
      };
    }[];
    image: ProductImage | null;
  })[];
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

export interface VariantData {
  price: number;
  quantity: number;
  sku?: string;
  imageId?: string;
  optionValues: {
    optionName: string;
    value: string;
  }[];
}

export interface OptionData {
  name: string;
  values: string[];
}

export interface ProductCreateData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  type: ProductType;
  status: ProductStatus;
  price: number; // Base price
  sku?: string; // Base SKU
  quantity?: number; // Total quantity (will be sum of variants)
  trackQuantity: boolean;
  tags: string[];
  categoryIds: string[];
  images: {
    url: string;
    altText?: string;
    position: number;
  }[];
  options?: OptionData[];
  variants?: VariantData[];
  // Fields from original schema that might be useful
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  requiresShipping?: boolean;
  taxable?: boolean;
  taxCode?: string;
  basePrice?: number;
  estimatedDeliveryDays?: number;
}

export type ProductUpdateData = Partial<ProductCreateData>;


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
          options: {
            include: {
              values: true
            }
          },
          variants: {
            include: {
              image: true,
              optionValues: {
                include: {
                  optionValue: {
                    include: {
                      productOption: true
                    }
                  }
                }
              }
            }
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
          orderBy: { position: 'asc' },
        },
        options: {
          include: {
            values: {
              orderBy: { value: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
        variants: {
          include: {
            image: true,
            optionValues: {
              include: {
                optionValue: {
                  include: {
                    productOption: true,
                  },
                },
              },
            },
          },
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
    const { categoryIds, images, options, variants, ...productData } = data;

    // Calculate total quantity from variants if they exist
    if (variants && variants.length > 0) {
      productData.quantity = variants.reduce((acc, v) => acc + v.quantity, 0);
    }

    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
        images: {
          create: images,
        },
      },
    });

    if (options && options.length > 0) {
      // Create options and their values
      const createdOptions = await Promise.all(
        options.map(async (opt) => {
          const createdOption = await prisma.productOption.create({
            data: {
              productId: createdProduct.id,
              name: opt.name,
            },
          });
          const createdValues = await Promise.all(
            opt.values.map((val) =>
              prisma.productOptionValue.create({
                data: {
                  productOptionId: createdOption.id,
                  value: val,
                },
              })
            )
          );
          return { ...createdOption, values: createdValues };
        })
      );

      // Create variants and link them to option values
      if (variants && variants.length > 0) {
        await Promise.all(
          variants.map(async (variantData) => {
            const createdVariant = await prisma.productVariant.create({
              data: {
                productId: createdProduct.id,
                price: variantData.price,
                quantity: variantData.quantity,
                sku: variantData.sku,
                imageId: variantData.imageId,
              },
            });

            // Link variant to its option values
            await Promise.all(
              variantData.optionValues.map((optVal) => {
                const option = createdOptions.find(o => o.name === optVal.optionName);
                const value = option?.values.find(v => v.value === optVal.value);

                if (option && value) {
                  return prisma.productVariantOptionValue.create({
                    data: {
                      productVariantId: createdVariant.id,
                      productOptionValueId: value.id,
                    },
                  });
                }
                return Promise.resolve(null);
              })
            );
          })
        );
      }
    }

    return this.getProduct(createdProduct.id);
  }

  // Update product (Admin only)
  static async updateProduct(id: string, data: ProductUpdateData) {
    const { categoryIds, images, options, variants, ...productData } = data;

    // If variants are being updated, recalculate total quantity
    if (variants && variants.length > 0) {
        productData.quantity = variants.reduce((acc, v) => acc + v.quantity, 0);
    }

    // Start a transaction
    return prisma.$transaction(async (tx) => {
        // Update basic product data
        const updatedProduct = await tx.product.update({
            where: { id },
            data: {
                ...productData,
                categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
            },
        });

        // Handle images (simple replacement)
        if (images) {
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.productImage.createMany({
                data: images.map(img => ({ ...img, productId: id })),
            });
        }

        // Handle options and variants (destructive and reconstructive approach)
        if (options && variants) {
            // 1. Delete all existing variant-related data
            await tx.productVariantOptionValue.deleteMany({ where: { variant: { productId: id } } });
            await tx.productVariant.deleteMany({ where: { productId: id } });
            await tx.productOptionValue.deleteMany({ where: { productOption: { productId: id } } });
            await tx.productOption.deleteMany({ where: { productId: id } });

            // 2. Re-create options and values
            const createdOptions = await Promise.all(
              options.map(async (opt) => {
                const createdOption = await tx.productOption.create({
                  data: { productId: id, name: opt.name },
                });
                const createdValues = await Promise.all(
                  opt.values.map((val) =>
                    tx.productOptionValue.create({
                      data: { productOptionId: createdOption.id, value: val },
                    })
                  )
                );
                return { ...createdOption, values: createdValues };
              })
            );

            // 3. Re-create variants and their links
            await Promise.all(
              variants.map(async (variantData) => {
                const createdVariant = await tx.productVariant.create({
                  data: {
                    productId: id,
                    price: variantData.price,
                    quantity: variantData.quantity,
                    sku: variantData.sku,
                    imageId: variantData.imageId,
                  },
                });

                await Promise.all(
                  variantData.optionValues.map((optVal) => {
                    const option = createdOptions.find(o => o.name === optVal.optionName);
                    const value = option?.values.find(v => v.value === optVal.value);
                    if (option && value) {
                      return tx.productVariantOptionValue.create({
                        data: {
                          productVariantId: createdVariant.id,
                          productOptionValueId: value.id,
                        },
                      });
                    }
                    return Promise.resolve(null);
                  })
                );
              })
            );
        }

        return this.getProduct(id);
    });
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
