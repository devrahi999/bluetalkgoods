"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, MessageCircle, Copy, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import * as fbPixel from '@/lib/facebookPixel';

interface OrderData {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    note?: string;
  };
  items: {
    product: {
      id: string;
      title: string;
      images: string[];
      price: number;
      salePrice?: number;
    };
    quantity: number;
  }[];
  total: number;
  subtotal: number;
  shipping: number;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');
    if (stored) {
      try { 
        const parsedOrder: OrderData = JSON.parse(stored);
        setOrder(parsedOrder); 
        
        // Facebook Pixel: Purchase event
        const trackedKey = `fb_purchase_${parsedOrder.orderId}`;
        if (!sessionStorage.getItem(trackedKey)) {
          fbPixel.purchase({
            value: parsedOrder.total,
            currency: 'BDT',
            content_ids: parsedOrder.items.map(i => i.product.id),
            num_items: parsedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
            contents: parsedOrder.items.map(i => ({
              id: i.product.id,
              quantity: i.quantity
            }))
          });
          sessionStorage.setItem(trackedKey, 'true');
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-10 md:py-16 px-4">
      <div className="max-w-xl mx-auto">

        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(26,53,255,0.10)] border border-gray-100 p-7 md:p-10 relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500 rounded-t-xl"></div>

          {/* Success Icon */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-20 h-20 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Order Placed!</h1>
            <p className="text-gray-600 font-medium">Thank you for shopping with BluaTalk Goods.</p>
          </div>

          {/* Order ID */}
          {order && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 font-mono font-bold text-lg px-5 py-2.5 rounded-md tracking-widest shadow-sm">
                <Package size={18} />
                {order.orderId}
              </div>
              <button
                onClick={handleCopy}
                title="Copy Order ID"
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-md transition-colors border border-gray-200"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          )}

          {/* COD Badge */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <p className="text-sm text-gray-800 font-semibold mb-1">💳 Cash on Delivery</p>
            <p className="text-sm text-gray-700">
              Please keep <strong className="text-gray-900">{order ? formatPrice(order.total) : 'the total'}</strong> ready when delivery arrives.
            </p>
          </div>

          {/* WhatsApp notice */}
          <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-md p-4 mb-7">
            <MessageCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-800 font-medium">
              You will get a confirmation message on your WhatsApp number
              {order?.customer?.whatsapp && <strong className="text-gray-900"> ({order.customer.whatsapp})</strong>} shortly.
            </p>
          </div>

          {/* Delivery Info */}
          {order && (
            <>
              <div className="border-t border-gray-100 pt-6 mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Delivery To</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500 font-medium">Name</span>
                  <span className="text-gray-900 font-semibold">{order.customer.name}</span>
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="text-gray-900 font-semibold">{order.customer.phone}</span>
                  <span className="text-gray-500 font-medium">WhatsApp</span>
                  <span className="text-gray-900 font-semibold">{order.customer.whatsapp}</span>
                  <span className="text-gray-500 font-medium">Address</span>
                  <span className="text-gray-900 font-semibold">{order.customer.address}</span>
                  <span className="text-gray-500 font-medium">City</span>
                  <span className="text-gray-900 font-semibold">{order.customer.city}</span>
                  {order.customer.note && (
                    <>
                      <span className="text-gray-500 font-medium">Note</span>
                      <span className="text-gray-900 font-semibold">{order.customer.note}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="border-t border-gray-100 pt-5 mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Products Ordered</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      {item.product.images?.[0] && (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Shipping</span><span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-200 pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/products" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-md text-center transition-colors shadow-sm text-sm">
            Continue Shopping
          </Link>
          <Link href="/order-tracking" className="w-full bg-white hover:bg-gray-50 border border-gray-300 hover:border-primary-300 text-gray-800 font-semibold py-3 rounded-md text-center transition-colors text-sm">
            Track Your Order
          </Link>
        </div>

      </div>
    </div>
  );
}
