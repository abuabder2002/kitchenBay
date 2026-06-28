const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(`SELECT id, name, image FROM "Product" LIMIT 5`);
  console.log("Sample product images:");
  res.rows.forEach(r => {
    const imgPreview = r.image ? r.image.substring(0, 80) : 'NULL';
    console.log(`  ID: ${r.id}`);
    console.log(`  Name: ${r.name.slice(0, 40)}`);
    console.log(`  Image (first 80 chars): ${imgPreview}`);
    console.log(`  Image length: ${r.image ? r.image.length : 0}`);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => pool.end());
