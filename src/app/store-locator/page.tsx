'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';

export default function StoreLocatorPage() {
  const [selectedStore, setSelectedStore] = useState<number>(1);

  const stores = [
    {
      id: 1,
      name: "Kitchenbay The Home Needs (salem)",
      address: "19/A Line Street, Attur, Salem, Tamil Nadu 636102",
      phone: "+91 7502777766",
      hours: "Store timing 9:30 to 9:30",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=19%2FA+Line+Street%2C+Attur%2C+Salem%2C+Tamil+Nadu+636102",
    },
    {
      id: 2,
      name: "Kitchenbay The Homeneeds (Chennai)",
      address: "KitchenBay Craft Cluster, Chennai, Tamil Nadu 600001",
      phone: "+91 7010189976",
      hours: "Store timing 9:30 to 9:30",
      mapsLink: "https://maps.app.goo.gl/7Z3v7MhxSBLs1Jj49",
    }
  ];

  const activeStore = stores.find(s => s.id === selectedStore)!;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">Find a Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Experience our handcrafted collections in person. Visit one of our experiential studios to feel the authentic quality of our Kitchenbay-made kitchenware and décor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8" style={{ minHeight: '620px' }}>

          {/* Store Cards */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: '620px' }}>
            {stores.map(store => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`bg-white p-6 rounded-2xl border-2 shadow-sm transition-all cursor-pointer group
                  ${selectedStore === store.id
                    ? 'border-[--color-brand-accent] shadow-md scale-[1.01]'
                    : 'border-[--color-brand-border] hover:border-[--color-brand-accent] hover:shadow-md'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-bold transition-colors ${selectedStore === store.id ? 'text-[--color-brand-accent]' : 'text-blue-950 group-hover:text-[--color-brand-accent]'}`}>
                    {store.name}
                  </h3>
                  {selectedStore === store.id && (
                    <span className="bg-[--color-brand-accent] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                      SELECTED
                    </span>
                  )}
                </div>
                <div className="space-y-2.5 text-sm text-gray-600 mb-5">
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 text-[--color-brand-accent] shrink-0" />
                    <span>{store.address}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[--color-brand-accent] shrink-0" />
                    {store.phone}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock size={16} className="text-[--color-brand-accent] shrink-0" />
                    {store.hours}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={store.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex-1 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Navigation size={15} /> Directions
                  </a>
                  <a
                    href={store.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="px-3 py-2 border border-gray-200 rounded-xl flex items-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps Embed */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-md border border-[--color-brand-border] flex flex-col" style={{ minHeight: '480px' }}>
            {/* Map Header bar */}
            <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[--color-brand-accent]" />
                <span className="font-semibold text-gray-800 text-sm">{activeStore.name}</span>
              </div>
              <a
                href={activeStore.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Open in Google Maps <ExternalLink size={13} />
              </a>
            </div>

            {/* Iframe */}
            <div className="flex-1 relative w-full" style={{ minHeight: '500px' }}>
              <iframe
                title="Kitchenbay Store Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeStore.address)}&output=embed&z=15`}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay link button to the actual pinned location */}
              <a
                href={activeStore.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white text-blue-700 text-xs font-bold px-3 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-1.5 hover:bg-blue-50 transition-colors"
              >
                <MapPin size={13} className="text-red-500" />
                View Pinned Location
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


