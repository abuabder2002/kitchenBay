import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Kitchenbay',
  description: 'Learn about our shipping partners, timelines, and delivery schedules at Kitchenbay.',
};

export default function ShippingPolicyPage() {
  const sections = [
    {
      title: '1. Shipping Partners',
      content: 'We have partnered with India Post to deliver our products across India quickly and reliably. This collaboration allows us to reach even the most remote locations efficiently.'
    },
    {
      title: '2. Shipping Timeline',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Most orders are shipped within 5 business days of confirmation.</li>
          <li>For made-to-order products, additional time may be required to craft your item. The estimated timeline will be clearly mentioned on the product page.</li>
          <li>Once your order is shipped, you will receive a shipping confirmation email with a tracking number to monitor your package.</li>
        </ul>
      )
    },
    {
      title: '3. Delivery Schedule',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Our courier partners deliver from Monday to Saturday, between 9 AM and 7 PM.</li>
          <li>Deliveries do not occur on Sundays or public holidays.</li>
          <li>Please note that delivery times may be affected by factors beyond our control such as weather conditions, strikes, or unforeseen delays.</li>
        </ul>
      )
    },
    {
      title: '4. Shipping Address',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>To avoid delays, please ensure the shipping address you provide is accurate and complete.</li>
          <li>Address changes are accepted only before the order is shipped. Unfortunately, once shipped, we cannot modify the delivery address.</li>
        </ul>
      )
    },
    {
      title: '5. Return Shipping',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>For returns, certain products will be picked up directly by our Kitchenbay team.</li>
          <li>For other products, customers will be responsible for arranging return shipping.</li>
          <li>Return instructions will be communicated clearly when you initiate a return request.</li>
        </ul>
      )
    },
    {
      title: '6. Delivery Issues',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>If delivery fails due to incorrect or incomplete address, or if the package is refused, additional shipping charges may apply for re-delivery.</li>
          <li>After 3 unsuccessful delivery attempts, the package may be returned to us, and shipping charges will be deducted from any refunds.</li>
        </ul>
      )
    },
    {
      title: 'Contact Us',
      content: (
        <>
          <p className="mb-4">We are committed to providing you with a smooth and transparent delivery experience. For any questions about your order status or shipping, feel free to contact our customer support team:</p>
          <div className="space-y-2">
            <p>📧 <strong>Email:</strong> <a href="mailto:kitchenbaypvtltd@gmail.com" className="text-blue-600 hover:underline">kitchenbaypvtltd@gmail.com</a></p>
            <p>🏢 <strong>Address:</strong> Kitchenbay The Home Needs (salem), 19/A, Line Street, Attur, Salem (DT) - 636102</p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Shipping & Delivery Policy</h1>
            <p className="text-blue-200 text-lg">Kitchenbay</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              At Kitchenbay, we strive to ensure your order reaches you safely and promptly. Here’s everything you need to know about our shipping and delivery process:
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">{section.title}</h2>
                <div className="text-gray-600 leading-relaxed">
                  {section.content}
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
