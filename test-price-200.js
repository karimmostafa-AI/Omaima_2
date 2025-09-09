// Using Node.js native fetch (available in Node v18+)

async function testPriceMin200() {
  try {
    console.log('=== FETCHING ALL PRODUCTS ===')
    const responseAll = await fetch('http://localhost:3000/api/products')
    const dataAll = await responseAll.json()
    
    console.log('Status:', responseAll.status)
    console.log('Total Products:', dataAll.pagination?.total || 'Unknown')
    console.log('Products returned:', dataAll.products?.length || 0)
    
    if (dataAll.products && dataAll.products.length > 0) {
      console.log('\nAll Products:')
      dataAll.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
      })
    }
    
    console.log('\n=== FETCHING PRODUCTS WITH PRICE FILTER (priceMin=200) ===')
    const responseFiltered = await fetch('http://localhost:3000/api/products?priceMin=200')
    const dataFiltered = await responseFiltered.json()
    
    console.log('Status:', responseFiltered.status)
    console.log('Total Products:', dataFiltered.pagination?.total || 'Unknown')
    console.log('Products returned:', dataFiltered.products?.length || 0)
    
    if (dataFiltered.products && dataFiltered.products.length > 0) {
      console.log('\nFiltered Products (price >= $200):')
      dataFiltered.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
      })
    }
    
    console.log('\n=== ANALYSIS ===')
    const totalAll = dataAll.products?.length || 0
    const totalFiltered = dataFiltered.products?.length || 0
    
    console.log(`Products without filter: ${totalAll}`)
    console.log(`Products with priceMin=200: ${totalFiltered}`)
    
    // Check which products should be filtered out (price < 200)
    const belowMinPrice = dataAll.products?.filter(p => p.price < 200) || []
    const aboveMinPrice = dataAll.products?.filter(p => p.price >= 200) || []
    
    console.log(`\nProducts that should be filtered out (price < $200): ${belowMinPrice.length}`)
    belowMinPrice.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`)
    })
    
    console.log(`\nProducts that should remain (price >= $200): ${aboveMinPrice.length}`)
    aboveMinPrice.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`)
    })
    
    // Verify filtering works correctly
    if (totalFiltered === aboveMinPrice.length) {
      console.log('\n✅ Price filtering is working correctly!')
      
      // Double check all returned products meet the criteria
      const allMeetCriteria = dataFiltered.products?.every(p => p.price >= 200)
      if (allMeetCriteria) {
        console.log('✅ All filtered products have price >= $200')
      } else {
        console.log('❌ Some filtered products have price < $200')
      }
    } else {
      console.log('\n❌ Price filtering is not working correctly')
      console.log(`Expected ${aboveMinPrice.length} products, got ${totalFiltered}`)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testPriceMin200()
