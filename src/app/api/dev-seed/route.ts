import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const defaultHeritage = [
      {
        title: 'Reviving Ancient Kitchen Wisdom',
        paragraph1: 'We journey to traditional clusters across India, from the Kansa makers of West Bengal to the cast-iron Kitchenbays of Tamil Nadu. By bringing their authentic, handcrafted cookware directly to your home, we help preserve generational skills that modern manufacturing has left behind.',
        paragraph2: 'Every utensil is forged with purpose—designed not just to cook food, but to nourish the body according to timeless Ayurvedic principles.',
        image: '/artisan_kitchenware.png'
      }
    ];

    await prisma.siteContent.upsert({
      where: {
        page_section_key: {
          page: 'home',
          section: 'hero',
          key: 'heritage',
        },
      },
      update: {
        value: JSON.stringify(defaultHeritage),
        type: 'JSON',
      },
      create: {
        page: 'home',
        section: 'hero',
        key: 'heritage',
        value: JSON.stringify(defaultHeritage),
        type: 'JSON',
      },
    });

    return NextResponse.json({ success: true, message: 'Database updated successfully' });
  } catch (error: any) {
    require('fs').writeFileSync('C:/Users/yousuf.suhail_cloud-/Desktop/precom/kitchenBay/seed-error.log', error.message + '\n' + error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
