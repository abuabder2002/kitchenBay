'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Product, CartItem } from './mockData';
import { useAuth } from './authContext';
import { useProducts } from './productsContext';
import { calcCartTotals, getItemBasePrice, getItemStock } from './pricing';

interface CartState {
  items: CartItem[];
  appliedCoupon: { code: string; discountAmount: number; type: string } | null;
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'ADD_ITEM'; product: Product; size?: string }
  | { type: 'REMOVE_ITEM'; productId: string; size?: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number; size?: string }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; coupon: { code: string; discountAmount: number; type: string } }
  | { type: 'REMOVE_COUPON' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id && (i.size || "") === (action.size || ""));
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product.id === action.product.id && (i.size || "") === (action.size || "")
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: 1, size: action.size }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => !(i.product.id === action.productId && (i.size || "") === (action.size || ""))) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => !(i.product.id === action.productId && (i.size || "") === (action.size || ""))) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.product.id === action.productId && (i.size || "") === (action.size || "") ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { items: [], appliedCoupon: null };
    case 'APPLY_COUPON':
      return { ...state, appliedCoupon: action.coupon };
    case 'REMOVE_COUPON':
      return { ...state, appliedCoupon: null };
    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size?: string, skipDrawer?: boolean) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountAmount: number; type: string } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  itemCount: number;
  subtotal: number;       // Sum of base prices (NO GST)
  taxableAmount: number;  // subtotal - coupon discount
  gstAmount: number;      // 5% GST on taxableAmount
  cgstAmount: number;
  sgstAmount: number;
  shippingFee: number;    // ₹99 or 0
  discountAmount: number; // Coupon discount in RUPEES
  total: number;          // taxableAmount + gst + shipping
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'Kitchenbay_cart_guest';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [state, dispatch] = useReducer(cartReducer, { items: [], appliedCoupon: null });
  const [serverData, setServerData] = useState<{productId: string, quantity: number, size?: string}[] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Track whether we have loaded from localStorage yet
  const hasHydrated = useRef(false);
  const didServerSync = useRef(false);
  const checkedUrlCoupon = useRef(false);


  // ── STEP 1: On client mount, load from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'SET_ITEMS', items: parsed });
        }
      }
    } catch {
      // corrupted — ignore
    }
    // Mark hydration complete — now future saves are safe
    hasHydrated.current = true;
  }, []); // runs once on client mount

  // ── STEP 2: Save to localStorage on every state change, but SKIP the initial empty state ──
  useEffect(() => {
    if (!hasHydrated.current) return; // Don't save until we've loaded
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // quota exceeded — ignore
    }
  }, [state.items]);

  // ── STEP 3: Server sync when user logs in ──
  useEffect(() => {
    if (!currentUser) {
      didServerSync.current = false;
      return;
    }
    if (didServerSync.current) return;
    didServerSync.current = true;

    // Read fresh from localStorage to guarantee we have latest data
    let localItems: CartItem[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localItems = parsed;
      }
    } catch { /* ignore */ }

    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC', items: localItems }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Cart sync failed');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Expected JSON response from /api/cart sync');
      })
      .then(() => {
        return fetch(`/api/cart?userId=${currentUser.id}`, { cache: 'no-store' });
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Expected JSON response from /api/cart');
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return; // keep local
        setServerData(data);
      })
      .catch(err => {
        console.warn('[Cart] Server sync failed, using local data:', err.message);
      });
  }, [currentUser]);

  // ── STEP 4: Map server data directly from API ──
  useEffect(() => {
    if (!serverData) return;
    
    const mapped = serverData.map((d: any) => {
      const p = d.product || products.find(p => p.id === d.productId);
      return {
        product: p,
        quantity: d.quantity,
        size: d.size || ""
      } as CartItem;
    }).filter((i): i is CartItem => !!i.product);

    if (mapped.length > 0 || (currentUser && serverData.length === 0)) {
      dispatch({ type: 'SET_ITEMS', items: mapped });
    }
  }, [serverData, products, currentUser]);

  // ── STEP 5: Auto-validate cart against live products stock ──
  useEffect(() => {
    if (!products.length || state.items.length === 0) return;
    
    let needsUpdate = false;
    const validatedItems = state.items.map(item => {
      const liveProduct = products.find(p => p.id === item.product.id);
      if (!liveProduct) return item; // Skip if product not found in live data
      
      const availableStock = getItemStock(liveProduct, item.size);
      if (availableStock <= 0) {
        needsUpdate = true;
        return null;
      }
      if (item.quantity > availableStock) {
        needsUpdate = true;
        return { ...item, quantity: availableStock, product: liveProduct };
      }
      return item;
    }).filter((i): i is CartItem => i !== null);

    if (needsUpdate) {
      dispatch({ type: 'SET_ITEMS', items: validatedItems });
    }
  }, [products, state.items]);

  const addItem = useCallback(async (product: Product, size?: string, skipDrawer?: boolean) => {
    dispatch({ type: 'ADD_ITEM', product, size });
    if (!skipDrawer) {
      setIsDrawerOpen(true); // Open drawer when item added
    }
    if (currentUser) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD', productId: product.id, size: size || "" }),
      }).catch(err => console.warn('[Cart] Add sync failed:', err.message));
    }
  }, [currentUser]);

  const removeItem = useCallback(async (productId: string, size?: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId, size });
    if (currentUser) {
      fetch(`/api/cart?productId=${productId}&size=${encodeURIComponent(size || "")}`, { method: 'DELETE' })
        .catch(err => console.warn('[Cart] Remove sync failed:', err.message));
    }
  }, [currentUser]);

  const updateQuantity = useCallback(async (productId: string, quantity: number, size?: string) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity, size });
    if (currentUser) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, size: size || "" }),
      }).catch(err => console.warn('[Cart] Update sync failed:', err.message));
    }
  }, [currentUser]);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (currentUser) {
      fetch('/api/cart', { method: 'DELETE' })
        .catch(err => console.warn('[Cart] Clear sync failed:', err.message));
    }
  }, [currentUser]);

  // ── Pricing calculations using centralized utility ──
  const { subtotal, taxableAmount, gstAmount, cgstAmount, sgstAmount, shippingFee, discountAmount, total } = calcCartTotals(state.items, state.appliedCoupon);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      // Use subtotal from base items
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to apply coupon' };
      }
      dispatch({ type: 'APPLY_COUPON', coupon: data.coupon });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error while applying coupon' };
    }
  }, [subtotal]);

  // ── Auto-Apply Coupon from URL ──
  useEffect(() => {
    if (typeof window === 'undefined' || checkedUrlCoupon.current) return;
    checkedUrlCoupon.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('coupon');
    if (code) {
      applyCoupon(code).then(res => {
        if (res.success) {
          // Optionally remove the param from URL, but leaving it is fine for MVP
        }
      });
    }
  }, [applyCoupon]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const contextValue = useMemo(() => ({
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    appliedCoupon: state.appliedCoupon,
    applyCoupon,
    removeCoupon,
    itemCount,
    subtotal,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFee,
    discountAmount,
    total,
    isDrawerOpen,
    openDrawer,
    closeDrawer
  }), [
    state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    state.appliedCoupon,
    applyCoupon,
    removeCoupon,
    itemCount,
    subtotal,
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    shippingFee,
    discountAmount,
    total,
    isDrawerOpen,
    openDrawer,
    closeDrawer
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
