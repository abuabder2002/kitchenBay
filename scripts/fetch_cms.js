const http = require('http');

http.get('http://localhost:3000/api/content?page=home', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    require('fs').writeFileSync('cms_output.json', data);
    console.log("CMS data written to cms_output.json");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
