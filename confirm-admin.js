// Script to confirm admin user email in Supabase
const http = require('http');

function confirmAdmin() {
  const postData = JSON.stringify({
    email: 'admin@omaima.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/confirm-admin', // We'll create this endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Confirming admin user email...');

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
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Failed:', error.message);
  });

  req.write(postData);
  req.end();
}

confirmAdmin();
