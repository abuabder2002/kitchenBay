'use client';

import { useOrders } from '@/lib/ordersContext';
import { useProducts } from '@/lib/productsContext';
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, DollarSign
} from 'lucide-react';

function StatCard({
  title, value, growth, icon: Icon, color
}: {
  title: string; value: string; growth: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${growth >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
          {growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(growth)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50',
  processing: 'text-blue-700 bg-blue-50',
  shipped: 'text-blue-700 bg-blue-50',
  delivered: 'text-emerald-700 bg-emerald-50',
  cancelled: 'text-red-700 bg-red-50',
};

export default function AdminDashboard() {
  const { orders } = useOrders();
  const { products } = useProducts();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  // Compute stats dynamically
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  // Unique customers by email
  const totalCustomers = new Set(orders.map(o => o.email)).size;

  // Simple growth: compare this week vs last week
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekOrders = orders.filter(o => now - new Date(o.date).getTime() < oneWeekMs);
  const lastWeekOrders = orders.filter(o => {
    const age = now - new Date(o.date).getTime();
    return age >= oneWeekMs && age < 2 * oneWeekMs;
  });
  const ordersGrowth = lastWeekOrders.length === 0
    ? (thisWeekOrders.length > 0 ? 100 : 0)
    : Math.round(((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100);

  const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + o.total, 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + o.total, 0);
  const revenueGrowth = lastWeekRevenue === 0
    ? (thisWeekRevenue > 0 ? 100 : 0)
    : Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (GST incl.)" value={formatPrice(totalRevenue)} growth={revenueGrowth} icon={DollarSign} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Total Orders" value={totalOrders.toLocaleString('en-IN')} growth={ordersGrowth} icon={ShoppingBag} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Total Products" value={totalProducts.toLocaleString('en-IN')} growth={0} icon={Package} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard title="Total Customers" value={totalCustomers.toLocaleString('en-IN')} growth={0} icon={Users} color="bg-gradient-to-br from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No orders yet</p>
              <p className="text-xs text-gray-300 mt-1">Orders placed by customers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-blue-600">{o.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{o.customer}</p>
                        <p className="text-xs text-gray-400">{o.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{formatPrice(o.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{new Date(o.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top Products</h2>
            <a href="/admin/products" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {products.slice(0, 6).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{formatPrice(p.finalPrice)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-amber-500">⭐</span>
                  <span className="text-xs font-medium text-gray-600">{p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
