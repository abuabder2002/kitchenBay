'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Download } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function GSTInvoicePage() {
  const { currentUser: user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="text-[--color-brand-accent]" size={32} />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">GST Invoice</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About GST Invoices</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            ArtisanCraft is a GST-registered business. A GST-compliant invoice is automatically generated for every order placed on our platform. You can download your invoices from the <strong>My Orders</strong> section of your account.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Business Name</p>
              <p className="font-semibold text-gray-900">ArtisanCraft India Pvt. Ltd.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">GSTIN</p>
              <p className="font-semibold text-gray-900">07AABCA1234B1Z5</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Registered Address</p>
              <p className="font-semibold text-gray-900">123 Heritage Marg, New Delhi 110001</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Invoice Format</p>
              <p className="font-semibold text-gray-900">PDF (GSTIN Compliant)</p>
            </div>
          </div>
        </div>

        {user ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Download Your Invoices</h2>
            <p className="text-gray-600 mb-6">Go to your orders page to download GST invoices for any past order.</p>
            <a href="/orders" className="inline-flex items-center gap-2 bg-[--color-brand-accent] text-white font-semibold px-6 py-3 rounded-full hover:bg-[--color-brand-accent-hover] transition-colors">
              <Download size={18} />
              View My Orders & Invoices
            </a>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <p className="text-gray-700 mb-4">Please log in to view and download your GST invoices.</p>
            <a href="/login?redirect=/gst-invoice" className="inline-block bg-[--color-brand-accent] text-white font-semibold px-6 py-3 rounded-full hover:bg-[--color-brand-accent-hover] transition-colors">
              Login to Continue
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
