require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const products = await prisma.product.findMany({ take: 3 });
    console.log('SUCCESS:', products.length, 'product(s)');
    if (products[0]) {
      console.log('Sample product:', JSON.stringify({ id: products[0].id, name: products[0].name, price: products[0].price, category: products[0].category }));
    }
  } catch (err) {
    console.error('PRISMA ERROR:', err.message);
    console.error('FULL ERROR:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
