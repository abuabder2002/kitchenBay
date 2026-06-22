import Sidebar from '@/components/Sidebar';
import { UserCircle2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-4 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Admin Panel</p>
            <p className="text-sm font-semibold text-gray-700">Kitchenbay Management</p>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <UserCircle2 size={32} className="text-gray-400" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
