// Using Node.js native fetch (available in Node v18+)

async function testEndpoints() {
  try {
    console.log('=== FETCHING PRODUCTS WITHOUT FILTER ===')
    const response1 = await fetch('http://localhost:3000/api/products')
    const data1 = await response1.json()
    
    console.log('Status:', response1.status)
    console.log('Total Products:', data1.pagination?.total || 'Unknown')
    console.log('Products returned:', data1.products?.length || 0)
    
    if (data1.products && data1.products.length > 0) {
      console.log('\nProduct Details:')
      data1.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
      })
    }
    
    console.log('\n=== FETCHING PRODUCTS WITH PRICE FILTER (priceMin=225) ===')
    const response2 = await fetch('http://localhost:3000/api/products?priceMin=225')
    const data2 = await response2.json()
    
    console.log('Status:', response2.status)
    console.log('Total Products:', data2.pagination?.total || 'Unknown')
    console.log('Products returned:', data2.products?.length || 0)
    
    if (data2.products && data2.products.length > 0) {
      console.log('\nFiltered Product Details:')
      data2.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
      })
    }
    
    console.log('\n=== COMPARISON ===')
    const totalWithoutFilter = data1.products?.length || 0
    const totalWithFilter = data2.products?.length || 0
    
    console.log(`Products without filter: ${totalWithoutFilter}`)
    console.log(`Products with priceMin=225: ${totalWithFilter}`)
    
    if (totalWithoutFilter > totalWithFilter) {
      console.log('✅ Price filtering is working - fewer products returned with filter')
    } else if (totalWithoutFilter === totalWithFilter && totalWithFilter > 0) {
      console.log('⚠️  Price filtering might not be working - same number of products returned')
      // Check if all filtered products have price >= 225
      const allAboveMinPrice = data2.products?.every(p => p.price >= 225)
      if (allAboveMinPrice) {
        console.log('✅ But all returned products have price >= 225, so filter is working correctly')
      } else {
        console.log('❌ Some products have price < 225, filter is not working')
      }
    } else {
      console.log('❌ No products found - there might be an issue')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testEndpoints()
