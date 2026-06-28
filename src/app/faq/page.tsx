'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { faqPageSchema } from '@/lib/schemas';

const faqs = [
  {
    category: 'Orders & Shipping', items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery (1-2 days) is available for select pincodes at an additional charge.' },
      { q: 'Do you deliver pan India?', a: 'Yes! We deliver to all major cities and 20,000+ pincodes across India. Enter your pincode on the product page to check delivery availability.' },
      { q: 'Can I change my delivery address?', a: 'Address changes can be made within 2 hours of placing your order. Please contact us immediately at kitchenbaypvtltd@gmail.com.' },
      { q: 'Is cash on delivery available?', a: 'Yes, COD is available for orders up to Rs. 5,000. A small convenience fee of Rs. 49 may apply.' },
    ]
  },
  {
    category: 'Products & Quality', items: [
      { q: 'Are all products handcrafted?', a: 'Yes! Every product on Kitchenbay is made by skilled Indian Kitchenbays using traditional techniques passed down through generations.' },
      { q: 'Why do handcrafted items look slightly different?', a: 'Minor variations in colour, texture, or pattern are a hallmark of genuine handmade products. These are not defects but proof of authenticity.' },
      { q: 'Are your products food-safe?', a: 'All our cookware and dining products are certified food-safe. We work with Kitchenbays who use natural, non-toxic materials and traditional glazing methods.' },
    ]
  },
  {
    category: 'Payments', items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI, Net Banking, Credit/Debit Cards (Visa, Mastercard, RuPay), EMI, and Cash on Delivery.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. All transactions are encrypted with SSL and processed through PCI-DSS compliant payment gateways.' },
      { q: 'Can I pay in EMI?', a: 'Yes, No-Cost EMI is available on orders above Rs. 3,000 on select cards from leading banks.' },
    ]
  },
  {
    category: 'Returns & Refunds', items: [
      { q: 'What is your return policy?', a: 'Once you raise a return request, our team will review the issue and guide you through the return process. Depending on the product and reason for return, the item may be picked up or require self-shipping. If the return is due to a damaged product or size mismatch, Kitchenbay will cover the return shipping cost as per our policy. The applicable return method will be communicated after your request is approved. For complete details, please refer to our Cancellation & Refund Policy.' },
      { q: 'How do I initiate a return?', a: 'Go to My Orders in your account, select the item, and click "Request Return". Our team will arrange a free pickup.' },
    ]
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        suppressHydrationWarning
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDown size={20} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  // Flatten all FAQ items for JSON-LD
  const allFaqItems = faqs.flatMap(cat => cat.items.map(item => ({
    question: item.q,
    answer: item.a,
  })));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <JsonLd data={faqPageSchema(allFaqItems)} />
      <Breadcrumbs items={[
        { name: 'Home', href: '/' },
        { name: 'FAQ', href: '/faq' },
      ]} />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Frequently Asked Questions</h1>
            <p className="text-blue-200 text-lg">Everything you need to know about shopping with KitchenBay — orders, shipping, returns, payments, and product quality.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{category.category}</h2>
              </div>
              <div className="px-6">
                {category.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
