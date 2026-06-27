'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Package, Search, ArrowRight, X } from 'lucide-react';
import { useOrders } from '@/lib/ordersContext';
import { useRouter } from 'next/navigation';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOrderId = orderId.trim();
    const cleanContact = emailOrPhone.trim().toLowerCase();

    if (!cleanOrderId || !cleanContact) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${cleanOrderId}?contact=${encodeURIComponent(cleanContact)}`);
      if (res.ok) {
        const orderData = await res.json();
        router.push(`/orders/${orderData.id}?contact=${encodeURIComponent(cleanContact)}`);
      } else {
        if (res.status === 404) {
          setError('Could not find an order with this Order ID. Please check the ID and try again.');
        } else if (res.status === 401) {
          setError('The email address or phone number provided does not match our records for this order.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      }
    } catch (err) {
      console.error('[TrackPage] Error tracking order:', err);
      setError('Could not connect to the server. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-full mb-6">
              <Package className="w-8 h-8 text-brand-accent" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-brand-text mb-4">Track Your Order</h1>
            <p className="text-lg text-brand-muted max-w-xl mx-auto">
              Enter your order details below to see the current status of your shipment.
            </p>
          </div>

          <div className="bg-brand-card rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-2">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-brand-text mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., ORD-1779628..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all bg-white text-brand-text"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-2">
                  Email Address or Phone Number
                </label>
                <input
                  type="text"
                  id="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or phone number used during checkout"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all bg-white text-brand-text"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-white px-6 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                {isLoading ? 'Tracking Order...' : 'Track Order'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <h3 className="font-medium text-brand-text mb-2">Need help with your order?</h3>
              <p className="text-brand-muted text-sm mb-4">
                If you have any questions or issues, our support team is here for you.
              </p>
              <a href="/contact" className="inline-flex items-center text-brand-accent font-medium hover:text-blue-800 transition-colors">
                Contact Customer Support <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
