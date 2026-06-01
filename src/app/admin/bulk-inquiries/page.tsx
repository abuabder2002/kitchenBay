'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */


import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Mail, Phone, MessageSquare, FileText, CheckCircle2, 
  XCircle, Clock, Check, Edit2, ChevronDown, Calendar, Search, 
  SlidersHorizontal, RefreshCw, Landmark, ExternalLink
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // paise
  finalPrice: number; // rupees
  image: string;
  gstPercent: number;
}

interface InquiryItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface BulkInquiry {
  id: string;
  userId: string | null;
  customerName: string;
  companyName: string | null;
  mobile: string;
  email: string;
  gstNumber: string | null;
  deliveryLocation: string;
  specialRequirements: string | null;
  preferredContact: 'EMAIL' | 'WHATSAPP' | 'PHONE';
  status: string; // PENDING, CONTACTED, QUOTATION_SENT, APPROVED, REJECTED, COMPLETED
  adminNotes: string | null;
  negotiatedPrice: number | null; // paise
  createdAt: string;
  updatedAt: string;
  items: InquiryItem[];
}

export default function AdminBulkInquiriesPage() {
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'QTY_DESC' | 'QTY_ASC'>('NEWEST');

  // Detail Modal / Sidebar state
  const [selectedInquiry, setSelectedInquiry] = useState<BulkInquiry | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [submittingChanges, setSubmittingChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch inquiries on mount
  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bulk-inquiries');
      if (!res.ok) {
        throw new Error('Failed to fetch B2B wholesale inquiries.');
      }
      const data = await res.json();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Set modal edit states when selected inquiry changes
  useEffect(() => {
    if (selectedInquiry) {
      setEditingPrice(selectedInquiry.negotiatedPrice ? (selectedInquiry.negotiatedPrice / 100).toString() : '');
      setEditingNotes(selectedInquiry.adminNotes || '');
    }
  }, [selectedInquiry]);

  // Handle Updates
  const handleSaveInquiryChanges = async (newStatus?: string) => {
    if (!selectedInquiry) return;
    setSubmittingChanges(true);
    setSuccessMessage(null);

    const priceRupees = parseFloat(editingPrice);
    const negotiatedPricePaise = isNaN(priceRupees) || priceRupees <= 0 ? null : Math.round(priceRupees * 100);

    try {
      const res = await fetch(`/api/bulk-inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus || selectedInquiry.status,
          adminNotes: editingNotes,
          negotiatedPrice: negotiatedPricePaise,
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to update inquiry');
      }

      // Update in local lists
      setInquiries(prev => prev.map(inq => inq.id === updated.id ? updated : inq));
      setSelectedInquiry(updated);
      setSuccessMessage('Inquiry updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving modifications.');
    } finally {
      setSubmittingChanges(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const maps: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-800 border-amber-200', label: 'Pending Review' },
      CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-800 border-blue-200', label: 'Contacted Client' },
      QUOTATION_SENT: { bg: 'bg-indigo-100', text: 'text-indigo-800 border-indigo-200', label: 'Quotation Sent' },
      APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-800 border-emerald-200', label: 'Approved (Paid)' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800 border-red-200', label: 'Rejected' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800 border-gray-200', label: 'Completed' },
    };

    const val = maps[status] || { bg: 'bg-gray-100', text: 'text-gray-800 border-gray-200', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${val.bg} ${val.text}`}>
        {val.label}
      </span>
    );
  };

  // WhatsApp quick messaging helper
  const triggerWhatsApp = (inquiry: BulkInquiry) => {
    const product = inquiry.items[0]?.product;
    const qty = inquiry.items[0]?.quantity || 0;
    const text = `Hi ${inquiry.customerName}, I'm the B2B Wholesale Manager at Kitchenbay. I am reviewing your bulk inquiry for ${qty} units of "${product?.name || 'our products'}". I would love to connect and share a custom pricing structure. Please let me know a convenient time to speak.`;
    
    // Clean mobile number (removing + or spaces, ensuring country code)
    let cleanMobile = inquiry.mobile.replace(/\D/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = '91' + cleanMobile; // Default to India prefix
    }
    
    window.open(`https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Email helper
  const triggerEmail = (inquiry: BulkInquiry) => {
    const product = inquiry.items[0]?.product;
    const qty = inquiry.items[0]?.quantity || 0;
    const price = inquiry.negotiatedPrice 
      ? `₹${(inquiry.negotiatedPrice / 100).toLocaleString('en-IN')}`
      : `₹${((product?.price || 0) * 0.8 / 100).toLocaleString('en-IN')} (Estimated B2B Rate)`;
      
    const subject = `Quotation for Bulk Order #${inquiry.id} - Kitchenbay B2B`;
    const body = `Dear ${inquiry.customerName},\n\nThank you for choosing Kitchenbay. We have drafted your wholesale quote for:\n\n- Product: ${product?.name}\n- Requested Quantity: ${qty} units\n- Special Price Offered: ${price} per unit\n\nDelivery Address: ${inquiry.deliveryLocation}\n\nPlease let us know if you approve this quote so we can generate the GST Proforma Invoice.\n\nWarm regards,\nKitchenbay B2B Sales`;
    
    window.open(`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  // Statistics counters
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'PENDING').length;
  const quotationSentCount = inquiries.filter(i => i.status === 'QUOTATION_SENT').length;
  const approvedRevenue = inquiries
    .filter(i => i.status === 'APPROVED' || i.status === 'COMPLETED')
    .reduce((sum, inq) => {
      const qty = inq.items[0]?.quantity || 0;
      const unitPricePaise = inq.negotiatedPrice || (inq.items[0]?.product?.price || 0);
      return sum + (unitPricePaise * qty) / 100;
    }, 0);

  // Search & Filtering logic
  const filteredInquiries = inquiries
    .filter(inq => {
      // 1. Search term match
      const searchMatch = 
        inq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.companyName && inq.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        inq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status match
      const statusMatch = statusFilter === 'ALL' || inq.status === statusFilter;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const qtyA = a.items[0]?.quantity || 0;
      const qtyB = b.items[0]?.quantity || 0;

      if (sortBy === 'QTY_DESC') return qtyB - qtyA;
      if (sortBy === 'QTY_ASC') return qtyA - qtyB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Wholesale Inquiries</h1>
          <p className="text-sm text-gray-500">Manage high-volume purchase requests, corporate deals, and proforma quotations</p>
        </div>
        <button
          onClick={fetchInquiries}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', count: totalCount, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Pending Review', count: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Quoted Sent', count: quotationSentCount, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { 
            label: 'Approved B2B Value', 
            count: `₹${approvedRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
            icon: Landmark, 
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100' 
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl shrink-0 ${item.color.split(' ')[1]} ${item.color.split(' ')[2]} border`}>
              <item.icon size={22} className={item.color.split(' ')[0]} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{item.label}</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">{item.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel grid */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Advanced Filters Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client, ID, company..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-800 shadow-sm"
            />
          </div>

          {/* Filters Selector */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm shrink-0">
              <SlidersHorizontal size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">Filters:</span>
            </div>
            
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUOTATION_SENT">Quotation Sent</option>
              <option value="APPROVED">Approved (Paid)</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="QTY_DESC">Quantity: High to Low</option>
              <option value="QTY_ASC">Quantity: Low to High</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-semibold">Loading wholesale leads...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-600">
              <p className="text-base font-bold">Failed to load inquiries</p>
              <p className="text-xs mt-1 text-red-500">{error}</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">No wholesale inquiries found</p>
              <p className="text-xs mt-1">Try resetting the search terms or status filters</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                  <th className="px-6 py-4">Inquiry ID</th>
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Product Requested</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Preference</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredInquiries.map((inq) => {
                  const item = inq.items[0];
                  const product = item?.product;
                  return (
                    <tr 
                      key={inq.id}
                      className="hover:bg-blue-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-blue-900">{inq.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-800">{inq.customerName}</p>
                          {inq.companyName && (
                            <p className="text-xs text-gray-400 font-semibold">{inq.companyName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs min-w-[150px]">
                          <p className="font-semibold text-gray-800 truncate">{product?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400 capitalize">{product?.category || 'cookware'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{item?.quantity || 0}</td>
                      <td className="px-6 py-4 shrink-0">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs capitalize">
                          {inq.preferredContact.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(inq.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-3.5 py-1.5 border border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                        >
                          Review Quote
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Inquiry Detail Review Modal Overlay */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 to-[#0c2037] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/60">
              <div>
                <h3 className="font-bold text-lg text-yellow-400">Review Quotation Request</h3>
                <p className="text-xs text-blue-200/80">Inquiry ID: <span className="font-mono">{selectedInquiry.id}</span> • Submitted {new Date(selectedInquiry.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronDown size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Client details & Product detail */}
              <div className="space-y-5">
                
                {/* Client brief */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Contact details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="grid grid-cols-3"><span className="text-gray-400">Buyer Name:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedInquiry.customerName}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Company:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedInquiry.companyName || 'Not Provided (Individual)'}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">GST Number:</span> <span className="col-span-2 font-semibold text-blue-600 font-mono">{selectedInquiry.gstNumber || 'N/A'}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Mobile:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedInquiry.mobile}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Email:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedInquiry.email}</span></p>
                    <p className="grid grid-cols-3"><span className="text-gray-400">Location:</span> <span className="col-span-2 font-semibold text-gray-800">{selectedInquiry.deliveryLocation}</span></p>
                  </div>
                </div>

                {/* Product details */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Requested Item</h4>
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedInquiry.items[0]?.product?.image} 
                      alt={selectedInquiry.items[0]?.product?.name} 
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                    />
                    <div>
                      <h5 className="font-bold text-gray-800 text-sm line-clamp-1">{selectedInquiry.items[0]?.product?.name}</h5>
                      <p className="text-xs text-gray-400 capitalize">Category: {selectedInquiry.items[0]?.product?.category}</p>
                      <p className="text-xs text-gray-700 font-medium mt-0.5">
                        Retail Price: ₹{(selectedInquiry.items[0]?.product?.price / 100).toLocaleString('en-IN')} (Exclusive of B2B discount)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-2.5 border border-gray-200 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase">Requested Qty</span>
                      <span className="text-base font-extrabold text-gray-900">{selectedInquiry.items[0]?.quantity} units</span>
                    </div>
                    <div className="bg-white p-2.5 border border-gray-200 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase">Pref. Contact</span>
                      <span className="text-base font-extrabold text-blue-600 capitalize">{selectedInquiry.preferredContact.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Special requirements */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Requirements</h4>
                  <p className="text-sm text-gray-600 leading-relaxed italic bg-white p-3 rounded-xl border border-gray-200">
                    &quot;{selectedInquiry.specialRequirements || 'No special requirements listed.'}&quot;
                  </p>
                </div>
              </div>

              {/* Right Column: Admin actions, negotiated price, status update */}
              <div className="space-y-5 flex flex-col justify-between">
                
                {/* Quotation Management Form */}
                <div className="space-y-4">
                  
                  {/* Inline messages */}
                  {successMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                      <Check size={14} /> {successMessage}
                    </div>
                  )}

                  {/* Negotiated custom pricing */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Negotiated Custom Price (Rupees/Unit)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        placeholder={`Retail price: ₹${(selectedInquiry.items[0]?.product?.price / 100).toFixed(2)}`}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold text-gray-800 bg-gray-50/50"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">This price is exclusive of taxes and will overwrite the standard retail price for this B2B quote.</p>
                  </div>

                  {/* Internal Admin notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Admin Notes & Internal Remarks</label>
                    <textarea 
                      rows={4}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add follow-up notes, special discount calculations, customer replies..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-800 bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Dynamic Quotation Summary Generator */}
                <div className="bg-blue-950 text-white rounded-2xl p-4 border border-blue-900 shadow-sm">
                  <h5 className="text-xs font-bold text-yellow-400 uppercase mb-3 flex items-center gap-1">
                    <FileText size={12} /> B2B Quotation Sheet
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Offered Rate</span>
                      <span className="font-bold">
                        {editingPrice 
                          ? `₹${parseFloat(editingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                          : `₹${(selectedInquiry.items[0]?.product?.price / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Retail)`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Quantity</span>
                      <span>x {selectedInquiry.items[0]?.quantity}</span>
                    </div>
                    
                    {/* Calculations */}
                    {(() => {
                      const qty = selectedInquiry.items[0]?.quantity || 0;
                      const unitRateRupees = editingPrice 
                        ? parseFloat(editingPrice) 
                        : (selectedInquiry.items[0]?.product?.price || 0) / 100;
                      
                      const baseAmount = unitRateRupees * qty;
                      const gstPercent = selectedInquiry.items[0]?.product?.gstPercent || 18;
                      const gstAmount = baseAmount * (gstPercent / 100);
                      const totalAmount = baseAmount + gstAmount;

                      return (
                        <>
                          <div className="flex justify-between border-t border-blue-900 pt-1 mt-1">
                            <span className="text-blue-300">Subtotal (Excl. Tax)</span>
                            <span className="font-bold">₹{baseAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>GST ({gstPercent}%)</span>
                            <span>+ ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-800 pt-2 mt-1 text-sm font-extrabold text-yellow-400">
                            <span>Estimated Grand Total</span>
                            <span>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerWhatsApp(selectedInquiry)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} /> WhatsApp Client
                    </button>
                    <button
                      onClick={() => triggerEmail(selectedInquiry)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <Mail size={14} /> Email Draft
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {/* Status update buttons */}
                    <div className="relative w-full">
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => handleSaveInquiryChanges(e.target.value)}
                        disabled={submittingChanges}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer text-center focus:outline-none appearance-none disabled:opacity-50"
                      >
                        <option value="PENDING">➔ Set: Pending Review</option>
                        <option value="CONTACTED">➔ Set: Contacted Client</option>
                        <option value="QUOTATION_SENT">➔ Set: Quotation Sent</option>
                        <option value="APPROVED">➔ Set: Approved (Paid)</option>
                        <option value="REJECTED">➔ Set: Rejected</option>
                        <option value="COMPLETED">➔ Set: Completed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-2 text-white">
                        <ChevronDown size={14} />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveInquiryChanges()}
                      disabled={submittingChanges}
                      className="px-4 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      Save Notes/Price Only
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
