const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace equality checks
    content = content.replace(/([a-zA-Z0-9_?.]*email[a-zA-Z0-9_?.]*toLowerCase\(\))\s*===\s*adminEmail\.toLowerCase\(\)/g,
      "[adminEmail.toLowerCase(), 'yousufsuhaily@gmail.com'].includes($1)");

    // Replace inequality checks
    content = content.replace(/([a-zA-Z0-9_?.]*email[a-zA-Z0-9_?.]*toLowerCase\(\))\s*!==\s*adminEmail\.toLowerCase\(\)/g,
      "![adminEmail.toLowerCase(), 'yousufsuhaily@gmail.com'].includes($1)");

    // Replace email 'to' fields
    content = content.replace(/to:\s*adminEmail\s*,/g, "to: [adminEmail, 'yousufsuhaily@gmail.com'].join(','),");

    // Replace bcc fields
    content = content.replace(/bcc:\s*process\.env\.ADMIN_EMAIL \|\| 'admin@Kitchenbay\.com',/g,
      "bcc: [process.env.ADMIN_EMAIL || 'admin@Kitchenbay.com', 'yousufsuhaily@gmail.com'].join(','),");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
