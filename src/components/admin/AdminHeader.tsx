"use client";

import { useEffect, useState } from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useAdminSidebar } from '@/context/AdminSidebarContext';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const { toggle } = useAdminSidebar();
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const today = new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const session = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    if (session) {
      try {
        setAdminSession(JSON.parse(session));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminSession');
    router.push('/btgpanel/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 md:px-6 gap-4">
      {/* Mobile menu button */}
      <button onClick={toggle} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input type="text" placeholder="Search orders, products..." className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Admin Profile Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
            {adminSession?.adminId ? adminSession.adminId.charAt(0) : 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {adminSession?.adminId || 'Admin'}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">
              {adminSession?.role || 'Super Admin'} · {today}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          title="Sign Out"
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
