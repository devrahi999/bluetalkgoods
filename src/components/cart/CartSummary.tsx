"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartSummary() {
  const { getTotal } = useCartStore();
  const subtotal = getTotal();
  const shipping = subtotal > 0 ? 60 : 0; // Default shipping inside Dhaka
  const total = subtotal + shipping;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4">Order Summary</h2>
      
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
      </div>
      
      <div className="flex justify-between text-gray-600">
        <span>Estimated Shipping</span>
        <span className="font-medium text-gray-900">{formatPrice(shipping)}</span>
      </div>
      
      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-xl font-bold text-primary-600">{formatPrice(total)}</span>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Shipping is calculated at checkout based on location.
      </p>
    </div>
  );
}
