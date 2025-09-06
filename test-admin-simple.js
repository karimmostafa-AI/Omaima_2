const http = require('http');

// Test different admin endpoints
async function testEndpoint(path, description) {
  console.log(`\n🚀 Testing: ${description}`);
  console.log(`   URL: http://localhost:3000${path}`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      // Check for redirects
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(`   🔄 Redirect to: ${res.headers.location}`);
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Content length: ${data.length}`);
        
        // Check if it's an HTML page and what it contains
        if (res.headers['content-type']?.includes('text/html')) {
          if (data.includes('Login') || data.includes('Sign in')) {
            console.log(`   🔐 Contains login form - likely redirected to auth`);
          } else if (data.includes('Dashboard') || data.includes('Admin')) {
            console.log(`   ✅ Contains dashboard content - admin page loaded`);
          }
        }
        
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      console.error(`   ❌ Request Error: ${err.message}`);
      resolve({ error: err.message });
    });

    req.on('timeout', () => {
      console.error(`   ⏰ Request Timeout`);
      req.destroy();
      resolve({ error: 'timeout' });
    });

    req.end();
  });
}

// Test login API
async function testLogin() {
  console.log(`\n🔐 Testing Login API`);
  
  const postData = JSON.stringify({
    email: 'admin@omaima.com',
    password: 'admin123'
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/simple-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`   Login API Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   Login Result:`, result);
          
          if (result.success) {
            console.log(`   ✅ Login successful - User role: ${result.user?.role}`);
          } else {
            console.log(`   ❌ Login failed: ${result.error}`);
          }
        } catch (e) {
          console.log(`   Raw response:`, data);
        }
        
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.error(`   ❌ Login Error: ${err.message}`);
      resolve({ error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Admin Authentication Tests...\n');
  
  // Test all admin endpoints
  await testEndpoint('/admin-no-auth', 'No-Auth Admin Page');
  await testEndpoint('/admin-simple', 'Simple Admin Page');  
  await testEndpoint('/admin', 'Main Admin Page');
  await testEndpoint('/auth/direct-login', 'Direct Login Page');
  await testEndpoint('/auth/login', 'Standard Login Page');
  
  // Test login API
  await testLogin();
  
  console.log('\n✅ All tests completed!');
  console.log('\nAnalysis:');
  console.log('- If admin pages redirect to auth pages, there are auth wrapper issues');
  console.log('- If login API fails, there are authentication issues');
  console.log('- If no-auth page works, the dashboard UI itself is fine');
}

runTests().catch(console.error);
