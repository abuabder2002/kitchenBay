'use client';
/* eslint-disable @next/next/no-img-element */

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserCircle2, MapPin, Settings, X } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  const handleSaveAddress = async () => {
    // Requires an API route to actually save to DB since Clerk is gone
    // We will just alert for now or close modal
    setIsAddressModalOpen(false);
    setNewAddress({ street: '', city: '', state: '', zip: '' });
    alert('Saving address is currently disabled pending backend integration.');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-brand-accent]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <UserCircle2 className="text-[--color-brand-accent]" size={32} />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">My Profile</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold uppercase overflow-hidden border-2 border-white shadow">
              {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 mb-2">{user.email}</p>
              <button onClick={() => alert('Editing profile is coming soon!')} className="text-sm font-semibold text-[--color-brand-accent] hover:text-[--color-brand-accent-hover] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Edit Profile</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900"><MapPin size={20} className="text-gray-400" /> Saved Addresses</h3>
              <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-semibold text-[--color-brand-accent] hover:text-[--color-brand-accent-hover]">+ Add New</button>
            </div>
            {user.addresses && user.addresses.length > 0 ? (
              <ul className="space-y-4">
                {user.addresses.map((addr: { street: string; city: string; state: string; zip: string }, idx: number) => (
                  <li key={idx} className="p-4 border rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
                    <p className="font-semibold text-gray-900 mb-1">{addr.street}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">You haven&apos;t saved any addresses yet.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900"><Settings size={20} className="text-gray-400" /> Account Settings</h3>
            <ul className="space-y-4 text-gray-700">
              <li><button onClick={() => alert('Change password coming soon')} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium transition-colors border border-transparent hover:border-gray-100">Change Password</button></li>
              <li><button onClick={() => alert('Communication preferences coming soon')} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium transition-colors border border-transparent hover:border-gray-100">Communication Preferences</button></li>
              <li><button onClick={() => alert('Account deletion coming soon')} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 font-medium transition-colors border border-transparent hover:border-red-100">Delete Account</button></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />

      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[--color-brand-accent]" placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[--color-brand-accent]" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[--color-brand-accent]" placeholder="State" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input type="text" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[--color-brand-accent]" placeholder="ZIP" />
              </div>
              <button 
                onClick={handleSaveAddress}
                disabled={isSaving || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip}
                className="w-full mt-4 bg-[--color-brand-accent] text-white py-3 rounded-xl font-bold hover:bg-[--color-brand-accent-hover] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
