/**
 * ============================================================
 * KitchenBay — Centralized Pricing Utility
 * ============================================================
 *
 * RULE: Base MRP is NEVER GST-inclusive at the product/cart level.
 *       GST is ONLY added at checkout/invoice for display.
 *       Shipping is ALWAYS ₹99 per order.
 *
 * All prices in this file are in RUPEES (not paise).
 * DB storage is in PAISE (multiply by 100).
 */

import { Product, CartItem } from './mockData';

// ── Constants ─────────────────────────────────────────────────
export const SHIPPING_FEE_RUPEES = 99;
export const SHIPPING_FEE_PAISE  = SHIPPING_FEE_RUPEES * 100;

// ── Helper: Get the effective base price for a cart item ───────
/** Returns the variant's base price (or product's base price) in RUPEES. NO GST. */
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

// ── Helper: Calculate GST on a base price ─────────────────────
export function calcGst(basePrice: number, gstPercent: number): number {
  // Always use 5% GST rate as requested
  const effectiveGstPercent = 5;
  return Math.round(basePrice * effectiveGstPercent) / 100;
}

// Get product-specific shipping fee in Rupees
export function getProductShippingFee(product: any): number {
  if (!product) return SHIPPING_FEE_RUPEES;
  if (product.shippingFee !== undefined && product.shippingFee !== null) {
    // If it's a raw DB value in paise (e.g. 9900), convert to Rupees
    if (product.shippingFee > 1000) {
      return Math.round(product.shippingFee / 100);
    }
    return product.shippingFee;
  }
  return SHIPPING_FEE_RUPEES;
}

// ── Cart-level totals (NO shipping on product/cart display) ────
export interface CartTotals {
  subtotal: number;       // Sum of (basePrice × qty) for all items
  gstAmount: number;      // Total GST across all items
  cgstAmount: number;     // CGST (half of gstAmount)
  sgstAmount: number;     // SGST (half of gstAmount)
  shippingFee: number;    // Calculated based on items and subtotal
  total: number;          // subtotal + gstAmount + shippingFee
}

export function calcCartTotals(items: CartItem[]): CartTotals {
  let subtotal = 0;
  let gstAmount = 0;

  for (const item of items) {
    const basePrice = getItemBasePrice(item.product, item.size);
    // Force 5% GST calculation base
    const gst = calcGst(basePrice * item.quantity, 5);
    subtotal += basePrice * item.quantity;
    gstAmount += gst;
  }

  gstAmount = Math.round(gstAmount);
  const cgstAmount = Math.floor(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;

  // Shipping Configuration:
  // 1. Free Shipping above ₹1,999 subtotal
  // 2. Otherwise, take the maximum shipping fee among all products in the cart
  let shippingFee = 0;
  if (items.length > 0) {
    if (subtotal > 1999) {
      shippingFee = 0;
    } else {
      shippingFee = Math.max(...items.map(item => getProductShippingFee(item.product)));
    }
  }

  const total = subtotal + gstAmount + shippingFee;

  return { subtotal, gstAmount, cgstAmount, sgstAmount, shippingFee, total };
}

// ── Format price in INR ────────────────────────────────────────
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}
