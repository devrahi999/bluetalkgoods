"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import * as fbPixel from '@/lib/facebookPixel';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    fbPixel.addToCart({
      content_name: product.title,
      content_ids: [product.id],
      content_type: 'product',
      value: product.salePrice || product.price,
      currency: 'BDT',
      num_items: 1
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div 
        className={cn("group flex flex-col h-full bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300", className)}
      >
        <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-100 border-b border-gray-100">
          {product.discountPercent && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm tracking-wide">
              -{product.discountPercent}%
            </div>
          )}
          {product.images?.[0] ? (
            <Image 
              src={product.images[0]} 
              alt={product.title} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
              {product.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">{(product.rating || 5).toFixed(1)}</span>
            <span className="text-[10px] sm:text-xs text-gray-500 ml-1">({product.soldCount || 0} sold)</span>
          </div>
          
          <div className="mt-auto mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-base sm:text-lg font-bold text-primary-600">{formatPrice(product.salePrice)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full bg-white border border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white py-2 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
};
