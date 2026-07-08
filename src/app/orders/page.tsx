'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;       // paise
  name: string;
  image: string | null;
  size?: string;
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;   // paise
  createdAt: string;
  items: OrderItem[];
}

export default function TrackOrdersPage() {
  const { currentUser: user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setFetchLoading(true);
    fetch('/api/orders')
      .then(res => res.ok ? res.json() : [])
      .then((data: any) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => setOrders([]))
      .finally(() => setFetchLoading(false));
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="text-green-500" size={18} />;
      case 'shipped':   return <Truck className="text-blue-500" size={18} />;
      case 'cancelled': return <XCircle className="text-red-500" size={18} />;
      default:          return <Clock className="text-orange-500" size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':   return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':return 'bg-blue-100 text-blue-800 border-blue-200';
      default:          return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Package className="text-orange-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase yet.</p>
            <Link href="/products" className="inline-block bg-orange-500 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                    <p className="font-bold text-gray-900 text-sm">#{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="font-bold text-gray-900 text-base">
                      Rs.&nbsp;{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(order.totalAmount / 100)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2 pr-4 bg-white max-w-xs">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded bg-gray-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                          {item.size && <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
                          <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Order Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
