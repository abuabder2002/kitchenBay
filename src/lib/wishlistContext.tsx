'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { Product } from './mockData';
import { useAuth } from './authContext';
import { useProducts } from './productsContext';

interface WishlistState {
  items: Product[];
  loadingItems: Set<string>;
}

type WishlistAction =
  | { type: 'SET_ITEMS'; items: Product[] }
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_LOADING'; productId: string; isLoading: boolean };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      if (state.items.find(i => i.id === action.product.id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.product] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.productId) };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    case 'SET_LOADING': {
      const newLoading = new Set(state.loadingItems);
      if (action.isLoading) newLoading.add(action.productId);
      else newLoading.delete(action.productId);
      return { ...state, loadingItems: newLoading };
    }
    default:
      return state;
  }
};

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isItemLoading: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'Kitchenbay_wishlist_guest';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], loadingItems: new Set<string>() });
  const [serverData, setServerData] = useState<any[] | null>(null);

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
    let localItems: Product[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localItems = parsed;
      }
    } catch { /* ignore */ }

    fetch('/api/wishlist')
      .then(res => {
        if (!res.ok) throw new Error('Wishlist sync failed');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          // Server returned empty — upload local items if any, keep local state
          if (localItems.length > 0) {
            localItems.forEach((item: Product) => {
              fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.id }),
              }).catch(() => {});
            });
          }
          return;
        }

        // Map server data back to Product objects but defer to the new useEffect 
        // to ensure we have the fully loaded products from the DB
        setServerData(data);
      })
      .catch(err => {
        console.warn('[Wishlist] Server sync failed, using local data:', err.message);
      });
  }, [currentUser]);

  // ── STEP 4: Map server data when products finish loading ──
  useEffect(() => {
    if (!serverData) return;

    const localItems = state.items;

    const mapped = serverData.map((d: { productId?: string; id?: string; name?: string; price?: number }) => {
      if (d && d.name && d.price !== undefined) {
        return d as unknown as Product;
      }
      const pid = d.productId || d.id;
      if (pid) return products.find(p => p.id === pid);
      return null;
    }).filter((p): p is Product => !!p);

    const serverIds = new Set(mapped.map(p => p.id));
    const localOnly = localItems.filter(item => !serverIds.has(item.id));

    // Wait! Only upload localOnly items ONCE. We shouldn't do it every time `products` updates.
    // However, `serverData` is only set once per login, so this effect shouldn't re-run too many times with new local items.
    // To be safe, we only re-run mapping, but we don't need to re-upload.
    
    const merged = [...mapped, ...localOnly];

    if (merged.length > 0) {
      dispatch({ type: 'SET_ITEMS', items: merged });
    }
  }, [serverData, products]);

  const addItem = useCallback(async (product: Product) => {
    dispatch({ type: 'SET_LOADING', productId: product.id, isLoading: true });
    dispatch({ type: 'ADD_ITEM', product });
    try {
      if (currentUser) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
      }
    } catch (err) {
      console.warn('[Wishlist] Add item sync failed:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', productId: product.id, isLoading: false });
    }
  }, [currentUser]);

  const removeItem = useCallback(async (productId: string) => {
    dispatch({ type: 'SET_LOADING', productId, isLoading: true });
    dispatch({ type: 'REMOVE_ITEM', productId });
    try {
      if (currentUser) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.warn('[Wishlist] Remove item sync failed:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', productId, isLoading: false });
    }
  }, [currentUser]);

  const clearWishlist = useCallback(async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    try {
      if (currentUser) {
        await fetch('/api/wishlist', { method: 'DELETE' });
      }
    } catch (err) {
      console.warn('[Wishlist] Clear sync failed:', err);
    }
  }, [currentUser]);

  const isInWishlist = useCallback(
    (productId: string) => state.items.some(i => i.id === productId),
    [state.items]
  );
  const isItemLoading = useCallback(
    (productId: string) => state.loadingItems.has(productId),
    [state.loadingItems]
  );

  return (
    <WishlistContext.Provider value={{ items: state.items, addItem, removeItem, clearWishlist, isInWishlist, isItemLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
