import { CartItems } from '@/components/cart/CartItems';
import { CartSummary } from '@/components/cart/CartSummary';
import Link from 'next/link';

export const metadata = {
  title: "Your Cart | BluaTalk Goods",
};

export default function CartPage() {
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
