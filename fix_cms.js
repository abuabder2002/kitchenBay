const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const newSlides = [
    {
      title: "Quality Assured",
      subtitle: "Trusted Quality Products",
      image: "/images/marketing/everyday_cooking.jpg",
      link: "/products"
    },
    {
      title: "Versatile Kitchen Companion",
      subtitle: "Versatile Collection",
      image: "/images/marketing/dinner_sets.jpg",
      link: "/products?category=versatile"
    },
    {
      title: "Cookware Mastery",
      subtitle: "Making Cookware",
      image: "/images/marketing/gifts.jpg",
      link: "/products?category=decor"
    }
  ];

  const newMainHero = [
    {
      title: "Collection for Everyday Cooking",
      image: "/images/marketing/everyday_cooking.jpg",
      link: "/products"
    }
  ];

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'promoSlides'`,
    [JSON.stringify(newSlides)]
  );
  console.log("Updated promoSlides!");

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'mainHeroBanner'`,
    [JSON.stringify(newMainHero)]
  );
  console.log("Updated mainHeroBanner!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
