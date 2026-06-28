const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  '#556B2F': 'var(--color-brand-accent)',
  '#4A5D23': 'var(--color-brand-accent-hover)',
  '#C19A6B': 'var(--color-brand-accent-yellow)',
  '#A08055': 'var(--color-brand-accent-yellow-hover)',
  '#F7F2E8': 'var(--color-brand-bg)',
  '#F0EAD6': 'var(--color-brand-card)',
  '#4A3B32': 'var(--color-brand-text)',
  '#8C7B6D': 'var(--color-brand-muted)',
  '#E6DBC4': 'var(--color-brand-border)',
  '#3E322A': 'var(--color-brand-top-bar)'
};

for (const [hex, cssVar] of Object.entries(replacements)) {
  const regex = new RegExp(hex, 'g');
  content = content.replace(regex, cssVar);
}

fs.writeFileSync(filePath, content);
console.log("Colors replaced successfully.");
