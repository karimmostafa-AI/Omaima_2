// Using Node.js native fetch (available in Node v18+)

async function testFilters() {
  console.log('🧪 COMPREHENSIVE FILTERING TESTS\n')

  // Test cases
  const testCases = [
    { name: 'No Filter', url: 'http://localhost:3000/api/products', expected: 'All 7 products' },
    { name: 'Price Min 200', url: 'http://localhost:3000/api/products?priceMin=200', expected: '3 products >= $200' },
    { name: 'Price Min 300', url: 'http://localhost:3000/api/products?priceMin=300', expected: '3 products >= $300' },
    { name: 'Price Max 200', url: 'http://localhost:3000/api/products?priceMax=200', expected: '4 products <= $200' },
    { name: 'Price Range 150-200', url: 'http://localhost:3000/api/products?priceMin=150&priceMax=200', expected: '3 products between $150-$200' },
    { name: 'Search "suit"', url: 'http://localhost:3000/api/products?search=suit', expected: 'Products containing "suit"' },
    { name: 'Sort by price asc', url: 'http://localhost:3000/api/products?sortBy=price&sortOrder=asc', expected: 'Products sorted by price ascending' },
    { name: 'Sort by price desc', url: 'http://localhost:3000/api/products?sortBy=price&sortOrder=desc', expected: 'Products sorted by price descending' },
  ]

  for (const testCase of testCases) {
    try {
      console.log(`=== ${testCase.name.toUpperCase()} ===`)
      const response = await fetch(testCase.url)
      const data = await response.json()
      
      console.log(`Status: ${response.status}`)
      console.log(`URL: ${testCase.url}`)
      console.log(`Expected: ${testCase.expected}`)
      console.log(`Total Products: ${data.pagination?.total || 'Unknown'}`)
      console.log(`Products returned: ${data.products?.length || 0}`)
      
      if (data.products && data.products.length > 0) {
        console.log('Products:')
        data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
        })
        
        // Specific validations
        if (testCase.name.includes('Price Min')) {
          const minPrice = parseInt(testCase.url.match(/priceMin=(\d+)/)[1])
          const allAboveMin = data.products.every(p => p.price >= minPrice)
          console.log(`✅ All products >= $${minPrice}: ${allAboveMin}`)
        }
        
        if (testCase.name.includes('Price Max')) {
          const maxPrice = parseInt(testCase.url.match(/priceMax=(\d+)/)[1])
          const allBelowMax = data.products.every(p => p.price <= maxPrice)
          console.log(`✅ All products <= $${maxPrice}: ${allBelowMax}`)
        }
        
        if (testCase.name.includes('Range')) {
          const minPrice = parseInt(testCase.url.match(/priceMin=(\d+)/)[1])
          const maxPrice = parseInt(testCase.url.match(/priceMax=(\d+)/)[1])
          const allInRange = data.products.every(p => p.price >= minPrice && p.price <= maxPrice)
          console.log(`✅ All products between $${minPrice}-$${maxPrice}: ${allInRange}`)
        }
        
        if (testCase.name.includes('Search')) {
          const searchTerm = testCase.url.match(/search=([^&]+)/)[1]
          const allContainSearch = data.products.every(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          console.log(`✅ All products contain "${searchTerm}": ${allContainSearch}`)
        }
        
        if (testCase.name.includes('Sort')) {
          const sortOrder = testCase.url.includes('desc') ? 'desc' : 'asc'
          const prices = data.products.map(p => p.price)
          const isSorted = sortOrder === 'asc' 
            ? prices.every((price, i) => i === 0 || price >= prices[i-1])
            : prices.every((price, i) => i === 0 || price <= prices[i-1])
          console.log(`✅ Products sorted ${sortOrder}: ${isSorted}`)
        }
      } else {
        console.log('No products returned')
      }
      
      console.log('') // Empty line for readability
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error.message)
      console.log('')
    }
  }
}

testFilters()
