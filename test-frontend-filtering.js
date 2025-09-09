// Test frontend products page with filters

async function testFrontendFiltering() {
  console.log('🧪 TESTING FRONTEND PRODUCT FILTERING\n')

  // Test different scenarios
  const testCases = [
    { 
      name: 'Products page without filter', 
      url: 'http://localhost:3000/products',
      expected: '7 products' 
    },
    { 
      name: 'Products page with priceMin=200', 
      url: 'http://localhost:3000/products?priceMin=200',
      expected: '3 products >= $200' 
    },
    { 
      name: 'Products page with priceMax=200', 
      url: 'http://localhost:3000/products?priceMax=200',
      expected: '4 products <= $200' 
    },
    { 
      name: 'Products page with search=suit', 
      url: 'http://localhost:3000/products?search=suit',
      expected: 'Products containing "suit"' 
    },
    { 
      name: 'Products page with price range', 
      url: 'http://localhost:3000/products?priceMin=150&priceMax=200',
      expected: 'Products between $150-$200' 
    }
  ]

  for (const testCase of testCases) {
    try {
      console.log(`=== ${testCase.name.toUpperCase()} ===`)
      
      // Fetch the HTML page
      const response = await fetch(testCase.url)
      const html = await response.text()
      
      console.log(`Status: ${response.status}`)
      console.log(`URL: ${testCase.url}`)
      console.log(`Expected: ${testCase.expected}`)
      
      // Check if the page loads successfully
      if (response.status === 200) {
        console.log('✅ Page loads successfully')
        
        // Basic checks for HTML structure
        if (html.includes('Women\'s Suits & Uniforms')) {
          console.log('✅ Page title found')
        } else {
          console.log('❌ Page title not found')
        }
        
        if (html.includes('Showing')) {
          console.log('✅ Results summary section found')
        } else {
          console.log('❌ Results summary section not found')
        }
        
        // Check for filter controls
        if (html.includes('Price Range') || html.includes('priceMin')) {
          console.log('✅ Filter controls detected')
        } else {
          console.log('❌ Filter controls not detected')
        }
        
      } else {
        console.log(`❌ Page failed to load: HTTP ${response.status}`)
      }
      
      console.log('') // Empty line for readability
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error.message)
      console.log('')
    }
  }

  // Test if the server-side filtering is working by checking built HTML
  console.log('=== CHECKING SERVER-SIDE FILTERING ===')
  try {
    const unfilteredResponse = await fetch('http://localhost:3000/products')
    const filteredResponse = await fetch('http://localhost:3000/products?priceMin=200')
    
    const unfilteredHtml = await unfilteredResponse.text()
    const filteredHtml = await filteredResponse.text()
    
    // Count product cards in HTML (rough estimation)
    const unfilteredProducts = (unfilteredHtml.match(/text-lg font-medium text-gray-900/g) || []).length
    const filteredProducts = (filteredHtml.match(/text-lg font-medium text-gray-900/g) || []).length
    
    console.log(`Unfiltered page product count: ${unfilteredProducts}`)
    console.log(`Filtered page product count: ${filteredProducts}`)
    
    if (filteredProducts < unfilteredProducts && filteredProducts > 0) {
      console.log('✅ Server-side filtering appears to be working!')
      console.log('✅ Filtered page shows fewer products than unfiltered page')
    } else if (filteredProducts === unfilteredProducts) {
      console.log('❌ Server-side filtering might not be working - same number of products')
    } else {
      console.log('⚠️ Unable to determine filtering status from HTML content')
    }
    
  } catch (error) {
    console.error('Error checking server-side filtering:', error.message)
  }
}

testFrontendFiltering()
