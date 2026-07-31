'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormInput from '@/components/FormInput';
import PromoCodeInput from '@/components/PromoCodeInput';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import {
  Check,
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  ArrowRight,
  Lock,
  Award,
  AlertCircle,
  Timer,
  X,
  Package,
  MapPin,
  ReceiptText,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { calcCheckoutPricingFromCoupon } from '@/lib/checkoutPricing';

type PaymentMethod = 'RAZORPAY' | 'COD' | 'NETBANKING';

// ── Load Razorpay checkout script dynamically ───────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Format helpers ──────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(p);

const formatINR = (p: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(p);

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ════════════════════════════════════════════════════════════
// CHECKOUT PAGE
// ════════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const { items, subtotal, taxableAmount, gstAmount, cgstAmount, sgstAmount, shippingFee, discountAmount, total, clearCart, removeItem, appliedCoupon } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Success / Failure state ───────────────────────────────
  const [ordered, setOrdered] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [orderedItems, setOrderedItems] = useState<typeof items>([]);
  const [orderedAddress, setOrderedAddress] = useState(form);
  const [orderedMethod, setOrderedMethod] = useState('');
  const [orderedTotal, setOrderedTotal] = useState(0);

  // ── 5-minute countdown timer ──────────────────────────────
  const TIMER_SECONDS = 300;
  const [countdown, setCountdown] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isFirstOrder, setIsFirstOrder] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetch('/api/orders')
        .then(res => res.ok ? res.json() : [])
        .then((orders: any) => {
          const completedOrders = orders.filter((o: any) => o.paymentStatus === 'PAID' || o.paymentStatus === 'COD_PENDING' || o.status === 'PROCESSING' || o.status === 'DELIVERED');
          setIsFirstOrder(completedOrders.length === 0);
        })
        .catch(() => setIsFirstOrder(false));
    } else {
      setIsFirstOrder(false);
    }
  }, [currentUser]);

  // ── Correct GST calculation via standalone pricing engine ──────────────────
  const checkoutTotals = calcCheckoutPricingFromCoupon(
    subtotal,
    shippingFee,
    appliedCoupon,
    isFirstOrder,
    paymentMethod,
    gstAmount,
  );
  const firstOrderDiscount  = checkoutTotals.firstOrderDiscount;
  const gstAmountCheckout   = checkoutTotals.gstAmount;
  const cgstAmountCheckout  = checkoutTotals.cgstAmount;
  const sgstAmountCheckout  = checkoutTotals.sgstAmount;
  const netBankingDiscount  = checkoutTotals.netBankingDiscount;
  const totalSavings        = checkoutTotals.totalSavings;
  const payableTotal        = checkoutTotals.payableTotal;

  const gstRates = Array.from(new Set(items.map(i => i.product.gstPercent ?? 5)));
  const gstLabel = gstRates.length === 1 ? `GST ${gstRates[0]}%` : 'GST';

  useEffect(() => {
  }, [payableTotal, paymentMethod]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          setLoading(false);
          setPaymentFailed(true);
          setFailureReason('Payment session expired. The 5-minute window has closed.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const stopTimer = () => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        fullName: currentUser.name || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrorMsg(null);
  };

  // ════════════════════════════════════════════════════════════
  // RAZORPAY PAYMENT
  // ════════════════════════════════════════════════════════════
  const handleRazorpayPayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setErrorMsg('Failed to load Razorpay. Check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      setCountdown(TIMER_SECONDS);
      setTimerActive(true);

      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size || "",
          })),
          address: {
            street: form.address,
            city: form.city,
            state: form.state,
            zip: form.pincode,
          },
          couponCode: appliedCoupon?.code,
          isFirstOrder,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      const { keyId, amount, currency, razorpayOrderId, dbOrderId } = data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Kitchenbay',
        description: 'Authentic Indian Handicrafts',
        order_id: razorpayOrderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#2563EB' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            stopTimer();
            setTransactionId(response.razorpay_payment_id);
            setOrderedItems([...items]);
            setOrderedAddress({ ...form });
            setOrderedMethod('Razorpay (UPI / Card / Netbanking)');
            setOrderedTotal(payableTotal);
            setPlacedOrderId(verifyData.orderId);
            clearCart();
            setOrdered(true);

            Swal.fire({
              title: 'Order Placed!',
              text: 'Your order has been successfully placed.',
              icon: 'success',
              confirmButtonColor: '#2563EB'
            });

            fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order: {
                  id: verifyData.orderId,
                  customer: form.fullName,
                  email: form.email,
                  items: items,
                  subtotal,
                  cgstAmount: cgstAmountCheckout,
                  sgstAmount: sgstAmountCheckout,
                  total: payableTotal
                },
                status: 'processing'
              })
            }).catch(console.error);
          } catch (err: any) {
            stopTimer();
            setPaymentFailed(true);
            setFailureReason(err.message || 'Signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            stopTimer();
            setLoading(false);
            setErrorMsg('Payment cancelled. You can try again.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        stopTimer();
        setLoading(false);
        setPaymentFailed(true);
        setFailureReason(
          resp.error?.description || 'Payment was declined by the bank/UPI provider.'
        );
      });
      rzp.open();
    } catch (err: any) {
      stopTimer();
      setErrorMsg(err.message || 'Error initiating payment.');
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // COD PAYMENT
  // ════════════════════════════════════════════════════════════
  const handleCodPayment = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: payableTotal,
          paymentStatus: 'COD_PENDING',
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.finalPrice,
            size: item.size || "",
          })),
          address: {
            street: form.address,
            city: form.city,
            state: form.state,
            zip: form.pincode,
          },
          couponCode: appliedCoupon?.code,
          isFirstOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place COD order');

      setOrderedItems([...items]);
      setOrderedAddress({ ...form });
      setOrderedMethod('Cash on Delivery');
      setOrderedTotal(payableTotal);
      setPlacedOrderId(data.id);
      clearCart();
      setOrdered(true);

      Swal.fire({
        title: 'Order Placed!',
        text: 'Your order has been successfully placed.',
        icon: 'success',
        confirmButtonColor: '#2563EB'
      });

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: data.id,
            customer: form.fullName,
            email: form.email,
            items: items,
            subtotal,
            cgstAmount: cgstAmountCheckout,
            sgstAmount: sgstAmountCheckout,
            total: payableTotal
          },
          status: 'processing'
        })
      }).catch(console.error);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error placing COD order.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setPaymentFailed(false);

    if (paymentMethod === 'RAZORPAY' || paymentMethod === 'NETBANKING') {
      await handleRazorpayPayment();
    } else {
      await handleCodPayment();
    }
  };

  if (items.length === 0 && !ordered && !paymentFailed) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <AlertCircle size={48} className="text-blue-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-1">Your cart is empty</h1>
          <p className="text-gray-500 text-sm mb-6">
            Add items from our collection to place an order.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
          >
            Browse Products
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <X size={36} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-1">We couldn&apos;t process your payment.</p>
            <p className="text-sm text-red-500/90 mb-6 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              {failureReason || 'An unknown error occurred during the payment process.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentFailed(false);
                  setFailureReason('');
                  setCountdown(TIMER_SECONDS);
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1.5 shadow-md"
              >
                <RefreshCw size={14} /> Retry Payment
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={36} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500">
              Thank you for your purchase. A confirmation will be sent to{' '}
              <strong>{orderedAddress.email}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-blue-600 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                <ReceiptText size={14} /> Transaction Details
              </h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-bold text-gray-800">#{placedOrderId}</span>
                </div>
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded">
                      {transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-semibold text-emerald-600">
                    {transactionId ? 'PAID via Razorpay' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-700">{orderedMethod}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-700 text-lg">
                    {formatINR(orderedTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-blue-600 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                <MapPin size={14} /> Shipping Address
              </h2>
              <p className="text-sm font-semibold text-gray-800">
                {orderedAddress.fullName}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mt-1">
                {orderedAddress.address}
                <br />
                {orderedAddress.city}, {orderedAddress.state} &ndash; {orderedAddress.pincode}
              </p>
              <p className="text-sm text-gray-500 mt-2">{orderedAddress.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-5">
            <h2 className="text-xs font-bold text-blue-600 tracking-wide uppercase mb-4 flex items-center gap-1.5">
              <Package size={14} /> Ordered Items ({orderedItems.length})
            </h2>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {orderedItems.map(({ product, quantity, size }) => (
                <div
                  key={`${product.id}-${size || ''}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </p>
                    {size && (
                      <span className="text-xs font-bold text-blue-600 uppercase block mt-0.5">
                        Size: {size}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: {quantity} &times; {formatINR(product.finalPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    {formatINR(product.finalPrice * quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push(`/orders/${placedOrderId}`)}
              className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Track Order
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1.5 shadow-md"
            >
              Shop More <ArrowRight size={14} />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Provide shipping details and choose a payment method.
            </p>
          </div>

          {timerActive && (
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold animate-pulse ${
                countdown <= 60
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <Timer size={16} />
              Complete payment in {fmtTime(countdown)}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to complete checkout</p>
              <p className="mt-0.5 text-xs text-red-600/90">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Truck size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Shipping Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput id="fullName" label="Full Name" placeholder="Rahul Sharma" value={form.fullName} onChange={handleChange} required />
                  <FormInput id="email" label="Email" type="email" placeholder="rahul@example.com" value={form.email} onChange={handleChange} required />
                  <FormInput id="phone" label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
                  <FormInput id="pincode" label="PIN Code" placeholder="560001" value={form.pincode} onChange={handleChange} required />

                  <div className="sm:col-span-2">
                    <FormInput id="address" label="Address" as="textarea" placeholder="House / Flat No., Street, Area" value={form.address} onChange={handleChange} required rows={3} />
                  </div>

                  <FormInput id="city" label="City" placeholder="Bangalore" value={form.city} onChange={handleChange} required />

                  <FormInput id="state" label="State" as="select" value={form.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {[
                      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                      'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
                      'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
                      'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
                      'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
                      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </FormInput>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Payment Option</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'RAZORPAY' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'RAZORPAY' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
                        Razorpay Secure <ShieldCheck size={14} className="text-blue-600" />
                      </p>
                      <p className="text-xs text-gray-400 mt-1">UPI (QR / App Links), Cards, Netbanking, Wallets</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'COD'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'COD' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'COD' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-950">Cash on Delivery</p>
                      <p className="text-xs text-gray-400 mt-1">Pay with cash when your parcel is delivered at home.</p>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'RAZORPAY' && (
                  <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <Smartphone size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900">Seamless UPI checkout</p>
                      <p className="text-[11px] text-blue-800/80 leading-normal mt-0.5">
                        Includes automatic QR code generation, mobile app deep links (GPay, PhonePe, Paytm), and major cards/wallets natively inside the payment frame.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                    <Smartphone size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Direct Net Banking Discount</p>
                      <p className="text-[11px] text-emerald-800/80 leading-normal mt-0.5">
                        Receive an additional 2% discount automatically applied. Select your bank inside the Razorpay modal.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <Truck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Cash handling conditions</p>
                      <p className="text-[11px] text-amber-800/80 leading-normal mt-0.5">
                        Please ensure exact cash amounts are kept ready at your delivery location. Shipments will be dispatched upon verify checks.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Order Summary ───────────────────────────── */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Product list */}
                <div className="space-y-3.5 mb-5 max-h-[260px] overflow-y-auto pr-1">
                  {items.map(({ product, quantity, size }) => (
                    <div key={`${product.id}-${size || ''}`} className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        {size && (
                          <span className="inline-block text-[10px] font-bold text-blue-600 uppercase">
                            Size: {size}
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Qty: {quantity} &bull; {formatINR(product.finalPrice)}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        {formatINR(product.finalPrice * quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id, size || undefined)}
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bill breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="pb-3 border-b border-gray-100">
                    <PromoCodeInput />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-800">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping: Flat rate</span>
                    <span className="font-semibold text-gray-800">{shippingFee > 0 ? formatINR(shippingFee) : 'FREE'}</span>
                  </div>

                  {firstOrderDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                      <span>First Order Discount</span>
                      <span>-{formatINR(firstOrderDiscount)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}

                  {netBankingDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                      <span>Net Banking Discount (2%)</span>
                      <span>-{formatINR(netBankingDiscount)}</span>
                    </div>
                  )}

                  {gstAmountCheckout > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{gstLabel}</span>
                      <span className="font-semibold text-gray-800">+{formatINR(gstAmountCheckout)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 my-2" />

                  <div className="pt-1 flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-base">Total:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-700">{formatINR(payableTotal)}</span>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        (includes {formatINR(gstAmountCheckout)} Tax)
                      </p>
                    </div>
                  </div>

                  {/* Savings card */}
                  {totalSavings > 0 && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center animate-bounce">
                      <p className="text-xs font-bold text-emerald-800">
                        You Saved {formatINR(totalSavings)} Today 🎉
                      </p>
                    </div>
                  )}
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing checkout...
                    </span>
                  ) : (
                    <>
                      <Lock size={16} />
                      Pay Securely &mdash; {formatINR(payableTotal)}
                    </>
                  )}
                </button>

                {/* Trust seals */}
                <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-2 bg-gray-50/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                    <span>PCI-DSS Compliant 256-bit SSL encrypted payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Award size={12} className="text-blue-500 shrink-0" />
                    <span>Authorized Kitchenbay craft products with standard warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
