'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { Tag, X, Loader2, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function PromoCodeInput() {
  const { appliedCoupon, applyCoupon, removeCoupon, subtotal, discountAmount } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attemptedCode, setAttemptedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setIsLoading(true);
    setError('');
    setAttemptedCode(trimmedCode.toUpperCase());

    const result = await applyCoupon(trimmedCode);
    if (!result.success) {
      setError(result.error || 'Invalid coupon code');
    } else {
      setCode('');
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  const formatPrice = (rupees: number) =>
    '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(rupees);

  // ── Applied state ────────────────────────────────────────
  if (appliedCoupon) {
    // discountAmount from cartContext is already in RUPEES
    const savedAmount = appliedCoupon.type === 'FREE_SHIPPING' ? 99 : discountAmount;

    return (
      <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Promo Code Applied!</p>
              <p className="text-base font-bold text-green-800 uppercase tracking-widest mt-0.5">
                {appliedCoupon.code}
              </p>
              <p className="text-sm font-semibold text-green-700 mt-1">
                {appliedCoupon.type === 'FREE_SHIPPING'
                  ? '🎉 Free Shipping applied!'
                  : `🎉 You save ${formatPrice(savedAmount)} on this order!`}
              </p>
            </div>
          </div>
          <button
            onClick={removeCoupon}
            className="shrink-0 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1 transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // ── Input state ──────────────────────────────────────────
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Tag size={16} className="text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-700">Have a Promo Code?</span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {/* Expandable input */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } }}
              placeholder="Enter promo code"
              autoFocus
              className="flex-1 min-w-0 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2.5 font-mono tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-400 transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={!code.trim() || isLoading || subtotal <= 0}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] shadow-sm"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
            </button>
          </div>

          {/* Error message with the attempted code highlighted */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                {attemptedCode && (
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    &ldquo;{attemptedCode}&rdquo;
                  </p>
                )}
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
