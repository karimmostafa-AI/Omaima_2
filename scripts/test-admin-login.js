const { chromium } = require('playwright');

async function testAdminLogin() {
  console.log('🚀 Testing admin login with Playwright...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Login page loaded');
    
    // Fill in admin credentials
    console.log('📧 Entering admin email...');
    await page.fill('input[type="email"]', 'admin@omaima.com');
    
    console.log('🔑 Entering admin password...');
    await page.fill('input[type="password"]', 'admin123');
    
    // Take a screenshot before login
    await page.screenshot({ path: 'before-login.png' });
    
    // Click sign in button
    console.log('🔘 Clicking Sign In button...');
    await page.click('button[type="submit"]');
    
    // Wait for redirect (either to dashboard or admin)
    await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
    
    const currentURL = page.url();
    console.log('✅ Successfully logged in! Redirected to:', currentURL);
    
    // Take a screenshot after login
    await page.screenshot({ path: 'after-login.png' });
    
    // Try to navigate to admin dashboard
    console.log('🏠 Navigating to admin dashboard...');
    await page.goto('http://localhost:3000/admin');
    
    // Wait for admin dashboard content
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    console.log('✅ Admin dashboard loaded successfully!');
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-dashboard.png' });
    
    console.log('\n🎉 Admin Login Test Complete!');
    console.log('═══════════════════════════════════');
    console.log('✅ Admin user is working correctly');
    console.log('📧 Email: admin@omaima.com');
    console.log('🔑 Password: admin123');
    console.log('🏠 Admin Dashboard: http://localhost:3000/admin');
    console.log('═══════════════════════════════════');
    
    // Wait to see the dashboard
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error during admin login test:', error.message);
    await page.screenshot({ path: 'login-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

testAdminLogin().catch(console.error);