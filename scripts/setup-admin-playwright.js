const { chromium } = require('playwright');

async function setupAdmin() {
  console.log('🚀 Starting automated admin setup with Playwright...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Set to true if you don't want to see the browser
    slowMo: 1000 // Add delay for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to admin setup page...');
    
    // Navigate to the admin setup page
    await page.goto('http://localhost:3000/setup-admin', { waitUntil: 'networkidle' });
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'page-loaded.png' });
    console.log('📸 Page loaded screenshot saved');
    
    // Check if we're on the correct page
    const pageContent = await page.content();
    console.log('📄 Page title:', await page.title());
    
    // Wait for the page to load with a more flexible selector
    try {
      await page.waitForSelector('h1', { timeout: 10000 });
      const h1Text = await page.locator('h1').first().textContent();
      console.log('📝 Found H1 text:', h1Text);
    } catch (e) {
      console.log('⚠️ No H1 found, checking for any content...');
      const bodyText = await page.locator('body').textContent();
      console.log('📄 Body content preview:', bodyText.substring(0, 200));
    }
    
    // Look for admin setup specific content
    const adminSetupText = page.locator('text=Admin Setup');
    if (await adminSetupText.isVisible().catch(() => false)) {
      console.log('✅ Admin setup page loaded successfully');
    } else {
      console.log('⚠️ Admin setup text not found, looking for create admin button...');
    }
    
    // Look for the "Create Admin User" button with more flexible selectors
    let createButton;
    
    // Try different button selectors
    const buttonSelectors = [
      'button:has-text("Create Admin User")',
      'button[type="button"]',
      'button',
      'text=Create Admin User'
    ];
    
    for (const selector of buttonSelectors) {
      try {
        createButton = page.locator(selector).first();
        if (await createButton.isVisible({ timeout: 2000 })) {
          const buttonText = await createButton.textContent();
          console.log(`📮 Found button with text: "${buttonText}"`);
          if (buttonText.includes('Create Admin User') || buttonText.includes('Creating Admin User')) {
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Check if button is in loading state
    const buttonText = await createButton.textContent().catch(() => '');
    if (buttonText.includes('Creating Admin User')) {
      console.log('🔄 Button is already in loading state, waiting for completion...');
    } else if (buttonText.includes('Create Admin User')) {
      console.log('🔘 Clicking "Create Admin User" button...');
      await createButton.click();
    } else {
      throw new Error('Create Admin User button not found or not clickable');
    }
    
    // Wait for either success or error message
    try {
      await page.waitForSelector('text=Admin User Ready!', { timeout: 15000 });
      console.log('✅ Admin user created successfully!');
      
      // Take a screenshot for verification
      await page.screenshot({ path: 'admin-setup-success.png' });
      console.log('📸 Screenshot saved as admin-setup-success.png');
      
    } catch (successError) {
      // Check if admin already exists
      const existsMessage = page.locator('text=Admin user already exists');
      if (await existsMessage.isVisible().catch(() => false)) {
        console.log('ℹ️ Admin user already exists');
      } else {
        // Take screenshot for debugging
        await page.screenshot({ path: 'admin-setup-after-click.png' });
        console.log('📸 After-click screenshot saved for debugging');
        throw successError;
      }
    }
    
    // Wait a bit to see the success screen
    await page.waitForTimeout(2000);
    
    console.log('\n🎉 Admin Setup Complete!');
    console.log('═══════════════════════════════════');
    console.log('📧 Email: admin@omaima.com');
    console.log('🔑 Password: admin123');
    console.log('🚪 Login URL: http://localhost:3000/auth/login');
    console.log('🏠 Admin Dashboard: http://localhost:3000/admin');
    console.log('═══════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error during admin setup:', error.message);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'admin-setup-error.png' });
    console.log('📸 Error screenshot saved as admin-setup-error.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the setup
setupAdmin().catch(console.error);