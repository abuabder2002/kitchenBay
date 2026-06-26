const http = require('http');

http.get('http://localhost:3000/api/products', (res) => {
  console.log('Local API Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Local products count:', Array.isArray(json) ? json.length : 'not an array');
      if (Array.isArray(json) && json.length > 0) {
        console.log('Sample local product:', {
          id: json[0].id,
          name: json[0].name,
          price: json[0].price
        });
      } else {
        console.log('Local response:', data.substring(0, 500));
      }
    } catch (e) {
      console.error('Failed to parse local JSON:', e);
      console.log('Local response text:', data.substring(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error('Local connection error:', err.message);
});
