const { chromium } = require('playwright');

async function setupAdmin() {
  console.log('🚀 Starting automated admin setup...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to setup page...');
    await page.goto('http://localhost:3000/setup-admin', { waitUntil: 'networkidle' });
    
    console.log('🔘 Clicking create admin button...');
    await page.click('button:has-text("Create Admin User")');
    
    // Wait for success or error message
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    
    const alertText = await page.textContent('[role="alert"]');
    console.log('📝 Response:', alertText);
    
    if (alertText.includes('successfully') || alertText.includes('already exists')) {
      console.log('✅ Admin setup completed!');
      console.log('\n🎉 Admin Login Credentials:');
      console.log('Email: admin@omaima.com');
      console.log('Password: admin123');
      console.log('Login URL: http://localhost:3000/auth/login');
    } else {
      console.log('❌ Setup failed:', alertText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

setupAdmin();