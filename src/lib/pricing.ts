/**
 * ============================================================
 * KitchenBay — Centralized Pricing Utility
 * ============================================================
 *
 * CANONICAL CALCULATION ORDER (Indian e-commerce standard):
 *
 *   subtotal        = sum(basePrice × qty)
 *   totalDiscount   = firstOrderDiscount + couponDiscount
 *   taxableAmount   = subtotal - totalDiscount          ← GST base
 *   gstAmount       = taxableAmount × 0.05             ← 5% on taxable
 *   grandTotal      = taxableAmount + gstAmount + shippingFee - netBankingDiscount
 *
 * ROUNDING RULE:
 *   Never round intermediate values.
 *   Only round at the final display layer (Intl.NumberFormat).
 *
 * UNITS:
 *   All values in this file are in RUPEES (float).
 *   DB storage is in PAISE (integer). Multiply by 100 before storing.
 */

import { Product, CartItem } from './mockData';

// ── Constants ─────────────────────────────────────────────────
export const GST_RATE          = 0.05;          // 5%
export const SHIPPING_FEE_RUPEES = 99;
export const SHIPPING_FEE_PAISE  = SHIPPING_FEE_RUPEES * 100;
export const FREE_SHIPPING_THRESHOLD = 2000;    // ₹2,000+  → free shipping
export const COD_LIMIT_RUPEES  = 5999;          // COD not allowed above this

// ── Helper: Get the effective base price for a cart item ───────
/** Returns the variant's base price (or product base price) in RUPEES. NO GST included. */
export function getItemBasePrice(product: Product, size?: string): number {
  if (size && product.variants && product.variants[size]) {
    return product.variants[size].price;
  }
  return product.price;
}

// ── Helper: Get available stock for a cart item ────────────────
export function getItemStock(product: Product, size?: string): number {
  if (size && product.variants && product.variants[size]) {
    return product.variants[size].stock;
  }
  return product.stock;
}

// ── Helper: Get product-specific shipping fee in Rupees ────────
export function getProductShippingFee(product: any): number {
  if (!product) return SHIPPING_FEE_RUPEES;
  if (product.shippingFee !== undefined && product.shippingFee !== null) {
    // Raw DB value in paise (e.g. 9900) → convert to Rupees
    if (product.shippingFee > 1000) {
      return Math.round(product.shippingFee / 100);
    }
    return product.shippingFee;
  }
  return SHIPPING_FEE_RUPEES;
}

// ── Cart-level totals ──────────────────────────────────────────
export interface CartTotals {
  subtotal: number;       // Σ(basePrice × qty) — no GST
  taxableAmount: number;  // subtotal − coupon discount (GST applied here)
  gstAmount: number;      // taxableAmount × 5%  (full precision)
  cgstAmount: number;     // gstAmount / 2
  sgstAmount: number;     // gstAmount / 2
  shippingFee: number;    // ₹99, or ₹0 (free above threshold)
  discountAmount: number; // Coupon discount in RUPEES
  total: number;          // taxableAmount + gstAmount + shippingFee
}

export function calcCartTotals(
  items: CartItem[],
  appliedCoupon?: { discountAmount: number; type: string } | null
): CartTotals {
  // 1. Subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += getItemBasePrice(item.product, item.size) * item.quantity;
  }

  // 2. Shipping (free above threshold)
  let shippingFee = items.length > 0 ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_RUPEES) : 0;

  // 3. Coupon discount
  let discountAmountRupees = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'FREE_SHIPPING') {
      shippingFee = 0;
    } else {
      // appliedCoupon.discountAmount is stored in PAISE → convert to rupees
      discountAmountRupees = appliedCoupon.discountAmount / 100;
      if (discountAmountRupees > subtotal) discountAmountRupees = subtotal;
    }
  }

  // 4. Taxable amount = subtotal − coupon discount (GST base)
  const taxableAmount = subtotal - discountAmountRupees;

  // 5. GST at full precision — no intermediate rounding
  const gstAmount  = taxableAmount * GST_RATE;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  // 6. Grand total
  const total = taxableAmount + gstAmount + shippingFee;

  return {
    subtotal,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFee,
    discountAmount: discountAmountRupees,
    total,
  };
}

// ── Checkout-level totals (adds first-order & net-banking discounts) ──
export interface CheckoutTotals extends CartTotals {
  firstOrderDiscount: number;   // ₹100 (or less for small orders)
  netBankingDiscount: number;   // 2% of (taxableAmount + gstAmount)
  totalSavings: number;         // firstOrder + coupon + netBanking
  payableTotal: number;         // what the customer actually pays
}

export function calcCheckoutTotals(
  items: CartItem[],
  options: {
    appliedCoupon?: { discountAmount: number; type: string } | null;
    isFirstOrder?: boolean;
    paymentMethod?: string; // 'NETBANKING' triggers 2% extra discount
  } = {}
): CheckoutTotals {
  const { appliedCoupon, isFirstOrder = false, paymentMethod = 'COD' } = options;

  // Base totals from cart
  const cartTotals = calcCartTotals(items, appliedCoupon);

  // First-order discount (applied before GST)
  const firstOrderDiscount = isFirstOrder ? Math.min(100, cartTotals.subtotal) : 0;

  // Re-compute taxable amount with first-order discount also included
  const allPreGstDiscounts = cartTotals.discountAmount + firstOrderDiscount;
  const taxableAmount      = cartTotals.subtotal - allPreGstDiscounts;

  // GST on the combined taxable amount — full precision
  const gstAmount  = taxableAmount * GST_RATE;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  // Net banking discount (applied after GST, before payment)
  const netBankingDiscount = paymentMethod === 'NETBANKING'
    ? (taxableAmount + gstAmount) * 0.02
    : 0;

  const totalSavings = firstOrderDiscount + cartTotals.discountAmount + netBankingDiscount;

  const payableTotal = Math.max(0, taxableAmount + gstAmount + cartTotals.shippingFee - netBankingDiscount);

  return {
    subtotal:          cartTotals.subtotal,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFee:       cartTotals.shippingFee,
    discountAmount:    cartTotals.discountAmount,
    firstOrderDiscount,
    netBankingDiscount,
    totalSavings,
    payableTotal,
    total: payableTotal,
  };
}

/**
 * calcCheckoutTotalsFromValues
 *
 * Primitive-values version of calcCheckoutTotals.
 * Use this in Client Components (checkout page) to avoid the CartItem[] / mockData
 * dependency that Turbopack cannot always resolve in the client bundle.
 *
 * All monetary values in RUPEES.
 */
export interface CheckoutTotalsFromValues {
  taxableAmount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  firstOrderDiscount: number;
  netBankingDiscount: number;
  totalSavings: number;
  payableTotal: number;
}

export function calcCheckoutTotalsFromValues(
  subtotal: number,
  opts: {
    couponDiscountRupees?: number;   // already in Rupees
    shippingFeeRupees?: number;
    isFirstOrder?: boolean;
    paymentMethod?: string;
  } = {}
): CheckoutTotalsFromValues {
  const {
    couponDiscountRupees = 0,
    shippingFeeRupees = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_RUPEES,
    isFirstOrder = false,
    paymentMethod = 'COD',
  } = opts;

  const firstOrderDiscount   = isFirstOrder ? Math.min(100, subtotal) : 0;
  const allPreGstDiscounts   = couponDiscountRupees + firstOrderDiscount;
  const taxableAmount        = subtotal - allPreGstDiscounts;

  const gstAmount            = taxableAmount * GST_RATE;   // full precision
  const cgstAmount           = gstAmount / 2;
  const sgstAmount           = gstAmount / 2;

  const netBankingDiscount   = paymentMethod === 'NETBANKING'
    ? (taxableAmount + gstAmount) * 0.02
    : 0;

  const totalSavings         = firstOrderDiscount + couponDiscountRupees + netBankingDiscount;
  const payableTotal         = Math.max(0, taxableAmount + gstAmount + shippingFeeRupees - netBankingDiscount);

  return {
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    firstOrderDiscount,
    netBankingDiscount,
    totalSavings,
    payableTotal,
  };
}


/**
 * Server-side pricing helper (mirrors calcCheckoutTotals but works with raw
 * paise values from the DB instead of CartItem[] objects).
 *
 * @param subtotalRupees  Σ(basePrice × qty) in RUPEES (already converted from paise)
 * @param opts
 */
export interface ServerCheckoutTotals {
  subtotalRupees: number;
  firstOrderDiscount: number;
  couponDiscountRupees: number;
  taxableAmount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  shippingFeeRupees: number;
  netBankingDiscount: number;
  payableTotal: number;
  totalSavings: number;
}

export function calcServerCheckoutTotals(
  subtotalRupees: number,
  opts: {
    isFirstOrder?: boolean;
    couponDiscountPaise?: number; // raw paise from DB / request body
    paymentMethod?: string;
    shippingFeeRupees?: number;
  } = {}
): ServerCheckoutTotals {
  const {
    isFirstOrder = false,
    couponDiscountPaise = 0,
    paymentMethod = 'COD',
    shippingFeeRupees = subtotalRupees >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_RUPEES,
  } = opts;

  const firstOrderDiscount     = isFirstOrder ? Math.min(100, subtotalRupees) : 0;
  const couponDiscountRupees   = Math.min(couponDiscountPaise / 100, subtotalRupees);
  const allPreGstDiscounts     = firstOrderDiscount + couponDiscountRupees;
  const taxableAmount          = subtotalRupees - allPreGstDiscounts;

  // Full-precision GST
  const gstAmount  = taxableAmount * GST_RATE;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  const netBankingDiscount = paymentMethod === 'NETBANKING'
    ? (taxableAmount + gstAmount) * 0.02
    : 0;

  const totalSavings = firstOrderDiscount + couponDiscountRupees + netBankingDiscount;

  const payableTotal = Math.max(0, taxableAmount + gstAmount + shippingFeeRupees - netBankingDiscount);

  return {
    subtotalRupees,
    firstOrderDiscount,
    couponDiscountRupees,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFeeRupees,
    netBankingDiscount,
    payableTotal,
    totalSavings,
  };
}

// ── Format price in INR (decimal display) ─────────────────────
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Paise → Rupees conversion for display */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Rupees → Paise for DB storage (always integer) */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
