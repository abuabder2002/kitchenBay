const https = require('https');

https.get('https://kitchen-bay-7pf3.vercel.app/api/diag', (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Diagnostic Result:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Failed to parse diagnostic JSON:', e);
      console.log('Response text:', data.substring(0, 2000));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
