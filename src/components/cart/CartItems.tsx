"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartItems() {
  const { items, removeItem, updateQuantity } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty</h2>
        <Link href="/products" className="btn-primary inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.product.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
            <Image 
              src={item.product.images?.[0] || "/placeholder.jpg"} 
              alt={item.product.title} 
              fill 
              className="object-cover" 
            />
          </div>
          
          <div className="flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/products/${item.product.slug}`} className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                  {item.product.title}
                </Link>
                <div className="text-primary-600 font-semibold mt-1">
                  {formatPrice(item.product.salePrice || item.product.price)}
                </div>
              </div>
              <button 
                onClick={() => removeItem(item.product.id)}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                  className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
