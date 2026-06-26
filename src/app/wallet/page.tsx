'use client';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Wallet, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function WalletPage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/wallet');
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

  const mockTransactions = [
    { id: 'TXN10293', date: '2026-05-20', amount: 500, type: 'credit', status: 'Success' },
    { id: 'TXN10294', date: '2026-05-15', amount: 1200, type: 'debit', status: 'Success' },
    { id: 'TXN10295', date: '2026-05-01', amount: 2000, type: 'credit', status: 'Success' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="text-[--color-brand-accent]" size={32} />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">My Wallet</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div>
                <p className="text-blue-200 text-sm font-medium mb-2">Available Balance</p>
                <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-8">Rs. 1,300.00</h2>
              </div>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Plus size={20} />
                Add Funds
              </button>
            </div>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-[--color-brand-border] p-8 h-full">
              <h3 className="text-xl font-bold mb-6 text-[--color-brand-text]">Recent Transactions</h3>
              <div className="space-y-4">
                {mockTransactions.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {txn.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{txn.type === 'credit' ? 'Funds Added' : 'Purchase'}</p>
                        <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {txn.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                        {txn.type === 'credit' ? '+' : '-'}Rs. {txn.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">{txn.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
