'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Printer, ArrowLeft } from 'lucide-react';
import logoImg from '@/images/invoice-logo.jpg';
import { code128BWidths } from '@/lib/code128';

const SELLER = {
  name: 'Kitchenbay The Homeneeds',
  addressLines: ['19/A Line Street', 'Attur (T.k)', 'Salem 636102', 'Tamil Nadu', '75027 77766'],
  gstin: '33FR0PS5957L1ZR',
};

const inr = (n: number) =>
  'INR' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('en-GB').replace(/\//g, '-');

function Barcode({ value }: { value: string }) {
  const widths = code128BWidths(value);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = 0;
  const bars: React.ReactElement[] = [];
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y={0} width={w} height={40} />);
    x += w;
  });
  return (
    <svg
      viewBox={`0 0 ${total} 40`}
      preserveAspectRatio="none"
      style={{ width: Math.min(total * 1.4, 240), height: 40 }}
      className="fill-slate-900"
      role="img"
      aria-label={`Barcode for order ${value}`}
    >
      {bars}
    </svg>
  );
}

function Party({ title, name, lines, email }: { title: string; name: string; lines: string[]; email?: string }) {
  return (
    <div className="text-xs leading-6">
      <p className="font-bold text-slate-800">{title}</p>
      <p>{name}</p>
      {lines.map((l, i) => <p key={i}>{l}</p>)}
      {email && <p>{email}</p>}
    </div>
  );
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

  const addr = order.address;
  const addressLines: string[] = addr
    ? [
        addr.street,
        `${addr.city} ${addr.zip}`.trim(),
        addr.state,
        addr.country && addr.country !== 'India' ? addr.country : '',
      ].filter(Boolean)
    : ['No address on file'];

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
      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none border border-gray-100 print:border-0 rounded-2xl print:rounded-none p-8 sm:p-10 print:p-4 text-slate-700">
        {/* Title + barcode */}
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">INVOICE</h1>
          <Barcode value={String(order.id)} />
        </div>

        {/* Logo / GSTIN + From */}
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-6 mt-5">
          <div className="sm:col-span-2 print:col-span-2">
            <Image src={logoImg} alt="Kitchenbay" className="w-36 h-36 object-contain" priority />
            <p className="text-xs mt-6">GSTIN: {SELLER.gstin}</p>
          </div>
          <div className="text-xs leading-6 sm:pt-8">
            <p className="font-bold text-slate-800">From</p>
            <p>{SELLER.name}</p>
            {SELLER.addressLines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </div>

        {/* Bill to / Ship to / Invoice meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-6 mt-8">
          <Party title="Bill to" name={order.customer} lines={addressLines} email={order.email} />
          <Party title="Ship to" name={order.customer} lines={addressLines} email={order.email} />
          <div className="text-xs leading-6">
            <p className="text-lg leading-8 mb-1 whitespace-nowrap">
              <span className="font-bold text-slate-800">Invoice no:</span>{' '}
              <span className="font-normal">{order.id}</span>
            </p>
            <p><span className="font-bold text-slate-800">Invoice date:</span> {formatDate(order.createdAt)}</p>
            <p><span className="font-bold text-slate-800">Order no:</span> {order.id}</p>
            <p><span className="font-bold text-slate-800">Order date:</span> {formatDate(order.createdAt)}</p>
            <p><span className="font-bold text-slate-800">Payment method:</span> {paymentLabel}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-xs mt-10 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-800 font-bold">
              <th className="py-3 pr-2 text-left w-14">S.No</th>
              <th className="py-3 px-2 text-left">Product</th>
              <th className="py-3 px-2 text-center">Quantity</th>
              <th className="py-3 px-2 text-left">Unit price</th>
              <th className="py-3 pl-2 text-right">Total price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-200 align-middle">
                <td className="py-4 pr-2">{idx + 1}</td>
                <td className="py-4 px-2 leading-6">
                  {item.name}
                  {item.size && <span className="block text-slate-400">Size: {item.size}</span>}
                </td>
                <td className="py-4 px-2 text-center">{item.quantity}</td>
                <td className="py-4 px-2 whitespace-nowrap">{inr(item.price)}</td>
                <td className="py-4 pl-2 text-right whitespace-nowrap">{inr(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-[45%] print:w-[45%] sm:min-w-[260px] text-xs">
            <div className="flex justify-between py-2.5">
              <span>Subtotal</span>
              <span className="text-right">{inr(order.subtotal)} (incl. tax)</span>
            </div>
            {order.firstOrderDiscount > 0 && (
              <div className="flex justify-between py-2.5 text-emerald-600 font-medium">
                <span>First Order Offer</span>
                <span>-{inr(order.firstOrderDiscount)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between py-2.5 text-emerald-600 font-medium">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>-{inr(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 border-b border-slate-200">
              <span>Shipping</span>
              <span className="text-right">
                {order.shippingAmount > 0 ? (
                  <>{inr(order.shippingAmount)} <span className="text-[10px]">via Flat rate</span></>
                ) : (
                  'Free shipping'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span>Total</span>
              <span className="text-right font-bold text-slate-800 text-sm">
                <span className="block">{inr(order.total)}</span>
                {order.gstAmount > 0 && (
                  <span className="block text-xs">(incl. tax {inr(order.gstAmount)})</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-5 text-center text-[11px] text-slate-400">
          Thank you for shopping with Kitchenbay. For queries, contact kitchenbaypvtltd@gmail.com
        </div>
      </div>
    </div>
  );
}
