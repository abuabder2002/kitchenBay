'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Product, products } from './mockData';
import { useAuth } from './authContext';

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

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], loadingItems: new Set<string>() });

  const storageKey = 'Kitchenbay_wishlist_guest';

  useEffect(() => {
    // Unconditionally load from localStorage first for resilience
    const local = localStorage.getItem(storageKey);
    const localItems = local ? JSON.parse(local) : [];
    
    if (localItems.length > 0) {
      try {
        dispatch({ type: 'SET_ITEMS', items: localItems });
      } catch (e) {
        console.error(e);
      }
    }

    if (currentUser) {
      // Sync from server
      fetch('/api/wishlist')
        .then(res => {
          if (!res.ok) throw new Error('API failed');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map((d: any) => {
              if (d && d.name && d.price !== undefined) {
                return d as Product;
              }
              if (d && d.productId) {
                return products.find(p => p.id === d.productId);
              }
              return null;
            }).filter(Boolean) as Product[];

            // Also sync any local items up to the cloud
            const itemsToSync = localItems.filter(
              (localItem: Product) => !mapped.some(m => m.id === localItem.id)
            );

            itemsToSync.forEach((item: Product) => {
              fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.id })
              }).catch(console.error);
              mapped.push(item);
            });

            dispatch({ type: 'SET_ITEMS', items: mapped });
          }
        })
        .catch(err => {
          console.error('Failed to sync initial wishlist:', err);
          // Fallback to local storage is already handled by the unconditional load above
        });
    }
  }, [currentUser]);

  // Save to localStorage when items change unconditionally
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(async (product: Product) => {
    dispatch({ type: 'SET_LOADING', productId: product.id, isLoading: true });
    dispatch({ type: 'ADD_ITEM', product });
    try {
      if (currentUser) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
      }
    } catch (err) {
      console.error('Failed to sync wishlist with server:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', productId: product.id, isLoading: false });
    }
  }, [currentUser]);

  const removeItem = useCallback(async (productId: string) => {
    dispatch({ type: 'SET_LOADING', productId, isLoading: true });
    dispatch({ type: 'REMOVE_ITEM', productId });
    try {
      if (currentUser) {
        await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
        });
      }
    } catch (err) {
      console.error('Failed to sync wishlist removal with server:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', productId, isLoading: false });
    }
  }, [currentUser, state.items]);

  const clearWishlist = useCallback(async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    try {
      if (currentUser) {
        await fetch('/api/wishlist', { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Failed to clear wishlist on server:', err);
    }
  }, [currentUser]);

  const isInWishlist = useCallback((productId: string) => state.items.some(i => i.id === productId), [state.items]);
  const isItemLoading = useCallback((productId: string) => state.loadingItems.has(productId), [state.loadingItems]);

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
