'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Product, products } from './mockData';
import { useAuth } from './authContext';

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: 'SET_ITEMS'; items: Product[] }
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_WISHLIST' };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items };
    case 'ADD_ITEM': {
      if (state.items.find(i => i.id === action.product.id)) {
        return state;
      }
      return { items: [...state.items, action.product] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.id !== action.productId) };
    case 'CLEAR_WISHLIST':
      return { items: [] };
    default:
      return state;
  }
};

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  
  const storageKey = 'shopnest_wishlist_guest';

  useEffect(() => {
    if (currentUser) {
      // Sync from server
      fetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => products.find(p => p.id === d.productId)).filter(Boolean) as Product[];
          
          // Also sync any local items up to the cloud
          const local = localStorage.getItem(storageKey);
          const localItems = local ? JSON.parse(local) : [];
          
          const itemsToSync = localItems.filter(
            (localItem: any) => !mapped.some(m => m.id === localItem.id)
          );
          
          itemsToSync.forEach((item: any) => {
            fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.id })
            }).catch(console.error);
            mapped.push(item);
          });
          
          dispatch({ type: 'SET_ITEMS', items: mapped });
          localStorage.removeItem(storageKey); // Clear local after sync
        }
      })
      .catch(console.error);
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
    }
  }, [currentUser]);

  // Save to localStorage when items change, only if logged out
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(storageKey, JSON.stringify(state.items));
    }
  }, [state.items, currentUser]);

  const addItem = useCallback(async (product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    if (currentUser) {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      }).catch(console.error);
    }
  }, [currentUser]);

  const removeItem = useCallback(async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
    if (currentUser) {
      fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      }).catch(console.error);
    }
  }, [currentUser]);

  const clearWishlist = useCallback(async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    if (currentUser) {
      fetch('/api/wishlist', { method: 'DELETE' }).catch(console.error);
    }
  }, [currentUser]);

  const isInWishlist = useCallback((productId: string) => state.items.some(i => i.id === productId), [state.items]);

  return (
    <WishlistContext.Provider value={{ items: state.items, addItem, removeItem, clearWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
