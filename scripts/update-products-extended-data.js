// Script to update existing products with extended filtering data

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sampleData = {
  materials: {
    'Professional Gray Suit': 'wool,polyester',
    'Elegant Evening Dress': 'silk,polyester', 
    'Navy Blazer': 'wool,cotton',
    'Classic Black Suit': 'wool,polyester',
    'Professional Dress': 'cotton,polyester',
    'Classic Blazer': 'cotton,linen',
    'Executive Business Suit': 'wool,silk'
  },
  sizes: {
    'Professional Gray Suit': 'xs,s,m,l,xl,xxl',
    'Elegant Evening Dress': 's,m,l,xl',
    'Navy Blazer': 'xs,s,m,l,xl',
    'Classic Black Suit': 'xs,s,m,l,xl,xxl',
    'Professional Dress': 's,m,l,xl,xxl',
    'Classic Blazer': 'xs,s,m,l,xl',
    'Executive Business Suit': 's,m,l,xl,xxl'
  },
  colors: {
    'Professional Gray Suit': 'gray,black',
    'Elegant Evening Dress': 'black,navy',
    'Navy Blazer': 'navy,blue',
    'Classic Black Suit': 'black,gray',
    'Professional Dress': 'black,navy,white',
    'Classic Blazer': 'gray,brown,black',
    'Executive Business Suit': 'black,navy,gray'
  },
  productTypes: {
    'Professional Gray Suit': { isCustomizable: true, isReadyMade: true },
    'Elegant Evening Dress': { isCustomizable: false, isReadyMade: true },
    'Navy Blazer': { isCustomizable: true, isReadyMade: true },
    'Classic Black Suit': { isCustomizable: true, isReadyMade: true },
    'Professional Dress': { isCustomizable: false, isReadyMade: true },
    'Classic Blazer': { isCustomizable: true, isReadyMade: true },
    'Executive Business Suit': { isCustomizable: true, isReadyMade: false }
  }
}

async function updateProductsExtendedData() {
  try {
    console.log('🔄 Updating products with extended filtering data...')
    
    // Get all existing products
    const products = await prisma.product.findMany()
    console.log(`Found ${products.length} products to update`)
    
    let updated = 0
    
    for (const product of products) {
      const materials = sampleData.materials[product.name] || 'cotton,polyester'
      const sizes = sampleData.sizes[product.name] || 's,m,l,xl'
      const colors = sampleData.colors[product.name] || 'black,white'
      const types = sampleData.productTypes[product.name] || { isCustomizable: false, isReadyMade: true }
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          materials: materials,
          sizes: sizes,
          colors: colors,
          isCustomizable: types.isCustomizable,
          isReadyMade: types.isReadyMade
        }
      })
      
      console.log(`✅ Updated: ${product.name}`)
      console.log(`   Materials: ${materials}`)
      console.log(`   Sizes: ${sizes}`)
      console.log(`   Colors: ${colors}`)
      console.log(`   Customizable: ${types.isCustomizable}, Ready-made: ${types.isReadyMade}`)
      console.log('')
      
      updated++
    }
    
    console.log(`🎉 Successfully updated ${updated} products with extended filtering data!`)
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const updatedProducts = await prisma.product.findMany({
      select: {
        name: true,
        materials: true,
        sizes: true,
        colors: true,
        isCustomizable: true,
        isReadyMade: true
      }
    })
    
    console.log('Updated products:')
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.materials} | ${product.sizes} | ${product.colors} | Custom: ${product.isCustomizable} | Ready: ${product.isReadyMade}`)
    })
    
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductsExtendedData()
