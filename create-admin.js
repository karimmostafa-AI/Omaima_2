// Simple script to create admin user
const http = require('http');

function createAdmin() {
  const postData = JSON.stringify({
    email: 'admin@omaima.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/setup-admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Creating admin user...');

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
          console.log('✅ Admin user created successfully!');
          console.log('Email: admin@omaima.com');
          console.log('Password: admin123');
          console.log('Login at: http://localhost:3000/auth/login');
        } else {
          console.log('❌ Error creating admin user:', response.error);
        }
      } catch (e) {
        console.log('❌ Response parsing error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Failed to create admin user:', error.message);
    console.log('Make sure the development server is running at http://localhost:3000');
  });

  req.write(postData);
  req.end();
}

createAdmin();
