const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const newMainHero = [
    {
      title: "Collection for Everyday Cooking",
      image: "/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg",
      link: "/products"
    }
  ];

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'mainHeroBanner'`,
    [JSON.stringify(newMainHero)]
  );
  console.log("Restored mainHeroBanner image!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
