'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Cookie Policy</h1>
            <p className="text-blue-200">Last updated: May 27, 2026</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          {[
            { title: 'What Are Cookies?', content: 'Cookies are small text files that are placed on your device when you visit our website. They help us remember your preferences and understand how you use our site.' },
            { title: 'How We Use Cookies', content: 'We use cookies to: keep you signed in to your account, remember items in your cart, understand which pages you visit, personalize product recommendations, and run analytics to improve our service.' },
            { title: 'Types of Cookies We Use', content: 'Essential Cookies: Required for the website to function (e.g., session management, cart). Analytics Cookies: Help us understand traffic and usage patterns (e.g., Google Analytics). Marketing Cookies: Used to show you relevant ads on third-party platforms (with your consent).' },
            { title: 'Managing Cookies', content: 'You can control or delete cookies through your browser settings at any time. Please note that disabling essential cookies may affect the functionality of our website, such as keeping items in your cart.' },
            { title: 'Third-Party Cookies', content: 'We use services like Google Analytics, Razorpay, and Clerk for authentication. These third parties may set their own cookies. We encourage you to review their respective privacy policies.' },
          ].map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
          <div className="mt-4 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-gray-700">For questions about our Cookie Policy, please email <a href="mailto:privacy@Kitchenbay.in" className="text-blue-600 hover:underline font-medium">privacy@Kitchenbay.in</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
