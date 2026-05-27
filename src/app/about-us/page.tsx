'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Award, Users, Leaf, Heart } from 'lucide-react';

export default function AboutUsPage() {
  const stats = [
    { value: '5,000+', label: 'Artisans Empowered' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '28', label: 'States Reached' },
    { value: '200+', label: 'Unique Products' },
  ];

  const values = [
    { icon: <Award size={28} className="text-yellow-500" />, title: 'Authentic Craftsmanship', desc: 'Every product is made by certified artisans using traditional methods passed down through generations.' },
    { icon: <Leaf size={28} className="text-green-600" />, title: 'Sustainable Materials', desc: 'We use only natural, eco-friendly materials — clay, brass, cast iron, copper, and soapstone.' },
    { icon: <Users size={28} className="text-blue-600" />, title: 'Community First', desc: 'Our platform directly empowers rural artisan communities by ensuring fair wages and ethical trade.' },
    { icon: <Heart size={28} className="text-red-500" />, title: 'Made With Love', desc: 'Each item carries the soul and story of the artisan who made it. We\'re proud to share those stories with you.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative bg-blue-950 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-4">Our Story</p>
            <h1 className="text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">Celebrating India's<br />Artisan Heritage</h1>
            <p className="text-blue-200 text-xl max-w-2xl mx-auto leading-relaxed">
              ArtisanCraft was born from a simple belief — that the finest kitchenware and home décor isn't manufactured in factories, but crafted by hand, with skill and soul.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-black text-blue-950 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-6">From One Workshop to a National Platform</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2022, ArtisanCraft started as a small initiative to connect urban households with artisans from rural India. What began with a handful of pottery makers in Rajasthan has grown into India's most trusted handcrafted home goods platform.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Today, we work with over 5,000 artisans across 28 states, bringing you authentic cast iron cookware from Tamil Nadu, soapstone vessels from Karnataka, brass diyas from Uttar Pradesh, and ceramic platters from Khurja.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every purchase you make directly supports an artisan family and helps keep centuries-old crafts alive for future generations.
            </p>
          </div>
          <div className="relative h-80 md:h-full min-h-[320px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?q=80&w=800&auto=format&fit=crop"
              alt="Artisan at work"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900 text-center mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="mb-4">{val.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
