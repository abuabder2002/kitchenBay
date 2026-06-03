'use client';

import Link from 'next/link';
import Image from 'next/image';
import logoImg from '../images/logo.jpeg';
import { Home, Package, ShoppingBag, BarChart2, Settings, LogOut, ChevronRight, Menu, Video, Upload } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <BarChart2 size={18} /> },
  { href: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { href: '/admin/products/add', label: 'Add Product', icon: <ShoppingBag size={18} /> },
  { href: '/admin/bulk-upload', label: 'Bulk Upload', icon: <Upload size={18} /> },
  { href: '/admin/orders', label: 'Orders', icon: <Home size={18} /> },
  { href: '/admin/bulk-inquiries', label: 'Bulk Inquiries', icon: <ShoppingBag size={18} /> },
  { href: '/admin/videos', label: 'Videos', icon: <Video size={18} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-1.5 bg-white rounded shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 ${collapsed ? 'md:w-16' : 'md:w-64'
          } w-64 fixed md:relative z-50 transition-all duration-300 bg-gradient-to-b from-blue-950 to-[#071120] h-screen flex flex-col border-r border-blue-900/30`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-4 border-b border-blue-900/60">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Image src={logoImg} alt="Kitchenbay Logo" width={120} height={40} className="object-contain h-8 w-auto rounded-md invert brightness-0" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-blue-300 hover:text-yellow-400 transition-colors p-1 rounded-lg hover:bg-blue-900/40"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Admin Label */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider">Admin Panel</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:text-yellow-400 hover:bg-blue-900/40 hover:border-yellow-400/20 border border-transparent transition-all group"
            >
              <span className="text-blue-300 group-hover:text-yellow-400 transition-colors shrink-0">
                {item.icon}
              </span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {!collapsed && <ChevronRight size={14} className="ml-auto text-blue-500 group-hover:text-yellow-400 transition-colors" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-blue-900/60 space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:text-yellow-400 hover:bg-blue-900/40 transition-all"
          >
            <Settings size={18} className="shrink-0 text-blue-300 group-hover:text-yellow-400" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} className="shrink-0 text-blue-300" />
            {!collapsed && <span className="text-sm font-medium">Exit Admin</span>}
          </Link>
          {!collapsed && (
            <div className="mt-3 mx-1 p-3 bg-blue-950/50 rounded-xl border border-blue-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  A
                </div>
                <div>
                  <p className="text-blue-50 text-sm font-medium">Admin User</p>
                  <p className="text-blue-300/60 text-xs">admin@KitchenBay.co</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
