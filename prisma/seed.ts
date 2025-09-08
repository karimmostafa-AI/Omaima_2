import { PrismaClient, type Category, type Product } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@omaima.com' },
    update: {},
    create: {
      email: 'admin@omaima.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      emailVerified: true,
      isActive: true,
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          marketing: true
        },
        theme: 'light'
      }
    }
  })

  console.log('👤 Created admin user:', adminUser.email)

  // Create categories
  const categories = [
    {
      name: 'Business Suits',
      slug: 'business-suits',
      description: 'Professional business suits for the modern woman',
      image: '/images/categories/business-suits.jpg',
      position: 1
    },
    {
      name: 'Blazers',
      slug: 'blazers',
      description: 'Elegant blazers for professional and casual wear',
      image: '/images/categories/blazers.jpg',
      position: 2
    },
    {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Sophisticated dresses for work and formal events',
      image: '/images/categories/dresses.jpg',
      position: 3
    },
    {
      name: 'Custom Suits',
      slug: 'custom-suits',
      description: 'Fully customizable suits tailored to your specifications',
      image: '/images/categories/custom-suits.jpg',
      position: 4
    }
  ]

  const createdCategories: Category[] = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    })
    createdCategories.push(created)
  }

  console.log('📁 Created categories:', createdCategories.length)

  // Create sample products
  const sampleProducts = [
    {
      name: 'Executive Business Suit',
      slug: 'executive-business-suit',
      description: 'A sophisticated business suit perfect for the modern professional woman. Features a tailored jacket with matching pants or skirt options.',
      shortDescription: 'Sophisticated business suit with customization options',
      type: 'CUSTOMIZABLE' as const,
      status: 'ACTIVE' as const,
      sku: 'EBS-001',
      price: 399.00,
      compareAtPrice: 599.00,
      trackQuantity: false,
      requiresShipping: true,
      taxable: true,
      tags: 'business,professional,customizable,suit',
      basePrice: 299.00,
      estimatedDeliveryDays: 14
    },
    {
      name: 'Classic Blazer',
      slug: 'classic-blazer',
      description: 'A timeless blazer that pairs perfectly with any professional outfit. Available in multiple colors and sizes.',
      shortDescription: 'Timeless professional blazer',
      type: 'STANDARD' as const,
      status: 'ACTIVE' as const,
      sku: 'BLZ-001',
      price: 149.00,
      compareAtPrice: 199.00,
      trackQuantity: true,
      quantity: 50,
      requiresShipping: true,
      taxable: true,
      tags: 'blazer,professional,classic',
      basePrice: 149.00,
      estimatedDeliveryDays: 3
    },
    {
      name: 'Professional Dress',
      slug: 'professional-dress',
      description: 'An elegant dress suitable for business meetings and formal events. Made with premium materials.',
      shortDescription: 'Elegant professional dress',
      type: 'STANDARD' as const,
      status: 'ACTIVE' as const,
      sku: 'PRD-001',
      price: 189.00,
      compareAtPrice: 249.00,
      trackQuantity: true,
      quantity: 30,
      requiresShipping: true,
      taxable: true,
      tags: 'dress,professional,formal',
      basePrice: 189.00,
      estimatedDeliveryDays: 5
    }
  ]

  const createdProducts: Product[] = []
  for (const product of sampleProducts) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    })
    createdProducts.push(created)
  }
  
  console.log('🛍️ Created products:', createdProducts.length)
  
  // Add product images separately
  for (const product of createdProducts) {
    if (product.slug === 'executive-business-suit') {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: [{ id: createdCategories[0].id }, { id: createdCategories[3].id }]
          }
        }
      })
      
      // Add images
      await prisma.productImage.createMany({
        data: [
          {
            url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
            altText: 'Executive Business Suit - Front View',
            position: 0,
            productId: product.id
          },
          {
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
            altText: 'Executive Business Suit - Side View',
            position: 1,
            productId: product.id
          }
        ]
      })
    } else if (product.slug === 'classic-blazer') {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: [{ id: createdCategories[1].id }]
          }
        }
      })
      
      // Add images
      await prisma.productImage.create({
        data: {
          url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=600&fit=crop',
          altText: 'Classic Blazer - Professional Look',
          position: 0,
          productId: product.id
        }
      })
    } else if (product.slug === 'professional-dress') {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: [{ id: createdCategories[2].id }]
          }
        }
      })
      
      // Add images
      await prisma.productImage.create({
        data: {
          url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop',
          altText: 'Professional Dress - Elegant Style',
          position: 0,
          productId: product.id
        }
      })
    }
  }

  // Seed permissions
  try {
    const { ALL_PERMISSIONS } = await import('../src/lib/permissions-list')
    for (const permissionName of ALL_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: { name: permissionName },
      });
    }
    console.log('🔐 Permissions seeded.');

    // Create a root role and assign all permissions
    const rootRole = await prisma.role.upsert({
      where: { name: 'root' },
      update: {},
      create: { name: 'root' },
    });
    const allPermissions = await prisma.permission.findMany();
    await prisma.rolePermissions.deleteMany({ where: { roleId: rootRole.id } });
    await prisma.rolePermissions.createMany({
      data: allPermissions.map(permission => ({
        roleId: rootRole.id,
        permissionId: permission.id,
      })),
    });
    console.log('👑 Root role created and all permissions assigned.');
  } catch (error) {
    console.log('⚠️ Skipping permissions seeding (file not found)');
  }

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })