'use client';
import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

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
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();

  const currentUser: User | null = user ? {
    id: user.id,
    name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User',
    email: user.primaryEmailAddress?.emailAddress || '',
    avatar: user.imageUrl,
    addresses: [],
    orders: [],
    recentSearches: [],
    recentlyViewed: []
  } : null;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
  const userEmail = currentUser?.email?.toLowerCase();
  const isAdmin = user?.publicMetadata?.role === 'admin' || !!(userEmail && (adminEmails.includes(userEmail) || userEmail === 'yousufsuhaily@gmail.com'));

  const login = () => false;
  const signup = () => false;
  const logout = () => {
    signOut();
  };
  const updateUser = () => {};

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        users: [], 
        login, 
        signup, 
        logout, 
        updateUser, 
        error: null, 
        clearError: () => {}, 
        loading: !isLoaded,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
