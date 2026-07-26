"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebarProvider } from '@/context/AdminSidebarContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/btgpanel/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const session = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    if (!session) {
      router.push('/btgpanel/login');
    } else {
      try {
        setAdminSession(JSON.parse(session));
      } catch {
        router.push('/btgpanel/login');
      }
    }
    setLoading(false);
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#F0F2FA]">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!adminSession) {
    return null; // Will redirect via useEffect
  }

  // Check RBAC Permissions
  const pathSegment = pathname.replace('/btgpanel', '').replace(/^\//, '').split('/')[0] || 'dashboard';
  const isMainAdmin = adminSession.isMainAdmin !== false;
  const allowedPages = adminSession.allowedPages || [];
  const isAllowed = isMainAdmin || allowedPages.includes(pathSegment) || pathSegment === 'dashboard';

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen bg-[#F0F2FA] flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {isAllowed ? (
              children
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto my-12 border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-sm text-gray-500 mb-6">
                  You do not have permission to view the <strong className="text-gray-900 uppercase">{pathSegment}</strong> page. Please contact a Super Admin.
                </p>
                <Link href="/btgpanel" className="btn-primary inline-block text-sm py-2.5 px-6">
                  Back to Dashboard
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
