'use client';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  total: number;
  shippingAddressId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  addresses: Address[];
  orders: Order[];
  recentSearches: string[];
  recentlyViewed: string[];
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, password?: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  error: string | null;
  clearError: () => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url,
          addresses: [],
          orders: [],
          recentSearches: [],
          recentlyViewed: []
        });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
          addresses: [],
          orders: [],
          recentSearches: [],
          recentlyViewed: []
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
  const userEmail = currentUser?.email?.toLowerCase();
  const isAdmin = !!(userEmail && (adminEmails.includes(userEmail) || userEmail === 'kitchenbaypvtltd@gmail.com' || userEmail === 'yousufsuhaily@gmail.com' || userEmail === 'kitchenbaythehomeneeds@gmail.com' || userEmail === 'abdershaheen4@gmail.com'));

  const login = () => false; // Let individual login forms handle this and redirect
  const signup = () => false;
  const logout = async () => {
    await supabase.auth.signOut();
  };
  const updateUser = () => {};

  const contextValue = useMemo(() => ({
    currentUser,
    users: [],
    login,
    signup,
    logout,
    updateUser,
    error: null,
    clearError: () => {},
    loading,
    isAdmin
  }), [currentUser, loading, isAdmin]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
