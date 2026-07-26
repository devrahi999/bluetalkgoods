"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useEffect, useState } from 'react';
import { getStoreSettingsFromFirestore } from '@/lib/firestore';
import { StoreSettings } from '@/types/admin';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const isAdminRoute = pathname?.startsWith('/btgpanel');

  useEffect(() => {
    if (!isAdminRoute) {
      getStoreSettingsFromFirestore().then(res => {
        if (res) setSettings(res);
      });
    }
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FB] text-gray-900 p-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4">We will be right back!</h1>
        <p className="text-lg text-gray-600">Our website is currently undergoing scheduled maintenance.</p>
      </div>
    );
  }

  return (
    <>
      {settings?.announcementEnabled && settings?.announcementBar && (
        <div className="bg-primary-600 text-white text-xs sm:text-sm font-semibold py-2 px-4 text-center">
          {settings.announcementBar}
        </div>
      )}
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
      {settings && <WhatsAppButton phoneNumber={settings.whatsappNumber || '8801700000000'} />}
    </>
  );
}
