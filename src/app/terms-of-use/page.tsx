'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfUsePage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing and using the ArtisanCraft website, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.' },
    { title: '2. Use License', content: 'Permission is granted to temporarily download one copy of the materials on ArtisanCraft\'s website for personal, non-commercial viewing only. This is the grant of a license, not a transfer of title.' },
    { title: '3. Account Responsibility', content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.' },
    { title: '4. Product Descriptions', content: 'We strive to ensure that all product descriptions, images, and prices are accurate. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.' },
    { title: '5. Pricing & Payments', content: 'All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify pricing at any time without prior notice.' },
    { title: '6. Cancellations & Returns', content: 'Orders may be cancelled within 24 hours of placement. Returns are accepted within 7 days of delivery for undamaged goods in original packaging. Handcrafted items may have slight variations which are not considered defects.' },
    { title: '7. Governing Law', content: 'These Terms of Use are governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in New Delhi, India.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Terms of Use</h1>
            <p className="text-blue-200 text-lg">Last updated: May 27, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <p className="text-gray-600 text-lg leading-relaxed mb-12">
            Please read these Terms of Use carefully before using the ArtisanCraft website. These terms govern your use of our website and services.
          </p>
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
