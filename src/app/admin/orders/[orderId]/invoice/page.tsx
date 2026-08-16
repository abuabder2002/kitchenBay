'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';

function normalizeImageSrc(image: string | null | undefined): string {
  if (!image) return '/artisan_kitchenware.png';
  if (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')) {
    return image;
  }
  return `data:image/jpeg;base64,${image}`;
}

export default function AdminOrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login?next=/admin/orders');
          return null;
        }
        if (!res.ok) throw new Error('Failed to load order');
        return res.json();
      })
      .then(data => { if (data) setOrder(data); })
      .catch(err => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const formatPrice = (p: number) =>
    'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(p);

  const paymentLabel = order?.paymentStatus === 'COD_PENDING'
    ? 'Cash on Delivery (COD)'
    : order?.razorpayId
    ? 'Prepaid (Online Payment)'
    : order?.paymentStatus === 'PAID'
    ? 'Prepaid (Online Payment)'
    : 'Cash on Delivery (COD)';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading invoice…</div>;
  }

  if (error || !order) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Order not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      {/* Action bar — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 px-4 flex items-center justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice sheet */}
      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none border border-gray-100 print:border-0 rounded-2xl print:rounded-none p-8 sm:p-10 text-gray-800">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-700">Kitchenbay</h1>
            <p className="text-xs text-gray-500">The Home Needs</p>
            <p className="text-xs text-gray-400 mt-2">Kitchenbay India Pvt. Ltd.</p>
            <p className="text-xs text-gray-400">19/A Line Street, Attur, Salem, Tamil Nadu 636102</p>
            <p className="text-xs text-gray-400">GSTIN: 07AABCA1234B1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Tax Invoice</h2>
            <p className="text-xs text-gray-500 mt-1">Order #{order.id}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {order.status}
            </span>
          </div>
        </div>

        {/* Bill to / Ship to */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
            <p className="text-xs text-gray-500 mt-0.5">{order.email}</p>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-gray-400">Payment: </span>
              <span className="font-semibold text-gray-700">{paymentLabel}</span>
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ship To</h3>
            {order.address ? (
              <p className="text-xs text-gray-600 leading-relaxed">
                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip}, {order.address.country}
              </p>
            ) : (
              <p className="text-xs text-gray-400">No address on file</p>
            )}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Price</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={normalizeImageSrc(item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 print:w-10 print:h-10"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
                      {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-600">{formatPrice(item.price)}</td>
                <td className="py-3 pl-2 text-right font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-800">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="text-gray-800">{order.shippingAmount > 0 ? formatPrice(order.shippingAmount) : 'FREE'}</span>
            </div>
            {order.gstAmount > 0 && (
              <div className="flex justify-between text-gray-400 text-xs">
                <span>(includes GST)</span>
                <span>{formatPrice(order.gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 text-base font-bold text-gray-900">
              <span>Grand Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 text-center text-[11px] text-gray-400">
          Thank you for shopping with Kitchenbay. For queries, contact kitchenbaypvtltd@gmail.com
        </div>
      </div>
    </div>
  );
}
