const http = require('http');

const postData = JSON.stringify({
  order: {
    id: '123',
    customer: 'Test User',
    email: 'test@example.com',
    items: [],
    subtotal: 100,
    cgstAmount: 0,
    sgstAmount: 0,
    total: 100
  },
  status: 'processing'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
