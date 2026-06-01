'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */


import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShoppingBag, Calendar, MapPin, FileText, CheckCircle, 
  MessageSquare, Loader2, ArrowLeft, RefreshCw, Landmark, Percent 
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  finalPrice: number;
  image: string;
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

export default function CustomerBulkInquiriesPage() {
  const { user, isLoaded: authLoaded } = useUser();
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bulk-inquiries');
      if (!res.ok) {
        throw new Error('Failed to load your inquiries. Please try again.');
      }
      const data = await res.json();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while fetching inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoaded && user) {
      fetchMyInquiries();
    } else if (authLoaded && !user) {
      setLoading(false);
    }
  }, [user, authLoaded]);

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const maps: Record<string, { bg: string; label: string }> = {
      PENDING: { bg: 'bg-amber-50 border-amber-200 text-amber-800', label: 'Pending Review' },
      CONTACTED: { bg: 'bg-blue-50 border-blue-200 text-blue-800', label: 'Reviewing Details' },
      QUOTATION_SENT: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', label: 'Quotation Shared' },
      APPROVED: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Approved (Paid)' },
      REJECTED: { bg: 'bg-red-50 border-red-200 text-red-800', label: 'Declined' },
      COMPLETED: { bg: 'bg-gray-50 border-gray-200 text-gray-800', label: 'Completed' },
    };

    const val = maps[status] || { bg: 'bg-gray-50 border-gray-200 text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${val.bg}`}>
        {val.label}
      </span>
    );
  };

  // WhatsApp quick messaging redirection
  const handleWhatsAppChat = (inquiry: BulkInquiry) => {
    const defaultWhatsAppNumber = '919999999999'; // B2B sales desk
    const message = `Hi Kitchenbay, I'm checking the status of my B2B Bulk Inquiry #${inquiry.id} for "${inquiry.items[0]?.product?.name}". Please update me. Thank you!`;
    window.open(`https://wa.me/${defaultWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={16} /> Back to Retail Orders
          </Link>
        </div>

        {/* Dashboard Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wholesale / Bulk Inquiries</h1>
            <p className="text-sm text-gray-500">Track negotiated pricing, quotations, and special customization requests for your company</p>
          </div>
          {user && (
            <button
              onClick={fetchMyInquiries}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh List
            </button>
          )}
        </div>

        {/* Auth check */}
        {!authLoaded ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-semibold">Loading authorization state...</p>
          </div>
        ) : !user ? (
          /* Sign In Reminder State */
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
            <ShoppingBag size={48} className="mx-auto mb-4 text-blue-600 opacity-40 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign In to Track Inquiries</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              Wholesale inquiries are securely linked with your Clerk account. Please log in with the email address you used during submission to track negotiated pricing.
            </p>
            <Link
              href="/login?redirect_url=/orders/bulk"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
            >
              Sign In to B2B Panel
            </Link>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-semibold">Retrieving your wholesale bids...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
            <p className="font-bold">Failed to load inquiries</p>
            <p className="text-xs mt-1 text-red-500">{error}</p>
          </div>
        ) : inquiries.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Bulk Inquiries Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              You haven't requested any wholesale quotes yet. Explore our premium traditional cookware catalog to submit a B2B bid!
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          /* Inquiries List */
          <div className="space-y-6">
            {inquiries.map((inquiry) => {
              const item = inquiry.items[0];
              const product = item?.product;
              
              // Negotiated Price math
              const retailPriceRupees = product ? product.price / 100 : 0;
              const negotiatedPriceRupees = inquiry.negotiatedPrice ? inquiry.negotiatedPrice / 100 : null;
              
              const isDiscounted = negotiatedPriceRupees !== null && negotiatedPriceRupees < retailPriceRupees;
              const unitPriceUsed = negotiatedPriceRupees !== null ? negotiatedPriceRupees : retailPriceRupees;
              const savingsPerUnit = isDiscounted ? retailPriceRupees - negotiatedPriceRupees : 0;
              const totalSavings = savingsPerUnit * (item?.quantity || 0);

              return (
                <div 
                  key={inquiry.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 transition-all hover:shadow-md"
                >
                  {/* Left Column: Product Picture & details */}
                  <div className="flex-1 flex gap-4 min-w-0">
                    <img 
                      src={product?.image} 
                      alt={product?.name} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                          #{inquiry.id}
                        </span>
                        {getStatusBadge(inquiry.status)}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1">
                        {product?.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          Qty: <span className="text-gray-900 font-extrabold">{item?.quantity} pcs</span>
                        </span>
                        <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(inquiry.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} /> {inquiry.deliveryLocation}</span>
                      </div>

                      {/* Special requirements */}
                      {inquiry.specialRequirements && (
                        <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-600 max-w-xl">
                          <span className="font-bold text-gray-800 block mb-0.5">Special Instructions:</span>
                          "{inquiry.specialRequirements}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pricing details, Remarks and Contact action */}
                  <div className="w-full lg:w-80 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                    
                    {/* B2B Negotiated Quote details */}
                    <div className="bg-blue-50/50 border border-blue-50/80 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                        <Landmark size={12} /> B2B Price Quotation
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Unit Price (Retail)</span>
                          <span className="line-through">₹{retailPriceRupees.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800">
                          <span>Wholesale Offer</span>
                          <span className={isDiscounted ? 'text-emerald-600 text-sm font-extrabold' : 'text-gray-900'}>
                            ₹{unitPriceUsed.toLocaleString('en-IN')} {isDiscounted && <span className="text-[10px] bg-emerald-100 px-1 py-0.5 rounded">Special</span>}
                          </span>
                        </div>

                        {isDiscounted && (
                          <div className="border-t border-blue-100 pt-1.5 mt-1 text-emerald-700 flex justify-between items-center text-[11px] font-bold">
                            <span className="flex items-center gap-0.5"><Percent size={11} /> Total Savings</span>
                            <span>₹{totalSavings.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sales Remarks */}
                    {inquiry.adminNotes && (
                      <div className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-100 p-3 rounded-xl">
                        <span className="font-bold block mb-0.5 text-[10px] uppercase text-yellow-900 tracking-wider">Manager Remark</span>
                        "{inquiry.adminNotes}"
                      </div>
                    )}

                    {/* Action button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsAppChat(inquiry)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-100 cursor-pointer"
                      >
                        <MessageSquare size={14} /> WhatsApp Support
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
