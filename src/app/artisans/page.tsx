import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ArtisansPage() {
  const artisans = [
    { name: 'Ramesh Kumar', craft: 'Bidriware Artisan', location: 'Karnataka', bio: 'A 4th generation artisan preserving the 500-year-old silver inlay craft of Bidar.', img: 'https://images.unsplash.com/photo-1532054992523-28f09d846065?q=80&w=600&auto=format&fit=crop' },
    { name: 'Saraswati Devi', craft: 'Terracotta Potter', location: 'Rajasthan', bio: 'Her hands have shaped earth into beautiful, functional cookware for over three decades.', img: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mohammad Ali', craft: 'Block Printer', location: 'Gujarat', bio: 'Master of Ajrakh printing, using natural dyes extracted from madder, indigo, and pomegranate.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Lakshmi Narayan', craft: 'Brass Engraver', location: 'Uttar Pradesh', bio: 'Creating intricate designs on brassware that have been passed down for centuries.', img: 'https://images.unsplash.com/photo-1455274111113-575d080ce8cd?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="bg-brand-card py-20 text-center px-4 border-b border-gray-100">
          <span className="text-brand-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4 block">The Hands Behind The Craft</span>
          <h1 className="font-serif text-5xl font-bold text-brand-text mb-6">Meet Our Artisans</h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            Discover the stories, the dedication, and the incredible skill of the people who make our products.
          </p>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-16">
            {artisans.map((artisan, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-8 items-center sm:items-start group bg-brand-card/50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-40 h-40 rounded-full overflow-hidden shrink-0 shadow-lg relative">
                  <img src={artisan.img} alt={artisan.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-serif text-3xl font-bold text-brand-text mb-2">{artisan.name}</h3>
                  <p className="text-brand-accent font-medium mb-1">{artisan.craft}</p>
                  <p className="text-brand-muted text-xs mb-4 uppercase tracking-wider">{artisan.location}</p>
                  <p className="text-brand-text leading-relaxed mb-6">{artisan.bio}</p>
                  <Link href="/products" className="inline-block border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors px-6 py-2.5 rounded font-medium text-sm">
                    View Collection
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
