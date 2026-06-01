'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */


import { useAuth } from '@/lib/authContext';
import { useOrders } from '@/lib/ordersContext';
import { orders as mockOrders } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function TrackOrdersPage() {
  const { currentUser: user, loading } = useAuth();
  const { orders: dynamicOrders } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/orders');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combine dynamic orders from localStorage and mock orders
  const allOrders = [
    ...dynamicOrders,
    ...mockOrders.map(o => ({
      id: o.id,
      customer: o.customer,
      email: o.email,
      phone: '',
      address: o.address,
      city: '',
      state: '',
      pincode: '',
      date: o.date,
      status: o.status as any,
      total: o.total,
      paymentMethod: o.paymentMethod,
      items: o.items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image,
        quantity: item.quantity,
        price: item.product.finalPrice || item.product.price,
      }))
    }))
  ];

  // Filter orders specifically for the logged-in user's email
  const myOrders = allOrders.filter(
    o => o.email.toLowerCase() === user.email.toLowerCase()
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-orange-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Package className="text-orange-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Track Your Orders</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {myOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase yet.</p>
              <Link href="/products" className="inline-block bg-orange-500 text-white font-medium px-6 py-2.5 rounded hover:bg-orange-600 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myOrders.map(order => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order #{order.id}</p>
                      <p className="text-sm font-medium text-gray-900">
                        Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="font-bold text-gray-900">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 border border-gray-100 rounded-lg p-2 pr-4 bg-white">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-100" />
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link href={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      View Order Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
