'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Tag, Trash2, Edit, CheckCircle2, XCircle, Search, Percent, Currency, Truck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons?includeUsages=true');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
        setCoupons(coupons.filter(c => c.id !== id));
        Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete coupon.', 'error');
      }
    }
  };

  const toggleStatus = async (coupon: any) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    (c.campaignName && c.campaignName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promo codes and active marketing campaigns.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/marketing/analytics"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            View Analytics
          </Link>
          <Link
            href="/admin/marketing/coupons/create"
            className="flex items-center gap-2 px-4 py-2 bg-[--color-brand-text] text-white rounded-lg text-sm font-semibold hover:bg-[--color-brand-accent] transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Coupon
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by code or campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[--color-brand-accent]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Code / Campaign</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading coupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Tag size={40} className="text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No coupons found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${coupon.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {coupon.type === 'PERCENTAGE' ? <Percent size={18} /> : coupon.type === 'FREE_SHIPPING' ? <Truck size={18} /> : <Currency size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-wide">{coupon.code}</p>
                          <p className="text-xs text-gray-400">{coupon.campaignName || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.type === 'PERCENTAGE' 
                        ? <span className="font-semibold text-gray-900">{coupon.value}% OFF</span>
                        : coupon.type === 'FREE_SHIPPING'
                        ? <span className="font-semibold text-gray-900">Free Shipping</span>
                        : <span className="font-semibold text-gray-900">₹{coupon.value / 100} OFF</span>}
                      {coupon.minOrderAmount && <p className="text-xs text-gray-400 mt-1">Min ₹{coupon.minOrderAmount / 100}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(coupon)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          coupon.isActive 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {coupon.isActive ? <><CheckCircle2 size={12} /> Active</> : <><XCircle size={12} /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">{coupon._count?.usages || 0}</span>
                        <span className="text-gray-400 text-xs">/ {coupon.usageLimit ? coupon.usageLimit : '∞'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.endDate 
                        ? <span className="text-gray-900">{new Date(coupon.endDate).toLocaleDateString()}</span>
                        : <span className="text-gray-400 italic">Never expires</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit functionality omitted for MVP, could link to edit page */}
                        <button onClick={() => handleDelete(coupon.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
