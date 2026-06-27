'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perUserLimit: '1',
    eligibility: 'EVERYONE',
    isActive: true,
    campaignName: ''
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        value: form.type === 'FREE_SHIPPING' ? '0' : form.value, // value is required, send 0 for free shipping
      };

      if (form.type !== 'PERCENTAGE' && form.type !== 'FREE_SHIPPING') {
        payload.value = (parseInt(payload.value) * 100).toString(); // convert to paise
      }
      if (form.minOrderAmount) payload.minOrderAmount = (parseInt(form.minOrderAmount) * 100).toString();
      if (form.maxDiscount) payload.maxDiscount = (parseInt(form.maxDiscount) * 100).toString();

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      router.push('/admin/marketing/coupons');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/marketing/coupons" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[--color-brand-accent] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
          <p className="text-sm text-gray-500 mt-1">Configure a new discount code and its rules.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Coupon Code *</label>
              <input required type="text" name="code" value={form.code} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm uppercase" placeholder="e.g. SUMMER20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Campaign Name</label>
              <input type="text" name="campaignName" value={form.campaignName} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="e.g. Summer Sale 2026" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Internal Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="Optional notes about this coupon" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Discount Type & Value</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            {form.type !== 'FREE_SHIPPING' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Value *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{form.type === 'FIXED' ? '₹' : '%'}</span>
                  <input required type="number" name="value" value={form.value} onChange={handleChange} className="w-full pl-8 bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder={form.type === 'PERCENTAGE' ? '20' : '500'} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Usage Limits & Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Order Amount (₹)</label>
              <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="No minimum" />
            </div>
            {form.type === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Maximum Discount Amount (₹)</label>
                <input type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="No limit" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Total Usage Limit</label>
              <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Limit per User</label>
              <input type="number" name="perUserLimit" value={form.perUserLimit} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" placeholder="1" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Eligibility</label>
              <select name="eligibility" value={form.eligibility} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm">
                <option value="EVERYONE">Everyone</option>
                <option value="NEW_USER">New Users Only (First Order)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
              <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
              <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-3">
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-5 h-5 text-[--color-brand-accent] rounded border-gray-300 focus:ring-[--color-brand-accent]" />
            <label htmlFor="isActive" className="font-semibold text-gray-900 cursor-pointer">Activate Coupon Immediately</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-10">
          <Link href="/admin/marketing/coupons" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 px-8 py-3 bg-[--color-brand-text] text-white font-bold rounded-xl hover:bg-[--color-brand-accent] transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Creating...' : 'Save Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
