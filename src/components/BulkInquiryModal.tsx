'use client';
/* eslint-disable @next/next/no-img-element */


import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, Send, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  finalPrice: number;
  image: string;
}

interface BulkInquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialQuantity: number;
}

export default function BulkInquiryModal({ product, isOpen, onClose, initialQuantity }: BulkInquiryModalProps) {
  const { user, isLoaded } = useUser();
  const moq = product.category === 'kitchenware' ? 50 : 30;

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [quantity, setQuantity] = useState(initialQuantity < moq ? moq : initialQuantity);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [preferredContact, setPreferredContact] = useState<'EMAIL' | 'WHATSAPP' | 'PHONE'>('EMAIL');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autofill Clerk User Information
  useEffect(() => {
    if (isLoaded && user) {
      Promise.resolve().then(() => {
        setCustomerName(user.fullName || user.username || '');
        setEmail(user.emailAddresses?.[0]?.emailAddress || '');
      });
    }
  }, [user, isLoaded]);

  if (!isOpen) return null;

  // Form Validation
  const validateForm = () => {
    if (!customerName.trim()) return 'Customer Name is required.';
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase().trim())) {
      return 'Please enter a valid 15-character Indian GSTIN (e.g. 22AAAAA1111A1Z1).';
    }
    if (quantity < moq) {
      return `Quantity must be at least the Minimum Order Quantity (MOQ) of ${moq} units.`;
    }
    if (!deliveryLocation.trim()) {
      return 'Delivery Location/Address is required.';
    }
    return null;
  };

  // Submit Inquiry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bulk-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          companyName: companyName.trim() || undefined,
          mobile,
          email,
          gstNumber: gstNumber.toUpperCase().trim() || undefined,
          deliveryLocation,
          specialRequirements: specialRequirements.trim() || undefined,
          preferredContact,
          items: [{ productId: product.id, quantity }],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit bulk order inquiry');
      }

      setSubmittedInquiryId(data.inquiryId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp quick redirect
  const handleWhatsAppRedirect = () => {
    const defaultWhatsAppNumber = '919999999999'; // B2B sales desk
    const message = `Hi Kitchenbay, I'm interested in bulk ordering "${product.name}" (MOQ: ${moq}). I'd like to request a quote for ${quantity} units. Special requirements: ${specialRequirements || 'None'}. My contact details: ${customerName} (${email}, ${mobile}).`;
    const whatsappUrl = `https://wa.me/${defaultWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-[#0c1e35] px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-lg text-yellow-400">Bulk Order Inquiry</h3>
            <p className="text-xs text-blue-200/80">Get customized pricing for high-volume B2B orders</p>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {submittedInquiryId ? (
            /* Success State */
            <div className="py-10 flex flex-col items-center text-center animate-in fade-in duration-300">
              <CheckCircle size={64} className="text-emerald-500 mb-4 animate-bounce" />
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted Successfully!</h4>
              <p className="text-sm text-gray-600 max-w-md mb-6">
                Your inquiry ID is <strong className="text-blue-900 font-mono">{submittedInquiryId}</strong>. We&apos;ve sent a confirmation email to <strong>{email}</strong>. Our B2B representative will contact you via <strong>{preferredContact}</strong> within 12-24 hours.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/orders/bulk"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
                >
                  Track My Inquiries
                </Link>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Close Modal
                </button>
              </div>
            </div>
          ) : (
            /* Form Input State */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Brief */}
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider capitalize">{product.category}</p>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Retail Price: ₹{product.finalPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-800 font-bold text-xs rounded-full">
                    MOQ: {moq} pcs
                  </span>
                </div>
              </div>

              {/* Form Validation Errors */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                  <span className="shrink-0 font-bold text-sm">⚠</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Customer Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / Business Name</label>
                  <input 
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Radisson Hotels"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. buyer@company.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                  <input 
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">GST Number (Optional)</label>
                  <input 
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="15-character GSTIN"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Requested Quantity *</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      min={moq}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || moq)}
                      className="w-full pl-3.5 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-gray-800"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      units
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Location / Address *</label>
                <input 
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Street address, City, State, Pincode"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                />
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Preferred Contact Method *</label>
                <div className="flex gap-4">
                  {(['EMAIL', 'WHATSAPP', 'PHONE'] as const).map((method) => (
                    <label key={method} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="preferredContact" 
                        value={method} 
                        checked={preferredContact === method}
                        onChange={() => setPreferredContact(method)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="capitalize">{method.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Requirements */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Customization / Special Requirements</label>
                <textarea 
                  rows={3}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Describe details like laser engraving logos, custom gift boxes, specific delivery dates, etc."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppRedirect}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  <MessageSquare size={16} /> WhatsApp Inquiry
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-200 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting Inquiry...</>
                  ) : (
                    <><Send size={16} /> Submit Bulk Inquiry</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
