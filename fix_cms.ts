import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const promoSlidesItem = await prisma.siteContent.findFirst({
    where: { key: 'promoSlides' }
  });
  
  if (promoSlidesItem) {
    console.log("Current promoSlides:", promoSlidesItem.value);
    
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

    await prisma.siteContent.update({
      where: { id: promoSlidesItem.id },
      data: { value: JSON.stringify(newSlides) }
    });
    console.log("Updated promoSlides!");
  }

  const mainBannerItem = await prisma.siteContent.findFirst({
    where: { key: 'mainHeroBanner' }
  });

  if (mainBannerItem) {
    console.log("Current mainHeroBanner:", mainBannerItem.value);
    const newMainHero = [
      {
        title: "Collection for Everyday Cooking",
        image: "/images/marketing/everyday_cooking.jpg",
        link: "/products"
      }
    ];

    await prisma.siteContent.update({
      where: { id: mainBannerItem.id },
      data: { value: JSON.stringify(newMainHero) }
    });
    console.log("Updated mainHeroBanner!");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
