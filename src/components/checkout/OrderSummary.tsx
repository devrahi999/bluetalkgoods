"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function OrderSummary() {
  const { items, getTotal } = useCartStore();
  const subtotal = getTotal();
  // Assume default is Dhaka for display purpose unless hooked to form state
  const shipping = subtotal > 0 ? 60 : 0; 
  const total = subtotal + shipping;

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
              <Image 
                src={item.product.images?.[0] || "/placeholder.jpg"} 
                alt={item.product.title} 
                fill 
                className="object-cover" 
              />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10">
                {item.quantity}
              </div>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <span className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.title}</span>
              <span className="text-sm text-gray-500">
                {formatPrice(item.product.salePrice || item.product.price)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-gray-900">{formatPrice(shipping)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-primary-600">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
