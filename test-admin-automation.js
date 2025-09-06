const { chromium } = require('playwright');

async function testAdminAuthentication() {
  console.log('🎭 Starting Playwright automation test...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down actions
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    console.log(`🌐 Browser Console [${msg.type()}]:`, msg.text());
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  // Listen for network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/auth/') || url.includes('/admin') || url.includes('/api/')) {
      console.log(`📡 Request: ${request.method()} ${url}`);
    }
  });
  
  // Listen for responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/auth/') || url.includes('/admin') || url.includes('/api/')) {
      console.log(`📨 Response: ${response.status()} ${url}`);
    }
  });
  
  try {
    console.log('\n🚀 Step 1: Testing No-Auth Admin Page...');
    await page.goto('http://localhost:3000/admin-no-auth');
    await page.waitForTimeout(3000);
    console.log('✅ Current URL:', page.url());
    
    console.log('\n🚀 Step 2: Testing Direct Login Page...');
    await page.goto('http://localhost:3000/auth/direct-login');
    await page.waitForTimeout(2000);
    console.log('✅ Current URL:', page.url());
    
    // Fill in admin credentials
    console.log('📝 Filling in admin credentials...');
    await page.fill('#email', 'admin@omaima.com');
    await page.fill('#password', 'admin123');
    
    console.log('🔐 Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect
    await page.waitForTimeout(5000);
    console.log('✅ After login URL:', page.url());
    
    // Check if we're still on login page (indicates redirect loop)
    if (page.url().includes('/auth/')) {
      console.log('❌ REDIRECT LOOP DETECTED! Still on auth page after login.');
    } else {
      console.log('✅ Login successful! Redirected to:', page.url());
    }
    
    console.log('\n🚀 Step 3: Testing Main Admin Page Directly...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(5000);
    console.log('✅ Admin page URL:', page.url());
    
    if (page.url().includes('/auth/')) {
      console.log('❌ Main admin page redirected to auth - auth wrapper is active');
    } else {
      console.log('✅ Admin page loaded successfully');
    }
    
    console.log('\n🚀 Step 4: Testing Simplified Admin Page...');
    await page.goto('http://localhost:3000/admin-simple');
    await page.waitForTimeout(5000);
    console.log('✅ Admin-simple page URL:', page.url());
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'admin-test-screenshot.png', fullPage: true });
    
    console.log('\n🎭 Test completed! Check the console output above for details.');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testAdminAuthentication().catch(console.error);
