import React from 'react';
import { Clock, ShoppingBag, Store, Calendar } from 'lucide-react';

const timelineEvents = [
  { year: '1970', title: 'Sellasamy Store begins', description: 'Mr. Sellasamy starts with a pushcart.', icon: Clock },
  { year: '10×10 Shop', title: 'Early Retail Growth', description: 'Small shop builds trust.', icon: ShoppingBag },
  { year: 'Retail Expansion', title: 'Larger Store', description: 'Wider product selection.', icon: Store },
  { year: '2015', title: 'KitchenBay Founded', description: 'Arunmani launches digital brand.', icon: Calendar },
  { year: 'Today', title: 'E‑commerce Leader', description: 'Growing across regions.', icon: Calendar },
];

export default function LegacyTimeline() {
  return (
    <section className="bg-gradient-to-r from-amber-50 via-white to-amber-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-8">
          A Legacy Built on Trust Since 1970
        </h2>
        <p className="text-center text-gray-700 mb-12">
          From a humble pushcart to a growing digital brand.
        </p>
        {/* Timeline container */}
        <div className="flex flex-col md:flex-row md:overflow-x-auto gap-8">
          {timelineEvents.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div
                key={idx}
                className="flex-shrink-0 md:w-56 w-full bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <Icon className="text-amber-600 mr-2" size={24} />
                  <span className="text-amber-800 font-semibold">{event.year}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
