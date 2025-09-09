import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...')

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@omaima.com' },
    update: {},
    create: {
      email: 'admin@omaima.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  console.log('👤 Created admin user:', adminUser.email)
  console.log('🔑 Admin password: admin123')

  // Create some sample categories
  const categories = [
    { name: 'Business Suits' },
    { name: 'Blazers' },
    { name: 'Dresses' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('📁 Created categories:', categories.length)

  // Create some sample products
  const products = [
    {
      name: 'Executive Business Suit',
      description: 'A sophisticated business suit perfect for the modern professional woman.',
      price: 399.00,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop'
    },
    {
      name: 'Classic Blazer',
      description: 'A timeless blazer that pairs perfectly with any professional outfit.',
      price: 149.00,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=600&fit=crop'
    },
    {
      name: 'Professional Dress',
      description: 'An elegant dress suitable for business meetings and formal events.',
      price: 189.00,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop'
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product
    })
  }

  console.log('🛍️ Created products:', products.length)
  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('🚀 You can now login with:')
  console.log('   Email: admin@omaima.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
