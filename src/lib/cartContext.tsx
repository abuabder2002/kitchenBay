'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { Product, CartItem } from './mockData';
import { useAuth } from './authContext';
import { useProducts } from './productsContext';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'ADD_ITEM'; product: Product; size?: string }
  | { type: 'REMOVE_ITEM'; productId: string; size?: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number; size?: string }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id && (i.size || "") === (action.size || ""));
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id && (i.size || "") === (action.size || "")
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1, size: action.size }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => !(i.product.id === action.productId && (i.size || "") === (action.size || ""))) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => !(i.product.id === action.productId && (i.size || "") === (action.size || ""))) };
      }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId && (i.size || "") === (action.size || "") ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  total: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'Kitchenbay_cart_guest';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [serverData, setServerData] = useState<{productId: string, quantity: number, size?: string}[] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Track whether we have loaded from localStorage yet
  const hasHydrated = useRef(false);
  const didServerSync = useRef(false);

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
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return; // keep local
        setServerData(data);
      })
      .catch(err => {
        console.warn('[Cart] Server sync failed, using local data:', err.message);
      });
  }, [currentUser]);

  // ── STEP 4: Map server data when products finish loading ──
  useEffect(() => {
    if (!serverData) return;
    
    // Check if we have mapped all products
    const mapped = serverData.map((d) => ({
      product: products.find(p => p.id === d.productId),
      quantity: d.quantity,
      size: d.size,
    })).filter((i): i is CartItem => !!i.product);

    // Only update if we found at least some products. 
    // This will naturally re-run and find more if 'products' updates asynchronously from DB.
    if (mapped.length > 0) {
      dispatch({ type: 'SET_ITEMS', items: mapped });
    }
  }, [serverData, products]);

  const addItem = useCallback(async (product: Product, size?: string) => {
    dispatch({ type: 'ADD_ITEM', product, size });
    setIsDrawerOpen(true); // Open drawer when item added
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

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const gstAmount = state.items.reduce(
    (sum, i) => sum + Math.round((i.product.price * i.product.gstPercent / 100) * i.quantity),
    0
  );
  const cgstAmount = Math.floor(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const total = subtotal + gstAmount;

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <CartContext.Provider value={{ 
      items: state.items, addItem, removeItem, updateQuantity, clearCart, 
      itemCount, subtotal, gstAmount, cgstAmount, sgstAmount, total,
      isDrawerOpen, openDrawer, closeDrawer
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
