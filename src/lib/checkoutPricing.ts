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
 *   There is NO automatic free-shipping threshold.
 */

// ── Constants ─────────────────────────────────────────────────
export const GST_RATE            = 0.05;  // 5%
export const SHIPPING_FEE_RUPEES = 99;    // Default fallback when product has no fee configured
export const COD_LIMIT_RUPEES    = 5999;  // COD blocked above this

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

  // Shipping: explicit override → free-shipping coupon → fallback default
  // NOTE: No automatic free-shipping threshold. Shipping is product-configured.
  const shippingFeeRupees =
    freeShipping
      ? 0
      : opts.shippingFeeRupees !== undefined
      ? opts.shippingFeeRupees
      : SHIPPING_FEE_RUPEES;

  // First-order discount (applied before GST — reduces taxable base)
  const firstOrderDiscount = isFirstOrder ? Math.min(100, subtotal) : 0;

  // Combined pre-GST discounts
  const allPreGstDiscounts = couponDiscountRupees + firstOrderDiscount;
  const taxableAmount = Math.max(0, subtotal - allPreGstDiscounts);

  // GST — full precision, NO intermediate rounding.
  // Per-product override (scaled for the first-order discount) wins over flat rate.
  let gstAmount: number;
  if (gstAmountOverride !== undefined) {
    // Override reflects coupon-discounted base; scale further for first-order discount.
    const couponTaxable = Math.max(0, subtotal - couponDiscountRupees);
    const scale = couponTaxable > 0 ? taxableAmount / couponTaxable : 0;
    gstAmount = gstAmountOverride * scale;
  } else {
    gstAmount = taxableAmount * GST_RATE;
  }
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  // Net banking discount (2% off taxable + GST subtotal)
  const netBankingDiscount =
    paymentMethod === 'NETBANKING' ? (taxableAmount + gstAmount) * 0.02 : 0;

  const totalSavings =
    couponDiscountRupees + firstOrderDiscount + netBankingDiscount;

  const payableTotal = Math.max(
    0,
    taxableAmount + gstAmount + shippingFeeRupees - netBankingDiscount
  );

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
