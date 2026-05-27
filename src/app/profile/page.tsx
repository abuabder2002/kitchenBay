'use client';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserCircle2, MapPin, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

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
              <button className="text-sm font-semibold text-[--color-brand-accent] hover:text-[--color-brand-accent-hover] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Edit Profile</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900"><MapPin size={20} className="text-gray-400" /> Saved Addresses</h3>
              <button className="text-sm font-semibold text-[--color-brand-accent] hover:text-[--color-brand-accent-hover]">+ Add New</button>
            </div>
            {user.addresses && user.addresses.length > 0 ? (
              <ul className="space-y-4">
                {user.addresses.map((addr: any, idx: number) => (
                  <li key={idx} className="p-4 border rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
                    <p className="font-semibold text-gray-900 mb-1">{addr.street}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">You haven't saved any addresses yet.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900"><Settings size={20} className="text-gray-400" /> Account Settings</h3>
            <ul className="space-y-4 text-gray-700">
              <li><button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium transition-colors border border-transparent hover:border-gray-100">Change Password</button></li>
              <li><button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium transition-colors border border-transparent hover:border-gray-100">Communication Preferences</button></li>
              <li><button className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 font-medium transition-colors border border-transparent hover:border-red-100">Delete Account</button></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
