import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import { getStoreSettingsFromFirestore } from '@/lib/firestore';

export async function generateMetadata(): Promise<Metadata> {
  let title = 'BluaTalk Goods | Premium E-Commerce Store';
  let description = 'Shop premium goods with Cash on Delivery across Bangladesh.';
  let siteName = 'BluaTalk Goods';

  try {
    const settings = await getStoreSettingsFromFirestore();
    if (settings) {
      if (settings.seoTitle) title = settings.seoTitle;
      if (settings.seoDescription) description = settings.seoDescription;
      if (settings.websiteName) siteName = settings.websiteName;
    }
  } catch (error) {
    console.error('Error fetching metadata settings:', error);
  }

  return {
    metadataBase: new URL('https://bluetalk.site'),
    title,
    description,
    keywords: 'ecommerce, bluatalk goods, online shopping, bangladesh, buy online',
    openGraph: {
      title,
      description,
      siteName,
      type: 'website',
      url: 'https://bluetalk.site',
      images: [
        {
          url: '/logo.png',
          width: 800,
          height: 600,
          alt: siteName,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/logo.png',
    },
  };
}

import { Suspense } from 'react';
import { FacebookPixel } from '@/components/FacebookPixel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#F4F7FB] text-gray-900">
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
