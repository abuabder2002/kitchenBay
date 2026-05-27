'use client';

import React, { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useOrders } from '@/lib/ordersContext';
import { orders as mockOrders } from '@/lib/mockData';
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
  const { getOrderById } = useOrders();

  // Find order in local storage first, fallback to mock orders
  let order = getOrderById(orderId);
  if (!order) {
    order = mockOrders.find(o => o.id === orderId) as any;
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

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
                  const normalized = item.product ? {
                    id: item.product.id,
                    name: item.product.name,
                    image: item.product.image,
                    quantity: item.quantity,
                    price: item.product.finalPrice || item.product.price
                  } : {
                    id: item.productId,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: item.price
                  };

                  return (
                    <div key={normalized.id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img src={normalized.image} alt={normalized.name} className="w-14 h-14 object-cover rounded-lg" />
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
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST</span>
                  <span className="font-medium text-emerald-600">{formatPrice(order.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST</span>
                  <span className="font-medium text-emerald-600">{formatPrice(order.sgstAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Total Tax (CGST + SGST)</span>
                  <span>{formatPrice(order.gstAmount || (order.cgstAmount + order.sgstAmount))}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-700">{formatPrice(order.total)}</span>
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

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Download CGST/SGST Invoice
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
