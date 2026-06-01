import React from 'react';
import Image from 'next/image';

export default function FounderCEO() {
  return (
    <section className="bg-white py-12" id="founder-ceo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
        {/* Founder Image */}
        <div className="w-full md:w-1/2 relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/images/about/founder-arunmani.jpg"
            alt="Founder Arunmani Sellasamy"
            fill
            className="object-cover object-center"
          />
        </div>
        {/* Content */}
        <div className="w-full md:w-1/2">
          <h3 className="text-xl text-brand-accent font-semibold mb-2">Meet Our Founder</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Arunmani Sellasamy</h2>
          <p className="text-gray-700 mb-4">
            Arunmani Sellasamy represents the next generation of a family business that began in 1970. Building upon decades of trust and retail excellence, he founded KitchenBay in 2015 to bring the family legacy into the digital era.
          </p>
          <p className="text-gray-700 mb-6">
            Today, KitchenBay combines traditional values with modern ecommerce innovation, serving customers with the same commitment to quality, trust, and customer satisfaction.
          </p>
          <blockquote className="border-l-4 border-brand-accent pl-4 italic text-gray-800 bg-gray-50 p-4 rounded">
            "Trust, quality, honesty, and customer satisfaction remain the foundation of everything we do."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
