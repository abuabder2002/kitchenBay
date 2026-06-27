'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */


import React, { use, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';
import { Package, Truck, Check, Clock, X, ChevronRight, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: <Clock size={18} /> },
  { key: 'processing', label: 'Processing', icon: <Package size={18} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={18} /> },
  { key: 'delivered', label: 'Delivered', icon: <Check size={18} /> },
];

const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

const statusColors: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-blue-600 bg-blue-50 border-blue-200',
  delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
};

interface OrderTrackingPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const contact = searchParams.get('contact') || '';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setLoading(true);
    const url = `/api/orders/${orderId}${contact ? `?contact=${encodeURIComponent(contact)}` : ''}`;
    fetch(url, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const mappedOrder = {
            id: data.id,
            status: data.status,
            date: data.createdAt,
            subtotal: data.subtotalAmount / 100,
            total: data.totalAmount / 100,
            shipping: data.shippingAmount !== undefined ? data.shippingAmount / 100 : 0,
            tax: data.gstAmount !== undefined ? data.gstAmount / 100 : 0,
            customer: data.customerName || 'Customer',
            address: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.zip || '',
            paymentMethod: data.razorpayId ? 'Online Payment' : 'Cash on Delivery (COD)',
            items: data.items || []
          };
          setOrder(mappedOrder);
        } else {
          setOrder(null);
        }
      })
      .catch(err => {
        console.error('Error fetching order track details:', err);
        setOrder(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, contact, isMounted]);

  const formatPrice = (p: number) =>
    'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(p);

  const formatCurrency = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(p);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Retrieving order details…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <X size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-6">
            We couldn't find an order with the ID <span className="font-semibold text-gray-800">{orderId}</span>. Please verify the ID and try again.
          </p>
          <div className="flex gap-4 w-full">
            <Link href="/track" className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Track
            </Link>
            <Link href="/products" className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Shop Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStep = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
            <p className="text-gray-500 text-sm mt-0.5">Order ID: <span className="font-semibold text-blue-600">{order.id}</span></p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border ${statusColors[order.status]} w-fit`}>
            {order.status === 'cancelled' ? <X size={14} /> : null}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            {!isCancelled ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-6">Delivery Progress</h2>
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-blue-500 to-violet-300 transition-all duration-500"
                    style={{ height: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  />

                  <div className="space-y-6 relative">
                    {statusSteps.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step.key} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                            done
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-gray-300'
                          } ${active ? 'ring-4 ring-blue-50' : ''}`}>
                            {step.icon}
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                            {active && (
                              <p className="text-xs text-blue-600 font-medium mt-0.5">Current Status</p>
                            )}
                            {done && i < currentStep && (
                              <p className="text-xs text-gray-400 mt-0.5">Completed</p>
                            )}
                            {!done && (
                              <p className="text-xs text-gray-300 mt-0.5">Pending</p>
                            )}
                          </div>
                          {done && (
                            <div className="shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1.5">
                              <Check size={12} className="text-emerald-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600 mt-0.5">This order has been cancelled. Refund will be processed within 5-7 business days.</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => {
                  // Normalize item representation (mock orders use item.product, dynamic use direct name/image/price)
                  const normalized = {
                    id: item.productId,
                    name: item.product?.name || item.name || `Product (${item.productId?.substring(0, 8)})`,
                    image: item.product?.image || item.image || '/images/marketing/everyday_cooking.jpg',
                    quantity: item.quantity,
                    price: (item.basePrice || item.price || 0) / 100
                  };

                  return (
                    <div key={normalized.id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img src={normalized.image || '/images/marketing/everyday_cooking.jpg'} alt={normalized.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{normalized.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {normalized.quantity} × {formatPrice(normalized.price)}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">
                        {formatPrice(normalized.price * normalized.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Order Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping: Flat rate</span>
                  <span className="font-medium text-gray-800">{formatCurrency(order.shipping)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-sm">Total:</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-base block">{formatCurrency(order.total)}</span>
                      {order.tax > 0 && (
                        <span className="text-xs text-gray-500 block mt-1 font-medium">
                          (includes {formatCurrency(order.tax)} Tax)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-600" /> Delivery Address
              </h3>
              <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {order.address}
                {order.city ? `, ${order.city}` : ''}
                {order.state ? `, ${order.state}` : ''}
                {order.pincode ? ` - ${order.pincode}` : ''}
              </p>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
                <CreditCard size={14} className="text-blue-600" /> Payment Method
              </h3>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg text-uppercase">
                {order.paymentMethod}
              </span>
            </div>


          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
