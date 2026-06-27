'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Tag, Users, Currency } from 'lucide-react';

export default function CouponAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/coupons?includeUsages=true');
        const coupons = await res.json();
        
        let totalRedemptions = 0;
        let totalActive = 0;
        
        coupons.forEach((c: any) => {
          if (c.isActive) totalActive++;
          totalRedemptions += c._count?.usages || 0;
        });

        setStats({
          totalCoupons: coupons.length,
          activeCoupons: totalActive,
          totalRedemptions
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/marketing/coupons" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[--color-brand-accent] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of coupon performance and redemptions.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading analytics data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Total Coupons</h2>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Tag size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalCoupons}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Active Campaigns</h2>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeCoupons}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Total Redemptions</h2>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalRedemptions}</p>
          </div>
        </div>
      )}
    </div>
  );
}
