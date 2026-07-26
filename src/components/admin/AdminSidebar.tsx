"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Star, MessageSquare, 
  Settings, Image, BarChart3, Shield, ScrollText, Download, LogOut, X
} from 'lucide-react';
import { useAdminSidebar } from '@/context/AdminSidebarContext';
import { cn } from '@/lib/utils';

const allNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/btgpanel', key: 'dashboard' },
  { icon: ShoppingBag, label: 'Orders', href: '/btgpanel/orders', key: 'orders' },
  { icon: Package, label: 'Products', href: '/btgpanel/products', key: 'products' },
  { icon: Users, label: 'Customers', href: '/btgpanel/customers', key: 'customers' },
  { icon: Star, label: 'Reviews', href: '/btgpanel/reviews', key: 'reviews' },
  { icon: MessageSquare, label: 'Messages', href: '/btgpanel/messages', key: 'messages' },
  { icon: Settings, label: 'Store Settings', href: '/btgpanel/settings', key: 'settings' },
  { icon: Image, label: 'Banner Manager', href: '/btgpanel/banners', key: 'banners' },
  { icon: BarChart3, label: 'Analytics', href: '/btgpanel/analytics', key: 'analytics' },
  { icon: Shield, label: 'Admins', href: '/btgpanel/admins', key: 'admins' },
  { icon: ScrollText, label: 'Logs', href: '/btgpanel/logs', key: 'logs' },
  { icon: Download, label: 'Backup', href: '/btgpanel/backup', key: 'backup' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);

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

  const allowedKeys = adminSession?.allowedPages || [];
  const isMainAdmin = adminSession?.isMainAdmin !== false;

  const visibleNavItems = allNavItems.filter(item => 
    isMainAdmin || allowedKeys.includes(item.key) || item.key === 'dashboard'
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link href="/btgpanel" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="BluaTalk Goods Admin" className="h-8 w-auto object-contain" />
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Admin User Tag */}
      {adminSession && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <p className="text-xs font-bold text-gray-900 truncate">ID: {adminSession.adminId}</p>
          <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700">
            {adminSession.role || 'Admin'}
          </span>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleNavItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === '/btgpanel' ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-blue-50 text-primary-600 border-l-[3px] border-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 border-l-[3px] border-transparent"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const { isOpen, close } = useAdminSidebar();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={close}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl md:hidden flex flex-col"
            >
              <SidebarContent onClose={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
