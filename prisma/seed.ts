import { PrismaClient } from '@prisma/client'
import { createServerClient } from '../lib/supabase'

const prisma = new PrismaClient()
const supabase = createServerClient()

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
      name: 'Skirts',
      slug: 'skirts',
      description: 'Professional skirts in various styles and lengths',
      image: '/images/categories/skirts.jpg',
      position: 4
    },
    {
      name: 'Custom Suits',
      slug: 'custom-suits',
      description: 'Fully customizable suits tailored to your specifications',
      image: '/images/categories/custom-suits.jpg',
      position: 5
    },
    {
      name: 'Uniforms',
      slug: 'uniforms',
      description: 'Professional uniforms for various industries',
      image: '/images/categories/uniforms.jpg',
      position: 6
    }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    })
    createdCategories.push(created)
  }

  console.log('📁 Created categories:', createdCategories.length)

  // Create fabrics
  const fabrics = [
    {
      name: 'Premium Wool',
      fabricCode: 'WOOL-001',
      description: 'High-quality wool blend perfect for business suits',
      composition: '80% Wool, 20% Polyester',
      weight: 250.0,
      pricePerUnit: 45.00,
      colorName: 'Navy Blue',
      colorHex: '#1e3a8a',
      patternType: 'Solid',
      imageUrl: '/images/fabrics/wool-navy.jpg',
      swatchImageUrl: '/images/swatches/wool-navy.jpg',
      stockQuantity: 100,
      isPremium: true,
      season: 'All Season',
      careInstructions: 'Dry clean only',
      originCountry: 'Italy'
    },
    {
      name: 'Premium Wool',
      fabricCode: 'WOOL-002',
      description: 'High-quality wool blend perfect for business suits',
      composition: '80% Wool, 20% Polyester',
      weight: 250.0,
      pricePerUnit: 45.00,
      colorName: 'Charcoal Gray',
      colorHex: '#374151',
      patternType: 'Solid',
      imageUrl: '/images/fabrics/wool-charcoal.jpg',
      swatchImageUrl: '/images/swatches/wool-charcoal.jpg',
      stockQuantity: 100,
      isPremium: true,
      season: 'All Season',
      careInstructions: 'Dry clean only',
      originCountry: 'Italy'
    },
    {
      name: 'Super 120s Wool',
      fabricCode: 'WOOL-S120-001',
      description: 'Ultra-fine merino wool for luxury suits',
      composition: '100% Merino Wool',
      weight: 280.0,
      pricePerUnit: 75.00,
      colorName: 'Black',
      colorHex: '#000000',
      patternType: 'Solid',
      imageUrl: '/images/fabrics/super120-black.jpg',
      swatchImageUrl: '/images/swatches/super120-black.jpg',
      stockQuantity: 50,
      isPremium: true,
      season: 'All Season',
      careInstructions: 'Professional dry clean only',
      originCountry: 'England'
    },
    {
      name: 'Cotton Blend',
      fabricCode: 'COTTON-001',
      description: 'Breathable cotton blend for summer wear',
      composition: '60% Cotton, 40% Polyester',
      weight: 200.0,
      pricePerUnit: 25.00,
      colorName: 'Light Gray',
      colorHex: '#d1d5db',
      patternType: 'Solid',
      imageUrl: '/images/fabrics/cotton-lightgray.jpg',
      swatchImageUrl: '/images/swatches/cotton-lightgray.jpg',
      stockQuantity: 150,
      isPremium: false,
      season: 'Summer',
      careInstructions: 'Machine wash cold, hang dry',
      originCountry: 'Portugal'
    }
  ]

  const createdFabrics = []
  for (const fabric of fabrics) {
    const created = await prisma.fabric.upsert({
      where: { fabricCode: fabric.fabricCode },
      update: fabric,
      create: fabric
    })
    createdFabrics.push(created)
  }

  console.log('🧵 Created fabrics:', createdFabrics.length)

  // Create customization templates
  const customizationTemplate = await prisma.customizationTemplate.upsert({
    where: { id: 'template-1' },
    update: {},
    create: {
      id: 'template-1',
      name: 'Women\\'s Business Suit',
      description: 'Fully customizable women\\'s business suit with jacket and pants/skirt options',
      productId: 'product-1', // Will be created below
      category: 'business-suit',
      basePrice: 299.00,
      estimatedFabricYards: 3.5,
      availableComponents: ['jacket', 'pants', 'skirt', 'fabric', 'measurements', 'personalization'],
      defaultConfiguration: {
        templateId: 'template-1',
        templateName: 'Women\\'s Business Suit',
        components: {
          jacket: {
            styleId: 'single-breasted',
            styleName: 'Single Breasted',
            lapelType: 'notched',
            buttonStyle: 'standard',
            buttonCount: 2,
            pockets: ['flap-pockets'],
            vents: 'center-vent'
          },
          fabric: {
            fabricId: createdFabrics[0].id,
            fabricName: createdFabrics[0].name,
            fabricCode: createdFabrics[0].fabricCode,
            colorway: createdFabrics[0].colorName,
            pattern: createdFabrics[0].patternType,
            pricePerUnit: createdFabrics[0].pricePerUnit
          },
          measurements: {
            sizeGuide: 'standard'
          }
        },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1
      },
      uiConfiguration: {
        steps: [
          {
            stepNumber: 1,
            title: 'Choose Your Style',
            description: 'Select jacket style, lapels, and button configuration',
            component: 'StyleSelector',
            requiredFields: ['styleId', 'lapelType', 'buttonCount']
          },
          {
            stepNumber: 2,
            title: 'Select Fabric & Color',
            description: 'Choose from our premium fabric collection',
            component: 'FabricSelector',
            requiredFields: ['fabricId', 'colorway']
          },
          {
            stepNumber: 3,
            title: 'Measurements',
            description: 'Provide your measurements for perfect fit',
            component: 'MeasurementForm',
            requiredFields: ['measurements']
          },
          {
            stepNumber: 4,
            title: 'Final Details',
            description: 'Add personalization and review your order',
            component: 'PersonalizationForm',
            requiredFields: []
          }
        ],
        preview_images: [
          '/images/suit-preview-1.jpg',
          '/images/suit-preview-2.jpg',
          '/images/suit-preview-3.jpg'
        ]
      },
      isActive: true
    }
  })

  console.log('🎨 Created customization template:', customizationTemplate.name)

  // Create sample products
  const sampleProducts = [
    {
      id: 'product-1',
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
      tags: ['business', 'professional', 'customizable', 'suit'],
      customizationTemplateId: customizationTemplate.id,
      basePrice: 299.00,
      estimatedDeliveryDays: 14,
      categories: {
        connect: [{ id: createdCategories[0].id }, { id: createdCategories[4].id }]
      },
      images: {
        create: [
          {
            url: '/images/products/executive-suit-1.jpg',
            altText: 'Executive Business Suit - Front View',
            position: 1,
            width: 800,
            height: 1200
          },
          {
            url: '/images/products/executive-suit-2.jpg',
            altText: 'Executive Business Suit - Side View',
            position: 2,
            width: 800,
            height: 1200
          }
        ]
      },
      seo: {
        title: 'Executive Business Suit - Custom Tailored for Professional Women',
        description: 'Premium business suit with full customization options. Perfect fit guaranteed with our expert tailoring service.',
        keywords: 'business suit, professional wear, custom tailoring, women\\'s suits'
      }
    },
    {
      id: 'product-2',
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
      tags: ['blazer', 'professional', 'classic'],
      basePrice: 149.00,
      estimatedDeliveryDays: 3,
      categories: {
        connect: [{ id: createdCategories[1].id }]
      },
      images: {
        create: [
          {
            url: '/images/products/classic-blazer-1.jpg',
            altText: 'Classic Blazer - Navy Blue',
            position: 1,
            width: 800,
            height: 1200
          }
        ]
      }
    }
  ]

  const createdProducts = []
  for (const product of sampleProducts) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    })
    createdProducts.push(created)
  }

  console.log('🛍️ Created products:', createdProducts.length)

  // Create customization options for the template
  const customizationOptions = [
    {
      templateId: customizationTemplate.id,
      category: 'style',
      name: 'single-breasted',
      displayName: 'Single Breasted',
      description: 'Classic single-breasted jacket style',
      priceModifier: 0.00,
      priceType: 'FIXED' as const,
      position: 1
    },
    {
      templateId: customizationTemplate.id,
      category: 'style',
      name: 'double-breasted',
      displayName: 'Double Breasted',
      description: 'Elegant double-breasted jacket style',
      priceModifier: 50.00,
      priceType: 'FIXED' as const,
      position: 2
    },
    {
      templateId: customizationTemplate.id,
      category: 'lapel',
      name: 'notched',
      displayName: 'Notched Lapel',
      description: 'Traditional notched lapel style',
      priceModifier: 0.00,
      priceType: 'FIXED' as const,
      position: 1
    },
    {
      templateId: customizationTemplate.id,
      category: 'lapel',
      name: 'peaked',
      displayName: 'Peaked Lapel',
      description: 'Formal peaked lapel style',
      priceModifier: 75.00,
      priceType: 'FIXED' as const,
      position: 2
    }
  ]

  const createdOptions = []
  for (const option of customizationOptions) {
    const created = await prisma.customizationOption.create({
      data: option
    })
    createdOptions.push(created)
  }

  console.log('⚙️ Created customization options:', createdOptions.length)

  // Create homepage content
  const homepage = await prisma.homePage.upsert({
    where: { id: 'homepage-1' },
    update: {},
    create: {
      id: 'homepage-1',
      heroSection: {
        title: 'Sophisticated Suits for the Modern Professional',
        subtitle: 'Custom-tailored business attire designed for women who lead with confidence',
        background_image: '/images/hero-bg.jpg',
        cta_text: 'Design Your Suit',
        cta_link: '/custom-suit'
      },
      featuredProducts: createdProducts.map(p => p.id),
      testimonials: [
        {
          name: 'Sarah Johnson',
          content: 'The perfect fit and exceptional quality. Omaima has transformed my professional wardrobe.',
          rating: 5,
          image: '/images/testimonials/sarah.jpg'
        },
        {
          name: 'Dr. Maria Rodriguez',
          content: 'Outstanding craftsmanship and attention to detail. Highly recommend for professional women.',
          rating: 5,
          image: '/images/testimonials/maria.jpg'
        }
      ],
      aboutSection: {
        title: 'Crafted for Excellence',
        content: 'At Omaima, we believe every professional woman deserves clothing that reflects her ambition and style. Our custom-tailored suits combine traditional craftsmanship with modern design.',
        image: '/images/about-section.jpg'
      }
    }
  })

  console.log('🏠 Created homepage content')

  // Create system settings
  const systemSettings = [
    {
      key: 'site_title',
      value: 'Omaima - Professional Women\\'s Formal Wear'
    },
    {
      key: 'currency',
      value: 'USD'
    },
    {
      key: 'tax_rate',
      value: 0.08
    },
    {
      key: 'shipping_rate',
      value: 15.00
    },
    {
      key: 'free_shipping_threshold',
      value: 200.00
    },
    {
      key: 'customization_enabled',
      value: true
    },
    {
      key: 'max_customization_time_days',
      value: 21
    }
  ]

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }

  console.log('⚙️ Created system settings')

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