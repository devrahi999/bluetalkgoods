"use client";

import { CartItems } from '@/components/cart/CartItems';
import { CartSummary } from '@/components/cart/CartSummary';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import * as fbPixel from '@/lib/facebookPixel';

export default function CartPage() {
  const { items, getTotal } = useCartStore();

  const handleProceedToCheckout = () => {
    if (items.length > 0) {
      fbPixel.initiateCheckout({
        content_ids: items.map(i => i.product.id),
        contents: items.map(i => ({ 
          id: i.product.id, 
          quantity: i.quantity,
          item_price: i.product.salePrice || i.product.price
        })),
        value: getTotal(),
        currency: 'BDT',
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Your Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-2/3">
            <CartItems />
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 sticky top-24">
              <CartSummary />
              <Link
                href="/checkout"
                onClick={handleProceedToCheckout}
                className="mt-6 w-full btn-primary block text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
