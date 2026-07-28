"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { SearchModal } from '@/components/ui/SearchModal';
import { useCartStore } from '@/store/cartStore';

export const Header = () => {
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="container-custom h-16 md:h-20 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="BluaTalk Goods" 
            className="h-12 md:h-14 w-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-gray-900">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <Link href="/products" className="hover:text-primary-600 transition-colors">Shop</Link>
          <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
          {/* Cart link with badge */}
          <Link href="/cart" className="relative flex items-center gap-1.5 hover:text-primary-600 transition-colors">
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary-500 text-white text-[11px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <SearchModal />
          
          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 text-gray-900 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50">
            <Heart size={22} />
          </Link>

          {/* Cart icon (mobile only, with badge) */}
          <Link href="/cart" className="relative p-2 text-gray-900 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 md:hidden">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-bold px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
