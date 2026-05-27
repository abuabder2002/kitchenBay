'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Eye, Lock, Trash2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    { icon: <Shield size={24} />, title: 'Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, phone number, and payment information.' },
    { icon: <Eye size={24} />, title: 'How We Use Your Information', content: 'We use the information we collect to process your orders and payments, send you transactional emails, provide customer support, send you marketing communications (with your consent), and improve our products and services.' },
    { icon: <Lock size={24} />, title: 'Data Security', content: 'We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment data is encrypted via SSL/TLS and processed securely through our payment partners.' },
    { icon: <Trash2 size={24} />, title: 'Your Rights', content: 'You have the right to access, update, or delete your personal information at any time. You may also opt out of marketing communications. To exercise these rights, please contact us at privacy@artisancraft.in.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Privacy Policy</h1>
            <p className="text-blue-200 text-lg">Last updated: May 27, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <p className="text-gray-600 text-lg leading-relaxed mb-12">
            At ArtisanCraft, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-[--color-brand-accent]">
                  {section.icon}
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Questions about our Privacy Policy?</h3>
            <p className="text-gray-600">Contact us at <a href="mailto:privacy@artisancraft.in" className="text-blue-600 hover:underline font-medium">privacy@artisancraft.in</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
