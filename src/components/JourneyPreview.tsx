import React, { useState } from 'react';

export default function JourneyPreview() {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(!expanded);

  return (
    <section className="bg-white py-12" id="journey-preview">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          From Pushcart to Digital Brand
        </h2>
        <p className="text-center text-gray-600 mb-6">
          A journey built on trust, hard work, and innovation.
        </p>
        {/* Short summary */}
        <p className="text-gray-700 mb-4">
          Every great journey begins with a small step. Ours began in 1970, when Mr. Sellasamy started Sellasamy Store with nothing more than a pushcart, determination, and a belief in honest business.
        </p>
        {/* Expandable full story */}
        {expanded && (
          <div className="text-gray-700 space-y-4">
            <p>
              What followed was not overnight success—but years of hard work, trust, and consistency. From a humble 10×10 room shop, the business slowly grew, earning the loyalty of customers through quality products and fair pricing. With time, that small space transformed into a well‑established retail store, becoming a trusted name in the community.
            </p>
            <p>
              As the legacy strengthened, the vision expanded. The next generation took a bold step forward by launching a larger format store, bringing in a wider range of products, better margins, and an enhanced customer experience. The brand continued to grow—not just in size, but in reputation.
            </p>
            <p>
              Then came the turning point. In 2015, Arunmani Sellasamy founded KitchenBay, marking the brand’s entry into the digital world. What started as a small startup quickly evolved into a fast‑growing e‑commerce platform, driven by innovation, customer focus, and the same core values established in 1970.
            </p>
            <p>
              Today, KitchenBay stands as a bridge between tradition and technology—combining decades of retail experience with the speed and convenience of modern ecommerce.
            </p>
            <p>
              From a single pushcart to a thriving retail presence… From a small startup to a growing digital brand… Our journey continues—with the same commitment to quality, trust, and customer satisfaction.
            </p>
          </div>
        )}
        <button
          onClick={toggle}
          className="mt-4 inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
        >
          {expanded ? 'Read Less' : 'Read More'}
        </button>
      </div>
    </section>
  );
}
