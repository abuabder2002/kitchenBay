'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { Product, CartItem, products } from './mockData';
import { useAuth } from './authContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.product.id !== action.productId) };
      }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
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
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  gstAmount: number;   // Total GST (CGST + SGST)
  cgstAmount: number;  // Central GST = gstAmount / 2
  sgstAmount: number;  // State GST  = gstAmount / 2
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const storageKey = 'Kitchenbay_cart_guest';

  useEffect(() => {
    if (currentUser) {
      // Sync from server
      const local = localStorage.getItem(storageKey);
      const localItems = local ? JSON.parse(local) : [];

      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC', items: localItems })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map((d: { productId: string; quantity: number }) => ({
              product: products.find(p => p.id === d.productId),
              quantity: d.quantity
            })).filter((i: { product: Product | undefined; quantity: number }) => i.product) as CartItem[];
            dispatch({ type: 'SET_ITEMS', items: mapped });
            localStorage.removeItem(storageKey); // Clear local after sync
          }
        })
        .catch(console.error)
        .finally(() => { setIsLoaded(true); });
    } else {
      // Load local
      const local = localStorage.getItem(storageKey);
      if (local) {
        try {
          dispatch({ type: 'SET_ITEMS', items: JSON.parse(local) });
        } catch (e) {
          console.error(e);
        }
      } else {
        dispatch({ type: 'SET_ITEMS', items: [] });
      }
      setIsLoaded(true);
    }
  }, [currentUser]);

  // Save to localStorage when items change, only if logged out
  useEffect(() => {
    if (isLoaded && !currentUser) {
      localStorage.setItem(storageKey, JSON.stringify(state.items));
    }
  }, [state.items, currentUser, isLoaded]);

  const addItem = useCallback(async (product: Product) => {
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to your cart.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        confirmButtonColor: '#2563EB',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login?redirect=/cart');
        }
      });
      return;
    }

    dispatch({ type: 'ADD_ITEM', product });
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ADD', productId: product.id })
    }).catch(console.error);
  }, [currentUser, router]);

  const removeItem = useCallback(async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
    if (currentUser) {
      fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
      }).catch(console.error);
    }
  }, [currentUser]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    if (currentUser) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      }).catch(console.error);
    }
  }, [currentUser]);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (currentUser) {
      fetch('/api/cart', { method: 'DELETE' }).catch(console.error);
    }
  }, [currentUser]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const gstAmount = state.items.reduce(
    (sum, i) => sum + Math.round((i.product.price * i.product.gstPercent / 100) * i.quantity),
    0
  );
  // Intra-state supply: GST splits equally into CGST + SGST
  const cgstAmount = Math.floor(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount; // handles odd rupee rounding
  const total = subtotal + gstAmount;

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, gstAmount, cgstAmount, sgstAmount, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
