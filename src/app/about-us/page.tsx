'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Award, Users, Leaf, Heart } from 'lucide-react';
import LegacyTimeline from '@/components/LegacyTimeline';
import FounderCEO from '@/components/FounderCEO';
import JourneyPreview from '@/components/JourneyPreview';

export default function AboutUsPage() {
  const stats = [
    { value: '50+', label: 'Kitchenbays Empowered' },
    { value: '500+', label: 'Happy Customers' },
    { value: '28', label: 'States Reached' },
    { value: '200+', label: 'Unique Products' },
  ];

  const values = [
    { icon: <Award size={28} className="text-yellow-500" />, title: 'Authentic Craftsmanship', desc: 'Every product is made by certified Kitchenbays using traditional methods passed down through generations.' },
    { icon: <Leaf size={28} className="text-green-600" />, title: 'Sustainable Materials', desc: 'We use only natural, eco-friendly materials — clay, brass, cast iron, copper, and soapstone.' },
    { icon: <Users size={28} className="text-blue-600" />, title: 'Community First', desc: 'Our platform directly empowers rural Kitchenbay communities by ensuring fair wages and ethical trade.' },
    { icon: <Heart size={28} className="text-red-500" />, title: 'Made With Love', desc: 'Each item carries the soul and story of the Kitchenbay who made it. We\'re proud to share those stories with you.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* New Brand Story Sections */}
        <LegacyTimeline />
        <FounderCEO />
        <JourneyPreview />
        {/* Hero */}
        <div className="relative bg-blue-950 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/images/marketing/everyday_cooking_collection.jpg')] bg-cover bg-center" />
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-4">Our Story</p>
            <h1 className="text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">Celebrating India&apos;s<br />Kitchenbay Heritage</h1>
            <p className="text-blue-200 text-xl max-w-2xl mx-auto leading-relaxed">
              Kitchenbay was born from a simple belief — that the finest kitchenware and home décor isn&apos;t manufactured in factories, but crafted by hand, with skill and soul.
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

        {/* Story */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-6">Our KitchenBay Journey</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2015, KitchenBay transformed a family‑run retail legacy dating back to 1970 into a premium ecommerce destination for modern Indian homes.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              From a humble pushcart in a bustling market to a sleek online boutique, we now deliver stainless‑steel cookware, elegant dinnerware, and curated kitchen accessories across the nation.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, KitchenBay blends heritage craftsmanship with contemporary design, offering customers a seamless blend of tradition and modernity, backed by unmatched quality and service.
            </p>
          </div>
          <div className="relative h-80 md:h-full min-h-[320px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/marketing/modern_world_kitchen.png"
              alt="Modern premium KitchenBay kitchen setup"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
