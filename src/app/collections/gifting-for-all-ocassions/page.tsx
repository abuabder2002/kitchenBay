/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getGiftingProducts() {
  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return dbProducts.map(p => {
      const basePrice = p.price / 100;
      const finalPrice = basePrice;
      const originalPrice = p.discountPrice ? p.discountPrice / 100 : finalPrice;
      const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
      return {
        id: p.id, name: p.name, description: p.description, price: basePrice,
        originalPrice, finalPrice, discount, gstPercent: p.gstPercent,
        stock: p.stock, category: p.category, subcategory: p.subcategory || p.category,
        material: p.material || 'Standard', image: p.image, subImages: p.subImages,
        rating: p.rating, reviewCount: p.reviewCount, featured: p.featured, isFromDb: true
      };
    });
  } catch {
    return [];
  }
}

export default async function GiftingPage() {
  const giftingProducts = await getGiftingProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1">
        {/* Banner */}
        <section className="relative w-full h-[400px] md:h-[500px]">
          <img 
            src="/images/marketing/everyday_cooking.jpg"
            alt="Traditional Gifting" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-heading)] font-bold mb-6">Traditional Gifting. Meaningful Connections.</h1>
            <p className="max-w-3xl text-sm md:text-base lg:text-lg leading-relaxed">
              Discover unique gifting ideas for every occasion with our handcrafted collection of heritage brass, copper, and wooden gifts. Whether you're celebrating a wedding, housewarming, Diwali, Navratri, birthday, or corporate occasion, our handcrafted and eco-friendly gift collection blends traditional Indian craftsmanship with sustainable gifting design, perfect for all occasions and return gifts.
            </p>
            <button className="mt-8 px-6 py-3 bg-white text-gray-900 font-bold uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors shadow-lg">
              Contact Us for Bulk Order
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-center text-[--color-brand-text] mb-12">Unique Offerings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="#" className="group block">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative mb-4 shadow-md">
                <img src="/images/marketing/casserole_banner.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Prarambha Wedding Gift Collection" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-center text-[--color-brand-text] group-hover:text-blue-600 transition-colors">Prarambha Wedding Gift Collection</h3>
            </Link>
            <Link href="#" className="group block">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative mb-4 shadow-md">
                <img src="/images/marketing/everyday_cooking_collection.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Festival & Corporate Gifting" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-center text-[--color-brand-text] group-hover:text-blue-600 transition-colors">Festival & Corporate Gifting</h3>
            </Link>
            <Link href="#" className="group block">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative mb-4 shadow-md">
                <img src="/images/marketing/culinary_prep.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Return & Welcome Gifts" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-center text-[--color-brand-text] group-hover:text-blue-600 transition-colors">Return & Welcome Gifts</h3>
            </Link>
          </div>
        </section>

        {/* Why Gifting */}
        <section className="bg-slate-900 text-white py-16">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-center mb-12">WHY OUR GIFTING?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-200">Sustainable & Timeless</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Traditionally designed products that are built to last generations.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-200">Curated with Care</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Thoughtfully designed combos for festivals, weddings, milestones, and corporate occasions.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-200">Bulk Order Friendly</h3>
                <p className="text-slate-300 leading-relaxed font-medium">Flexible order sizes, personalized notes, and elegant eco-friendly packaging.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-center text-[--color-brand-text] mb-12">For Bulk Orders</h2>
          {giftingProducts.length === 0 ? (
            <p className="text-center text-[--color-brand-muted] py-16">No products available yet. Add products from the Admin Panel.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {giftingProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
