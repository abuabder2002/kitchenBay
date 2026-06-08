'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import { products } from './mockData';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number; // finalPrice per unit
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  date: string; // ISO string
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

const STORAGE_KEY = 'Kitchenbaycraft_orders';

function loadFromStorage(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch { }
}

function generateOrderId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (currentUser) {
      // Sync from server
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // map DB orders to app Order format
            const mappedOrders = data.map(o => {
              const mappedItems = o.items.map((i: { productId: string; quantity: number; price: number }) => {
                const prod = products.find(p => p.id === i.productId);
                return {
                  productId: i.productId,
                  name: prod ? prod.name : i.productId,
                  image: prod ? prod.image : '',
                  quantity: i.quantity,
                  price: i.price,
                };
              });

              // Calculate taxes dynamically
              const subtotal = mappedItems.reduce((sum: number, i: { productId: string; quantity: number; price: number }) => {
                const prod = products.find(p => p.id === i.productId);
                const basePrice = prod ? prod.price : Math.round(i.price / 1.18);
                return sum + basePrice * i.quantity;
              }, 0);

              const gstAmount = o.totalAmount - subtotal;
              const cgstAmount = Math.floor(gstAmount / 2);
              const sgstAmount = gstAmount - cgstAmount;

              return {
                id: o.id,
                customer: currentUser.name || '',
                email: currentUser.email || '',
                phone: '',
                address: o.address ? o.address.street : '',
                city: o.address ? o.address.city : '',
                state: o.address ? o.address.state : '',
                pincode: o.address ? o.address.zip : '',
                items: mappedItems,
                subtotal,
                cgstAmount,
                sgstAmount,
                gstAmount,
                total: o.totalAmount,
                paymentMethod: o.paymentStatus,
                status: o.status.toLowerCase(),
                date: o.createdAt,
              };
            });
            setOrders(mappedOrders);
          }
        })
        .catch(console.error);
    } else {
      Promise.resolve().then(() => setOrders(loadFromStorage()));
    }
  }, [currentUser]);

  // Persist whenever orders change for local guest
  useEffect(() => {
    if (!currentUser && orders.length > 0) {
      saveToStorage(orders);
    }
  }, [orders, currentUser]);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<string> => {
    if (currentUser) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: orderData.total,
          paymentStatus: orderData.paymentMethod,
          items: orderData.items,
        })
      });
      const data = await res.json();
      const newOrder: Order = {
        ...orderData,
        id: data.id,
        date: data.createdAt,
        status: data.status.toLowerCase(),
      };
      setOrders(prev => [newOrder, ...prev]);
      return data.id;
    } else {
      const id = generateOrderId();
      const newOrder: Order = {
        ...orderData,
        id,
        date: new Date().toISOString(),
        status: 'pending',
      };
      setOrders(prev => {
        const updated = [newOrder, ...prev];
        saveToStorage(updated);
        return updated;
      });
      return id;
    }
  }, [currentUser]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      if (!currentUser) saveToStorage(updated);
      return updated;
    });
  }, [currentUser]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(o => o.id === orderId);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider');
  return ctx;
}
