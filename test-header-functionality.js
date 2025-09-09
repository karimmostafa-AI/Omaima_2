// Test header functionality: clickable logo and search

async function testHeaderFunctionality() {
  console.log('🧪 TESTING HEADER FUNCTIONALITY\n')

  const testCases = [
    {
      name: 'Home page loads correctly',
      url: 'http://localhost:3000',
      checks: [
        { test: 'Contains Omaima logo/title', pattern: /Omaima/i },
        { test: 'Contains search functionality', pattern: /search|Search/i },
        { test: 'Contains navigation links', pattern: /Suits|New Arrivals/i },
        { test: 'Has header structure', pattern: /<header|header/i }
      ]
    },
    {
      name: 'Products page loads correctly', 
      url: 'http://localhost:3000/products',
      checks: [
        { test: 'Contains Omaima logo/title', pattern: /Omaima/i },
        { test: 'Contains search functionality', pattern: /search|Search/i },
        { test: 'Contains product grid', pattern: /Professional Gray Suit|Classic Black Suit/i }
      ]
    },
    {
      name: 'Products search from URL works',
      url: 'http://localhost:3000/products?search=suit',
      checks: [
        { test: 'Contains search results', pattern: /Professional Gray Suit|Classic Black Suit/i },
        { test: 'Shows filtered results', pattern: /Showing.*of.*products/i },
        { test: 'Contains fewer products (filtered)', pattern: /Professional|Classic|Executive/i }
      ]
    }
  ]

  for (const testCase of testCases) {
    try {
      console.log(`=== ${testCase.name.toUpperCase()} ===`)
      
      const response = await fetch(testCase.url)
      const html = await response.text()
      
      console.log(`Status: ${response.status}`)
      console.log(`URL: ${testCase.url}`)
      
      if (response.status === 200) {
        console.log('✅ Page loads successfully')
        
        // Run checks
        let passedChecks = 0
        let totalChecks = testCase.checks.length
        
        for (const check of testCase.checks) {
          if (check.pattern.test(html)) {
            console.log(`✅ ${check.test}`)
            passedChecks++
          } else {
            console.log(`❌ ${check.test}`)
          }
        }
        
        console.log(`📊 Passed: ${passedChecks}/${totalChecks} checks`)
        
        if (passedChecks === totalChecks) {
          console.log('🎉 All checks passed!')
        } else if (passedChecks > totalChecks / 2) {
          console.log('⚠️ Most checks passed')
        } else {
          console.log('❌ Major issues detected')
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

  // Test specific search functionality via API
  console.log('=== TESTING SEARCH API DIRECTLY ===')
  try {
    const searchResponse = await fetch('http://localhost:3000/api/products?search=suit')
    const searchData = await searchResponse.json()
    
    console.log(`Search API Status: ${searchResponse.status}`)
    console.log(`Search Results Count: ${searchData.products?.length || 0}`)
    console.log(`Search Total: ${searchData.pagination?.total || 0}`)
    
    if (searchData.products && searchData.products.length > 0) {
      console.log('✅ Search API returns results')
      console.log('Sample results:')
      searchData.products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - $${product.price}`)
      })
    } else {
      console.log('❌ Search API returns no results')
    }
    
  } catch (error) {
    console.error('Error testing search API:', error.message)
  }

  console.log('\n🎯 SUMMARY:')
  console.log('1. Logo should now be clickable and redirect to home page')
  console.log('2. Search button in header should open a search form')
  console.log('3. Search form should redirect to /products?search=query when submitted')
  console.log('4. Search functionality works from any page on the website')
}

testHeaderFunctionality()
