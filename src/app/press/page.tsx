'use client';
/* eslint-disable react/no-unescaped-entities */

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Newspaper, Download } from 'lucide-react';

export default function PressPage() {
  const pressReleases = [
    { date: 'May 15, 2026', title: 'Kitchenbay Crosses 500 Customers Milestone', desc: 'Kitchenbay, India\'s leading handcrafted homeware platform, announced today that it has surpassed 500 happy customers, reflecting growing consumer demand for authentic Kitchenbay products.' },
    { date: 'March 2, 2026', title: 'Kitchenbay Partners with 20+ New Kitchenbays from Northeast India', desc: 'In a landmark expansion, Kitchenbay onboarded over 20 Kitchenbays from the states of Assam, Manipur, and Meghalaya, bringing rare bamboo and cane craft to a nationwide audience.' },
    { date: 'January 10, 2026', title: 'Kitchenbay Wins "Most Promising D2C Brand" at India Retail Excellence Awards 2026', desc: 'Kitchenbay was honoured with the prestigious "Most Promising D2C Brand" award at the India Retail Excellence Awards ceremony held in Mumbai.' },
    { date: 'October 20, 2025', title: 'Kitchenbay Launches Express Delivery in 5 Major Cities', desc: 'Following strong demand, Kitchenbay launched same-day and next-day delivery services across Delhi, Mumbai, Bangalore, Chennai, and Hyderabad.' },
  ];

  const mediaMentions = [
    { outlet: 'The Economic Times', quote: '"Kitchenbay is redefining how urban India connects with its Kitchenbay heritage."' },
    { outlet: 'YourStory', quote: '"A startup that truly puts the Kitchenbay first — and it shows in every product."' },
    { outlet: 'Vogue India', quote: '"The go-to destination for curated, authentic Indian homeware."' },
    { outlet: 'Inc42', quote: '"Kitchenbay\'s growth story is one of the most inspiring in India\'s D2C landscape."' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Press & Media</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">News, announcements, and media resources for journalists and press professionals.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Press Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Press Contact</h2>
              <p className="text-gray-600">For press inquiries, interviews, and media kits, please reach out to our PR team.</p>
            </div>
            <div className="shrink-0 space-y-2">
              <p className="text-sm font-semibold text-gray-700">📧 <a href="mailto:press@Kitchenbay.in" className="text-blue-600 hover:underline">press@Kitchenbay.in</a></p>
              <button suppressHydrationWarning className="flex items-center gap-2 bg-blue-950 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-blue-900 transition-colors text-sm">
                <Download size={16} /> Download Media Kit
              </button>
            </div>
          </div>

          {/* Media Mentions */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8">As Featured In</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mediaMentions.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-700 italic leading-relaxed mb-4">"{item.quote}"</p>
                  <p className="font-bold text-blue-950">— {item.outlet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Press Releases */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8">Press Releases</h2>
            <div className="space-y-4">
              {pressReleases.map((pr, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <Newspaper size={20} className="text-[--color-brand-accent] shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{pr.date}</p>
                      <h3 className="font-bold text-gray-900 group-hover:text-[--color-brand-accent] transition-colors mb-2">{pr.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{pr.desc}</p>
                    </div>
                  </div>
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
