import Link from 'next/link';
import { StoreSettings } from '@/types/admin';

export const Footer = ({ settings }: { settings?: StoreSettings | null }) => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-20 md:pb-10 shadow-sm mt-auto text-gray-900">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          {/* Logo & Info */}
          <div className="w-full md:w-1/3">
            <Link href="/" className="inline-block mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="BluaTalk Goods" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            </Link>
            <p className="text-gray-700 text-sm mb-4 leading-relaxed font-medium">
              {settings?.seoDescription || "Premium quality products delivered to your doorstep. Cash on Delivery across Bangladesh."}
            </p>
            {settings && (
              <div className="space-y-2 mt-4 text-xs font-semibold text-gray-500">
                {settings.contactNumber && <p>Phone: {settings.contactNumber}</p>}
                {settings.supportEmail && <p>Email: {settings.supportEmail}</p>}
                {settings.businessAddress && <p>Address: {settings.businessAddress}</p>}
              </div>
            )}
          </div>

          {/* Links (2 Columns) */}
          <div className="w-full md:w-1/2 flex justify-between gap-4">
            <div className="w-1/2">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Quick Links</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</Link></li>
                <li><Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">Shop All</Link></li>
                <li><Link href="/order-tracking" className="text-gray-700 hover:text-primary-600 transition-colors">Track Order</Link></li>
                <li><Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div className="w-1/2">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Policies</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/privacy-policy" className="text-gray-700 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/return-policy" className="text-gray-700 hover:text-primary-600 transition-colors">Return Policy</Link></li>
                <li><Link href="/terms" className="text-gray-700 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-600 gap-4">
          <p>{settings?.footerCopyright || `© ${new Date().getFullYear()} BluaTalk Goods. All rights reserved.`}</p>
          <div className="flex gap-4">
            {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-primary-600">Facebook</a>}
            {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary-600">Instagram</a>}
            {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-primary-600">YouTube</a>}
          </div>
        </div>
      </div>
    </footer>
  );
};
