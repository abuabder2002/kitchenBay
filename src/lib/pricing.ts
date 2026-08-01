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
export const GST_RATE            = 0.05;          // 5%
export const SHIPPING_FEE_RUPEES = 99;            // Default fallback when product has no fee
export const SHIPPING_FEE_PAISE  = SHIPPING_FEE_RUPEES * 100;
export const FREE_SHIPPING_THRESHOLD_RUPEES = 2000; // Orders at/above this subtotal ship free
export const COD_LIMIT_RUPEES    = 5999;          // COD not allowed above this

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
  gstAmount: number;      // Σ(itemTaxable × product gstPercent) (full precision)
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

  // 2. Effective shipping fee:
  //    Product-specific fees are used. The highest fee among cart items wins
  //    (one consolidated shipping charge). Falls back to SHIPPING_FEE_RUPEES (₹99)
  //    if a product has no shippingFee configured.
  //    Free once the cart subtotal reaches FREE_SHIPPING_THRESHOLD_RUPEES (₹2000).
  let shippingFee = 0;
  if (items.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD_RUPEES) {
    const productFees = items.map(item => getProductShippingFee(item.product));
    shippingFee = Math.max(...productFees);
  }

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

  // 4. Net subtotal = subtotal − coupon discount
  const netSubtotal = Math.max(0, subtotal - discountAmountRupees);

  // 5. GST extracted from tax-inclusive item prices — per-product rate (falls back to 5%).
  //    Formula for tax-inclusive price: GST = Price × (rate / (100 + rate))
  const discountRatio = subtotal > 0 ? discountAmountRupees / subtotal : 0;
  let gstAmount = 0;
  for (const item of items) {
    const itemSubtotal = getItemBasePrice(item.product, item.size) * item.quantity;
    const itemDiscounted = itemSubtotal * (1 - discountRatio);
    const percent = item.product.gstPercent ?? 5;
    // Extract included GST using percent / (100 + percent)
    gstAmount += itemDiscounted * (percent / (100 + percent));
  }
  gstAmount = Math.round(gstAmount * 100) / 100;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;

  // Taxable amount is netSubtotal minus the extracted GST component
  const taxableAmount = Math.round((netSubtotal - gstAmount) * 100) / 100;

  // 6. Grand total = subtotal - discount + shipping (GST is already included in subtotal)
  const total = Math.round((netSubtotal + shippingFee) * 100) / 100;

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
  netBankingDiscount: number;   // 2% of net subtotal
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

  // First-order discount
  const firstOrderDiscount = isFirstOrder ? Math.min(100, cartTotals.subtotal) : 0;

  // Combined pre-GST discounts
  const allPreGstDiscounts = cartTotals.discountAmount + firstOrderDiscount;
  const netSubtotal        = Math.max(0, cartTotals.subtotal - allPreGstDiscounts);

  // Extract GST from tax-inclusive netSubtotal
  const gstAmount  = Math.round((netSubtotal * (5 / 105)) * 100) / 100;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;
  const taxableAmount = Math.round((netSubtotal - gstAmount) * 100) / 100;

  // Net banking discount (2% off net subtotal)
  const netBankingDiscount = Math.round(
    (paymentMethod === 'NETBANKING' ? netSubtotal * 0.02 : 0) * 100
  ) / 100;

  const totalSavings = firstOrderDiscount + cartTotals.discountAmount + netBankingDiscount;

  // Total payable = netSubtotal + shipping - netBankingDiscount (GST already in subtotal)
  const payableTotal = Math.round(
    Math.max(0, netSubtotal + cartTotals.shippingFee - netBankingDiscount) * 100
  ) / 100;

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
    shippingFeeRupees = SHIPPING_FEE_RUPEES,
    isFirstOrder = false,
    paymentMethod = 'COD',
  } = opts;

  const firstOrderDiscount   = isFirstOrder ? Math.min(100, subtotal) : 0;
  const allPreGstDiscounts   = couponDiscountRupees + firstOrderDiscount;
  const netSubtotal          = Math.max(0, subtotal - allPreGstDiscounts);

  const gstAmount            = Math.round((netSubtotal * (5 / 105)) * 100) / 100;
  const cgstAmount           = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount           = Math.round((gstAmount - cgstAmount) * 100) / 100;
  const taxableAmount        = Math.round((netSubtotal - gstAmount) * 100) / 100;

  const netBankingDiscount   = Math.round(
    (paymentMethod === 'NETBANKING' ? netSubtotal * 0.02 : 0) * 100
  ) / 100;

  const totalSavings         = firstOrderDiscount + couponDiscountRupees + netBankingDiscount;
  const payableTotal         = Math.round(
    Math.max(0, netSubtotal + shippingFeeRupees - netBankingDiscount) * 100
  ) / 100;

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
    shippingFeeRupees = SHIPPING_FEE_RUPEES,
  } = opts;

  const firstOrderDiscount     = isFirstOrder ? Math.min(100, subtotalRupees) : 0;
  const couponDiscountRupees   = Math.min(couponDiscountPaise / 100, subtotalRupees);
  const allPreGstDiscounts     = firstOrderDiscount + couponDiscountRupees;
  const netSubtotal            = Math.max(0, subtotalRupees - allPreGstDiscounts);

  // 2-decimal precision GST extraction
  const gstAmount  = Math.round((netSubtotal * (5 / 105)) * 100) / 100;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;
  const taxableAmount = Math.round((netSubtotal - gstAmount) * 100) / 100;

  const netBankingDiscount = Math.round(
    (paymentMethod === 'NETBANKING' ? netSubtotal * 0.02 : 0) * 100
  ) / 100;

  const totalSavings = firstOrderDiscount + couponDiscountRupees + netBankingDiscount;

  const payableTotal = Math.round(
    Math.max(0, netSubtotal + shippingFeeRupees - netBankingDiscount) * 100
  ) / 100;

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

/**
 * variants[size].price is stored in PAISE in the DB (same convention as Product.price).
 * These helpers convert the whole variants map at the API boundary — mirrors how
 * Product.price/discountPrice/shippingFee are converted in the products API routes.
 */
export function variantsToRupees<T extends Record<string, any>>(variants: T | null | undefined): T | null | undefined {
  if (!variants) return variants;
  return Object.fromEntries(
    Object.entries(variants).map(([size, data]) => [
      size,
      { ...data, price: typeof data?.price === 'number' ? data.price / 100 : data?.price },
    ])
  ) as T;
}

export function variantsToPaise<T extends Record<string, any>>(variants: T | null | undefined): T | null | undefined {
  if (!variants) return variants;
  return Object.fromEntries(
    Object.entries(variants).map(([size, data]) => [
      size,
      { ...data, price: Math.round((parseFloat(data?.price) || 0) * 100), stock: parseInt(data?.stock) || 0 },
    ])
  ) as T;
}

/**
 * Same as variantsToRupees but strips the per-size `image` (base64 data URL) —
 * used for list endpoints where full images would blow past payload limits.
 * Keeps price/stock so cards can still switch price & availability per size.
 */
export function variantsToRupeesLite(variants: Record<string, any> | null | undefined): Record<string, { price: number; stock: number }> | null {
  if (!variants) return null;
  return Object.fromEntries(
    Object.entries(variants).map(([size, data]) => [
      size,
      { price: typeof data?.price === 'number' ? data.price / 100 : data?.price, stock: data?.stock ?? 0 },
    ])
  );
}
