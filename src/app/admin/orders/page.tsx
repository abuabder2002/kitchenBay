'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useState, useEffect } from 'react';
import { Check, ChevronDown, ShoppingBag, Mail, X, Eye, ExternalLink, Package, MessageSquare, FileText } from 'lucide-react';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped: 'text-blue-700 bg-blue-50 border-blue-200',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // States for live real-time email notification sending
  const [activeNotification, setActiveNotification] = useState<{
    order: any;
    status: OrderStatus;
    visible: boolean;
  } | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    success: boolean;
    error?: string;
    code?: string;
  } | null>(null);

  // Fetch orders function used for initial load and refresh
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) {
        throw new Error('Failed to fetch admin orders.');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);

    // Find the current order to get its details
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) {
      setUpdating(null);
      return;
    }

    const updatedOrderObj = { ...currentOrder, status };

    // 1. Commit the status update to the PostgreSQL database
    try {
      const dbRes = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (!dbRes.ok) {
        throw new Error('Failed to update order status in database');
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setUpdated(orderId);
    } catch (err: any) {
      console.error('Database update failed:', err);
      alert('Error updating order status in database: ' + err.message);
      setUpdating(null);
      return;
    }

    // 2. Show notification toast in sending mode
    setActiveNotification({
      order: updatedOrderObj,
      status,
      visible: true,
    });
    setEmailStatus(null); // Reset sending state

    // 3. Attempt to dispatch email notification (non-blocking)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: updatedOrderObj,
          status,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailStatus({ success: true });
      } else {
        // Email failed — status is already saved, just show warning
        setEmailStatus({
          success: false,
          error: data.message || data.error,
          code: data.error
        });
      }
    } catch (err: any) {
      console.error('Failed to trigger email send API:', err);
      setEmailStatus({
        success: false,
        error: err.message || 'Network error connecting to API'
      });
    }

    setUpdating(null);
    setTimeout(() => setUpdated(null), 2000);
  };

  const getEmailBodyContent = (order: any, status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return {
          headline: 'Your order is being processed!',
          message: 'Excellent choice! Our master Kitchenbays are now preparing your hand-crafted items. We are making sure everything is checked and packed with the utmost care.',
          bg: 'bg-blue-50/50',
        };
      case 'shipped':
        return {
          headline: 'Your package is on its way!',
          message: 'Great news! Your order has been handed over to our courier partner and is now in transit. A tracking number has been generated and your shipment is moving.',
          bg: 'bg-blue-50/50',
        };
      case 'delivered':
        return {
          headline: 'Delivered! Enjoy your handcrafted treasure.',
          message: 'Your order has been successfully delivered to your doorstep. We hope these authentic Indian handicrafts bring joy, style, and beauty to your home.',
          bg: 'bg-emerald-50/50',
        };
      case 'cancelled':
        return {
          headline: 'Your order has been cancelled',
          message: 'We are writing to confirm that your order has been cancelled. If a refund is applicable, it will be automatically processed to your original payment method in 5-7 business days. If you did not request this, please contact support.',
          bg: 'bg-red-50/50',
        };
      default:
        return {
          headline: 'Thank you for your order!',
          message: 'Your order has been successfully received. We will update you as soon as our Kitchenbays begin preparing your items.',
          bg: 'bg-amber-50/50',
        };
    }
  };

  return (
    <div className="space-y-5 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Order Management
        </h1>
        <button type="button" onClick={fetchOrders} className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm">Refresh</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin inline-block mb-4" />
          <p className="text-base font-semibold text-gray-500">Loading customer orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <ShoppingBag size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-base font-semibold text-gray-400">No orders yet</p>
          <p className="text-sm text-gray-300 mt-1">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Subtotal', 'Tax & Ship', 'Total', 'Payment', 'Current Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-blue-600">{order.id}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      <div className="mt-1 space-y-0.5">
                        {order.items.slice(0, 2).map((item: any, index: number) => (
                          <p key={item.productId || index} className="text-xs text-gray-400 truncate max-w-[120px]">{item.name} ×{item.quantity}</p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-300">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">{formatPrice(order.subtotal)}</td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-emerald-600">GST: {formatPrice(order.gstAmount)}</p>
                      <p className="text-xs font-medium text-blue-600">Ship: {formatPrice(order.shippingAmount)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border ${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-300 mt-1">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 border border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-sm text-center"
                        >
                          Review Order
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="relative w-full">
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              disabled={updating === order.id}
                              className="appearance-none w-full bg-white border border-gray-200 text-xs text-gray-700 pl-2.5 pr-7 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer disabled:opacity-50"
                            >
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                          {updating === order.id && (
                            <span className="w-4 h-4 border-2 border-violet-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                          )}
                          {updated === order.id && (
                            <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                              <Check size={10} className="text-emerald-600" />
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Simulated Email Notification Slide-in */}
      {activeNotification && activeNotification.visible && (
        <div className="fixed bottom-6 right-6 max-w-sm w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-50 animate-slide-in flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 tracking-wider">EMAIL NOTIFICATION</p>
                <p className="text-sm font-bold text-gray-800">Status Update Email</p>
              </div>
            </div>
            <button onClick={() => setActiveNotification(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed text-left">
            Dispatching status update notification to <strong className="text-gray-700">{activeNotification.order.email}</strong> informing them that order <strong className="text-gray-700">#{activeNotification.order.id}</strong> is now <span className="font-semibold text-blue-600">{activeNotification.status}</span>...
          </div>

          {/* Live Delivery Status Indicator */}
          <div className="text-xs select-none">
            {emailStatus === null ? (
              <div className="flex items-center gap-1.5 text-gray-400 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span> Dispatches in progress...
              </div>
            ) : emailStatus.success ? (
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <Check size={14} className="shrink-0" /> Real Email Delivered Successfully!
              </div>
            ) : emailStatus.code === 'SMTP_NOT_CONFIGURED' ? (
              <div className="flex flex-col gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-2 rounded-lg border border-amber-100">
                <div className="font-semibold flex items-center gap-1">
                  ⚠️ Email Not Sent
                </div>
                <div className="text-[10px] text-amber-700/90 leading-normal">
                  Status <strong>was saved</strong> and customer tracking is updated. However, no email was sent — SMTP is not configured in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-2 rounded-lg border border-amber-100">
                <div className="font-semibold flex items-center gap-1">
                  ⚠️ Email Not Sent
                </div>
                <div className="text-[10px] text-amber-700/90 leading-normal break-all">
                  Status <strong>was saved</strong> successfully. Email notification failed: {emailStatus.error || 'Connection failed.'}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Eye size={12} /> Preview Sent Email
            </button>
            <button
              type="button"
              onClick={() => setActiveNotification(null)}
              className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-lg text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Simulated Email Full Transactional View Modal */}
      {showEmailModal && activeNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Mail size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Email Dispatch Preview (Customer View)</h2>
                  <p className="text-xs text-gray-400">Sent to: {activeNotification.order.email}</p>
                </div>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Email Headers Info */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs text-gray-500 space-y-1 select-none text-left">
              <div><span className="font-semibold text-gray-400 w-16 inline-block">From:</span> Kitchenbay Alerts &lt;alerts@Kitchenbay.com&gt;</div>
              <div><span className="font-semibold text-gray-400 w-16 inline-block">To:</span> {activeNotification.order.customer} &lt;{activeNotification.order.email}&gt;</div>
              <div><span className="font-semibold text-gray-400 w-16 inline-block">Subject:</span> Update: Your Order #{activeNotification.order.id} is now {activeNotification.status.charAt(0).toUpperCase() + activeNotification.status.slice(1)}!</div>
            </div>

            {/* Email Body Area */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-100">
              {/* Actual Styled Email Mock */}
              <div className="bg-white w-full max-w-[550px] shadow-sm rounded-xl overflow-hidden border border-gray-200/50 flex flex-col text-gray-800 font-sans">

                {/* Email Logo Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-center text-white select-none">
                  <h1 className="text-2xl font-bold tracking-wide">Kitchenbay</h1>
                  <p className="text-xs text-blue-200 mt-1">Authentic Indian Handicrafts</p>
                </div>

                {/* Email Body Content */}
                <div className="p-8 space-y-6 text-left">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hello {activeNotification.order.customer},</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {getEmailBodyContent(activeNotification.order, activeNotification.status).message}
                    </p>
                  </div>

                  {/* Status alert card */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${getEmailBodyContent(activeNotification.order, activeNotification.status).bg
                    } border-blue-50`}>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">New Status</p>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {activeNotification.status}
                      </p>
                    </div>
                  </div>

                  {/* Order details section */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h3>
                    <div className="space-y-3">
                      {activeNotification.order.items.map((item: any, idx: number) => {
                        const normalized = item.product ? {
                          name: item.product.name,
                          quantity: item.quantity,
                          price: item.product.finalPrice || item.product.price
                        } : {
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price
                        };
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 truncate max-w-[280px]">{normalized.name} <span className="text-gray-400 font-medium">× {normalized.quantity}</span></span>
                            <span className="font-semibold text-gray-900">{formatPrice(normalized.price * normalized.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total breakdown section */}
                  <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(activeNotification.order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>CGST</span>
                      <span>{formatPrice(activeNotification.order.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>SGST</span>
                      <span>{formatPrice(activeNotification.order.sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-100 pt-2">
                      <span>Total Paid</span>
                      <span className="text-blue-600">{formatPrice(activeNotification.order.total)}</span>
                    </div>
                  </div>

                  {/* Footer notice */}
                  <div className="text-[11px] text-gray-400 text-center leading-relaxed border-t border-gray-100 pt-6 select-none">
                    Thank you for shopping with us and supporting regional Indian craftsmen. You can track your package details live at any time using your Order ID on our website.
                    <br />
                    <a href={`/orders/${activeNotification.order.id}`} target="_blank" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5 mt-2">
                      Track Order Page <ExternalLink size={10} />
                    </a>
                  </div>

                </div>

                {/* Email Footer Copyright */}
                <div className="bg-gray-50 border-t border-gray-100 py-4 text-center text-[10px] text-gray-400 select-none">
                  © 2026 Kitchenbay Inc. 12 MG Road, Bangalore, India.
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3 select-none">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 font-semibold rounded-xl text-sm text-gray-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detailed Order Review Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 to-[#0c2037] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/60">
              <div>
                <h3 className="font-bold text-lg text-yellow-400">Review Order Details</h3>
                <p className="text-xs text-blue-200/80">Order ID: <span className="font-mono">{selectedOrder.id}</span> • Submitted {new Date(selectedOrder.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronDown size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Client details & Product detail */}
              <div className="space-y-5">
                
                {/* Client brief */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Contact details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="grid grid-cols-3"><span className="text-gray-400">Customer Name:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedOrder.customer}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Mobile:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedOrder.phone}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Email:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedOrder.email}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Payment:</span> <span className="col-span-2 font-semibold text-blue-600 font-mono">{selectedOrder.paymentMethod}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Address:</span> <span className="col-span-2 font-semibold text-gray-800 leading-tight whitespace-pre-wrap">{selectedOrder.shippingAddress}</span></p>
                  </div>
                </div>

                {/* Product details */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Purchased Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {selectedOrder.items.map((item: any, idx: number) => {
                      const normalized = item.product ? {
                        name: item.product.name,
                        category: item.product.category || 'N/A',
                        image: item.product.image || '/images/marketing/everyday_cooking.jpg',
                        price: item.product.finalPrice || item.product.price
                      } : {
                        name: item.name,
                        category: 'N/A',
                        image: '/images/marketing/everyday_cooking.jpg',
                        price: item.price
                      };
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                          <img 
                            src={normalized.image} 
                            alt={normalized.name} 
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-800 text-sm line-clamp-1">{normalized.name}</h5>
                            <p className="text-[10px] text-gray-400 capitalize">Category: {normalized.category}</p>
                            <p className="text-xs text-gray-700 font-medium mt-0.5">
                              {formatPrice(normalized.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-sm font-extrabold text-gray-900">{formatPrice(normalized.price * item.quantity)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Admin actions, negotiated price, status update */}
              <div className="space-y-5 flex flex-col justify-between">
                
                {/* Dynamic Quotation Summary Generator (Invoice) */}
                <div className="bg-blue-950 text-white rounded-2xl p-4 border border-blue-900 shadow-sm mt-0">
                  <h5 className="text-xs font-bold text-yellow-400 uppercase mb-3 flex items-center gap-1">
                    <FileText size={12} /> Order Invoice Summary
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-blue-900/50 pb-2 mb-2">
                      <span className="text-blue-300">Total Items</span>
                      <span className="font-bold">{selectedOrder.items.reduce((acc: number, cur: any) => acc + cur.quantity, 0)} units</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-blue-300">Subtotal (Excl. Tax)</span>
                      <span className="font-bold">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>GST (18%)</span>
                      <span>+ {formatPrice(selectedOrder.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-blue-300">
                      <span>Shipping Fee</span>
                      <span>+ {formatPrice(selectedOrder.shippingAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-800 pt-3 mt-2 text-sm font-extrabold text-yellow-400">
                      <span>Grand Total Paid</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        let cleanMobile = selectedOrder.phone.replace(/\D/g, '');
                        if (cleanMobile.length === 10) cleanMobile = '91' + cleanMobile;
                        const text = `Hi ${selectedOrder.customer}, thank you for your order #${selectedOrder.id} from Kitchenbay.`;
                        window.open(`https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} /> WhatsApp Client
                    </button>
                    <a
                      href={`mailto:${selectedOrder.email}?subject=Order Update #${selectedOrder.id} - Kitchenbay`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <Mail size={14} /> Email Client
                    </a>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Update Order Status</label>
                    <div className="relative w-full">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as OrderStatus;
                          setSelectedOrder({...selectedOrder, status: newStatus});
                          handleStatusChange(selectedOrder.id, newStatus);
                        }}
                        disabled={updating === selectedOrder.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer text-center focus:outline-none appearance-none disabled:opacity-50"
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>➔ Set: {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-2 text-white">
                        {updating === selectedOrder.id ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Changing status will automatically trigger an email notification to the customer.</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
