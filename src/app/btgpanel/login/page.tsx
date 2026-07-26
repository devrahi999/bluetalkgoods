"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { verifyAdminLoginInFirestore } from '@/lib/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !adminPass.trim()) {
      setError('Please enter both Admin ID and Password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Verify in Firestore admins collection!
      const admin = await verifyAdminLoginInFirestore(adminId, adminPass);

      if (admin) {
        const sessionData = {
          id: admin.id,
          adminId: admin.adminId,
          role: admin.role,
          isMainAdmin: admin.isMainAdmin,
          allowedPages: admin.allowedPages || [],
          loginTime: Date.now(),
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));

        router.push('/btgpanel');
      } else {
        setError('Invalid Admin ID or Password, or account is disabled.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to authenticate. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex items-center justify-center px-4 py-12">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500 rounded-t-2xl" />

        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="BluaTalk Goods Logo" className="h-10 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Portal Login</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2 font-semibold">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Admin ID</label>
            <div className="relative">
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">Default Super Admin: ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">admin</code> | Pass: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">admin123</code></p>
        </div>
      </div>
    </div>
  );
}
