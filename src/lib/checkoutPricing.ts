/**
 * checkoutPricing.ts
 * ─────────────────────────────────────────────────────────────
 * STANDALONE pricing engine — zero external imports.
 *
 * Safe for every context: client components, server routes, edge
 * functions, and unit tests. No mockData, no Prisma, no React.
 *
 * ── CANONICAL CALCULATION ORDER ──────────────────────────────
 *
 *   subtotal         = Σ(basePrice × qty)
 *
 *   taxableAmount    = subtotal − couponDiscount − firstOrderDiscount
 *
 *   gstAmount        = taxableAmount × GST_RATE     (full precision)
 *
 *   grandTotal       = taxableAmount + gstAmount + shippingFee
 *                    − netBankingDiscount
 *
 * ── ROUNDING RULE ────────────────────────────────────────────
 *   Never round intermediate values.
 *   Round ONLY when writing to the DB (Math.round × 100 → paise).
 *   Round ONLY at display time (Intl.NumberFormat).
 *
 * ── SHIPPING RULE ────────────────────────────────────────────
 *   Shipping is product-specific. The caller is responsible for
 *   computing the correct shippingFeeRupees from the cart items
 *   (max of product fees, fallback to SHIPPING_FEE_RUPEES = ₹99).
 *   Shipping is automatically waived once subtotal reaches
 *   FREE_SHIPPING_THRESHOLD_RUPEES (₹2000).
 */

// ── Constants ─────────────────────────────────────────────────
export const GST_RATE                     = 0.05;  // 5%
export const SHIPPING_FEE_RUPEES          = 99;    // Default fallback when product has no fee configured
export const FREE_SHIPPING_THRESHOLD_RUPEES = 2000; // Orders at/above this subtotal ship free
export const COD_LIMIT_RUPEES             = 5999;  // COD blocked above this

// ── Result type ───────────────────────────────────────────────
export interface CheckoutPricingResult {
  /** Σ(basePrice × qty) — no GST, no discounts */
  subtotal: number;
  /** subtotal − couponDiscount − firstOrderDiscount */
  taxableAmount: number;
  /** taxableAmount × 5% — full decimal precision */
  gstAmount: number;
  /** gstAmount / 2 */
  cgstAmount: number;
  /** gstAmount / 2 */
  sgstAmount: number;
  /** Shipping fee from product configuration (caller-supplied) */
  shippingFeeRupees: number;
  /** Coupon discount in rupees */
  couponDiscountRupees: number;
  /** First-order rupee discount (₹100 max) */
  firstOrderDiscount: number;
  /** 2% of (taxableAmount + gstAmount) when payment = NETBANKING */
  netBankingDiscount: number;
  /** couponDiscount + firstOrderDiscount + netBankingDiscount */
  totalSavings: number;
  /** What the customer actually pays */
  payableTotal: number;
}

/**
 * Core pricing function — accepts ONLY primitive numbers.
 *
 * @param subtotal                    Σ(basePrice × qty) in Rupees
 * @param opts.couponDiscountRupees   Coupon savings in Rupees (default 0)
 * @param opts.shippingFeeRupees      Shipping fee in Rupees (default SHIPPING_FEE_RUPEES = ₹99)
 * @param opts.isFirstOrder           Whether this is the customer's first order
 * @param opts.paymentMethod          'NETBANKING' triggers 2% extra discount
 * @param opts.freeShipping           True when a FREE_SHIPPING coupon is applied
 */
export function calcCheckoutPricing(
  subtotal: number,
  opts: {
    couponDiscountRupees?: number;
    shippingFeeRupees?: number;
    isFirstOrder?: boolean;
    paymentMethod?: string;
    freeShipping?: boolean;
    /** Pre-computed GST in Rupees (per-product rates). When provided, overrides
     *  the flat GST_RATE. Should already reflect the post-discount taxable base. */
    gstAmountOverride?: number;
  } = {}
): CheckoutPricingResult {
  const {
    couponDiscountRupees = 0,
    isFirstOrder = false,
    paymentMethod = 'COD',
    freeShipping = false,
    gstAmountOverride,
  } = opts;

  // Shipping: free-shipping coupon → ₹2000+ order → explicit override → fallback default
  const shippingFeeRupees =
    freeShipping || subtotal >= FREE_SHIPPING_THRESHOLD_RUPEES
      ? 0
      : opts.shippingFeeRupees !== undefined
      ? opts.shippingFeeRupees
      : SHIPPING_FEE_RUPEES;

  // First-order discount (applied before GST calculation — reduces taxable base)
  const firstOrderDiscount = isFirstOrder ? Math.min(100, subtotal) : 0;

  // Combined pre-GST discounts
  const allPreGstDiscounts = couponDiscountRupees + firstOrderDiscount;
  const netSubtotal = Math.max(0, subtotal - allPreGstDiscounts);

  // GST — extracted from tax-inclusive prices using netSubtotal × (rate / (100 + rate)).
  // Product prices are GST Inclusive, so GST is extracted for display only and NOT added to total.
  let gstAmount: number;
  if (gstAmountOverride !== undefined) {
    // Override reflects coupon-discounted base; scale further for first-order discount.
    const couponTaxable = Math.max(0, subtotal - couponDiscountRupees);
    const scale = couponTaxable > 0 ? netSubtotal / couponTaxable : 0;
    gstAmount = gstAmountOverride * scale;
  } else {
    // Default 5% GST extraction: netSubtotal × (5 / 105)
    gstAmount = netSubtotal * (5 / 105);
  }
  gstAmount = Math.round(gstAmount * 100) / 100;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;

  // Taxable amount is netSubtotal minus extracted GST component (base product value before tax)
  const taxableAmount = Math.round((netSubtotal - gstAmount) * 100) / 100;

  // Net banking discount (2% off net subtotal)
  let netBankingDiscount =
    paymentMethod === 'NETBANKING' ? netSubtotal * 0.02 : 0;
  netBankingDiscount = Math.round(netBankingDiscount * 100) / 100;

  const totalSavings =
    couponDiscountRupees + firstOrderDiscount + netBankingDiscount;

  // Final payable amount = subtotal + shipping - all discounts.
  // Selling prices are ALREADY GST-inclusive, so GST is NOT added again.
  const payableTotal = Math.round(
    Math.max(0, netSubtotal + shippingFeeRupees - netBankingDiscount) * 100
  ) / 100;

  return {
    subtotal,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFeeRupees,
    couponDiscountRupees,
    firstOrderDiscount,
    netBankingDiscount,
    totalSavings,
    payableTotal,
  };
}

/**
 * Convenience: build a CheckoutPricingResult from an applied-coupon object
 * (the shape stored in CartContext) rather than raw paise values.
 *
 * @param subtotal          Σ(basePrice × qty) in Rupees
 * @param shippingFeeRupees Shipping fee in Rupees (from cart context — product-derived)
 * @param appliedCoupon     { discountAmount: number (PAISE), type: string } | null
 * @param isFirstOrder      Whether this is the customer's first order
 * @param paymentMethod     'NETBANKING' | 'RAZORPAY' | 'COD'
 */
export function calcCheckoutPricingFromCoupon(
  subtotal: number,
  shippingFeeRupees: number,
  appliedCoupon: { discountAmount: number; type: string } | null | undefined,
  isFirstOrder: boolean,
  paymentMethod: string,
  gstAmountOverride?: number
): CheckoutPricingResult {
  const freeShipping  = appliedCoupon?.type === 'FREE_SHIPPING';
  // discountAmount in cart context is stored in PAISE → convert
  const couponDiscountRupees = freeShipping
    ? 0
    : (appliedCoupon?.discountAmount ?? 0) / 100;

  return calcCheckoutPricing(subtotal, {
    couponDiscountRupees,
    shippingFeeRupees: freeShipping ? 0 : shippingFeeRupees,
    isFirstOrder,
    paymentMethod,
    freeShipping,
    gstAmountOverride,
  });
}

// ── Display helpers ────────────────────────────────────────────

/** Format rupees with up to 2 decimal places (shows ₹47.45 and ₹999, never ₹999.00) */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Paise → Rupees */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Rupees → Paise for DB storage (always integer) */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
