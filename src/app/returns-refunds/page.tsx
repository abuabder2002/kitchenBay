'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RotateCcw, Clock, Package, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  const steps = [
    { step: '01', title: 'Initiate Return', desc: 'Log in to your account, go to My Orders, and select the item you wish to return.' },
    { step: '02', title: 'Pack Securely', desc: 'Pack the item in its original packaging, including all accessories, tags, and documentation.' },
    { step: '03', title: 'Schedule Pickup', desc: 'Our logistics partner will contact you within 24 hours to schedule a convenient pickup time.' },
    { step: '04', title: 'Refund Processed', desc: 'Once we receive and inspect the item, a refund will be credited to your original payment method within 5-7 business days.' },
  ];

  const faqs = [
    { q: 'How many days do I have to return a product?', a: '7 days from the date of delivery for most items. Festive décor and limited-edition artisan pieces have a 3-day return window.' },
    { q: 'Are handcrafted items returnable?', a: 'Yes, but minor variations in colour, texture, or finish are inherent to handmade products and are not considered defects. Only items with manufacturing defects qualify for return.' },
    { q: 'What items are non-returnable?', a: 'Perishable goods, customised/personalised items, items used or damaged by the customer, and items without original packaging are not eligible for return.' },
    { q: 'How long does the refund take?', a: 'Refunds are processed within 2-3 business days of receiving the returned item. It may take an additional 3-5 business days to reflect in your account.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Returns & Refunds</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">We want you to love every ArtisanCraft purchase. If something isn't right, we'll make it right.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Policy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Clock size={28} className="text-[--color-brand-accent]" />, title: '7-Day Returns', desc: 'Return within 7 days of delivery' },
              { icon: <Package size={28} className="text-[--color-brand-accent]" />, title: 'Free Pickup', desc: 'We arrange a free pickup from your doorstep' },
              { icon: <RotateCcw size={28} className="text-[--color-brand-accent]" />, title: 'Easy Refund', desc: 'Refund to original payment method in 5-7 days' },
            ].map((card, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
                {card.icon}
                <h3 className="font-bold text-gray-900">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8 text-center">How to Return</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <span className="absolute top-4 right-5 text-5xl font-black text-gray-100">{step.step}</span>
                  <h3 className="font-bold text-gray-900 mb-2 relative z-10">{step.title}</h3>
                  <p className="text-gray-500 text-sm relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-[--color-brand-accent] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-600">{faq.a}</p>
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
