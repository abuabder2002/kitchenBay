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
      image: "/artisan_kitchenware.png",
      link: "/products"
    },
    {
      title: "Versatile Kitchen Companion",
      subtitle: "Versatile Collection",
      image: "/artisan_crafting_brass.png",
      link: "/products?category=versatile"
    },
    {
      title: "Cookware Mastery",
      subtitle: "Making Cookware",
      image: "/artisan_hammering_copper.png",
      link: "/products?category=decor"
    }
  ];

  const newMainHero = [
    {
      title: "Collection for Everyday Cooking",
      image: "/artisan_kitchenware_hero.png",
      link: "/products"
    }
  ];

  const newTestimonials = [
    { name: "Michelle Rose", text: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1", productImg: "/artisan_kitchenware.png" },
    { name: "Paras Chugh", text: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!", rating: 5, avatar: "https://i.pravatar.cc/150?img=11", productImg: "/artisan_crafting_brass.png" },
    { name: "Prabhas Upadhyay", text: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.", rating: 5, avatar: "https://i.pravatar.cc/150?img=33", productImg: "/artisan_hammering_copper.png" },
    { name: "Jayavant Jadhav", text: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!", rating: 5, avatar: "https://i.pravatar.cc/150?img=60", productImg: "/artisan_forging_cast_iron.png" },
  ];

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'promoSlides'`,
    [JSON.stringify(newSlides)]
  );
  console.log("Updated promoSlides in DB!");

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'mainHeroBanner'`,
    [JSON.stringify(newMainHero)]
  );
  console.log("Updated mainHeroBanner in DB!");

  await pool.query(
    `UPDATE "SiteContent" SET value = $1 WHERE key = 'testimonials'`,
    [JSON.stringify(newTestimonials)]
  );
  console.log("Updated testimonials in DB!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
