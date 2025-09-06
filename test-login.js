// Test admin login
const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@omaima.com',
    password: 'admin123'
  });

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

  console.log('Testing admin login...');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Login successful!');
          if (response.user && response.user.role === 'ADMIN') {
            console.log('✅ Admin role confirmed!');
          }
        } else {
          console.log('❌ Login failed:', response.error);
        }
      } catch (e) {
        console.log('❌ Response parsing error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Login test failed:', error.message);
    console.log('Make sure the development server is running at http://localhost:3000');
  });

  req.write(postData);
  req.end();
}

testLogin();
