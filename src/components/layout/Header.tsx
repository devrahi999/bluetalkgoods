"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchModal } from '@/components/ui/SearchModal';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="container-custom h-16 md:h-20 flex items-center justify-between">
        
        {/* Left Side: Logo (Natural Ratio) */}
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
          <Link href="/about" className="hover:text-primary-600 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
        </nav>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <SearchModal />
          
          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 text-gray-900 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50">
            <Heart size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
};
