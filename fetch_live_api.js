const https = require('https');

https.get('https://kitchen-bay-7pf3.vercel.app/api/products', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Returned products count:', Array.isArray(json) ? json.length : 'not an array');
      if (Array.isArray(json) && json.length > 0) {
        console.log('Sample product:', {
          id: json[0].id,
          name: json[0].name,
          price: json[0].price,
          image: json[0].image ? json[0].image.substring(0, 50) + '...' : null
        });
      } else {
        console.log('Response content:', data.substring(0, 1000));
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Response text:', data.substring(0, 2000));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
