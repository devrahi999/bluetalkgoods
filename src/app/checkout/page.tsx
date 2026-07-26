"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { createOrderInFirestore, getStoreSettingsFromFirestore } from '@/lib/firestore';
import { StoreSettings } from '@/types/admin';
import * as fbPixel from '@/lib/facebookPixel';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    name: '', phone: '', whatsapp: '', address: '', city: '', note: ''
  });
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [shippingArea, setShippingArea] = useState<'inside' | 'sub' | 'outside'>('inside');

  useEffect(() => {
    getStoreSettingsFromFirestore().then(res => {
      if (res) setSettings(res);
    });
    
    // Facebook Pixel: Initiate Checkout
    if (items.length > 0) {
      fbPixel.initiateCheckout({
        content_ids: items.map(i => i.product.id),
        value: getTotal(),
        currency: 'BDT',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = getTotal();
  
  // Calculate if shipping is free
  const hasFreeShippingItem = items.some(i => i.product.isFreeDelivery);
  const isFreeShipping = hasFreeShippingItem || (settings?.freeShippingLimit && settings.freeShippingLimit > 0 && subtotal >= settings.freeShippingLimit);

  let shipping = 0;
  if (!isFreeShipping) {
    if (shippingArea === 'inside') shipping = settings?.shippingInsideDhaka || 70;
    else if (shippingArea === 'sub') shipping = settings?.shippingDhakaSubArea || 100;
    else if (shippingArea === 'outside') shipping = settings?.shippingOutsideDhaka || 120;
  }
  
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { setError("Your cart is empty."); return; }
    if (!formData.name || !formData.phone || !formData.whatsapp || !formData.address || !formData.city) {
      setError("Please fill in all required fields."); return;
    }
    setError('');
    setShowPopup(true);
  };

  const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `BTG-${result}`;
  };

  const confirmOrder = async () => {
    try {
      setSubmitting(true);
      const orderId = generateOrderId();
      
      const orderPayload = {
        orderId,
        customer: formData,
        items: items.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          image: item.product.images?.[0] || '',
          price: item.product.salePrice || item.product.price,
          quantity: item.quantity
        })),
        subtotal,
        shipping,
        total,
        status: 'pending' as const,
        timeline: [
          { status: 'pending', note: 'Order placed by customer', timestamp: Date.now() }
        ]
      };

      // Real Firestore Creation!
      await createOrderInFirestore(orderPayload);

      // Save order data to localStorage for the success page
      localStorage.setItem('lastOrder', JSON.stringify({
        orderId, customer: formData, items, total, subtotal, shipping,
        date: new Date().toISOString()
      }));

      clearCart();
      router.push('/order-success');
    } catch (err: any) {
      console.error("Error submitting order to Firestore:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
      setShowPopup(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Your cart is empty</h1>
        <button onClick={() => router.push('/products')} className="btn-primary inline-block">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Checkout</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 border border-red-100 shadow-sm text-sm">
            <AlertCircle size={18} /><span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-6">

          {/* Delivery */}
          <div className="bg-white p-6 md:p-8 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-5 text-gray-900 border-b border-gray-100 pb-3">1. Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahim Uddin" className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. 01700..." className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">WhatsApp Number *</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="e.g. 01700..." className="input-field" required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Road/Area" className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Dhaka" className="input-field" required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Order Note (Optional)</label>
                <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Any special instructions" className="input-field min-h-[70px] resize-none" />
              </div>
              
              {!isFreeShipping && (
                <div className="space-y-1.5 md:col-span-2 mt-2 pt-4 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Shipping Area *</label>
                  <select 
                    value={shippingArea} 
                    onChange={e => setShippingArea(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="inside">Inside Dhaka (৳{settings?.shippingInsideDhaka || 70})</option>
                    <option value="sub">Dhaka Sub Area (৳{settings?.shippingDhakaSubArea || 100})</option>
                    <option value="outside">Outside Dhaka (৳{settings?.shippingOutsideDhaka || 120})</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 md:p-8 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-5 text-gray-900 border-b border-gray-100 pb-3">2. Payment Method</h2>
            <div className="border-2 border-primary-500 bg-primary-50 rounded-md p-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</h3>
                <p className="text-xs text-gray-600 font-medium mt-0.5">Pay in cash when you receive the product</p>
              </div>
              <div className="ml-auto">
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 md:p-8 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-5 text-gray-900 border-b border-gray-100 pb-3">3. Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm font-medium border-b border-gray-50 pb-2.5">
                  <span className="text-gray-800">{item.product.title} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="text-gray-900 ml-2 flex-shrink-0">{formatPrice((item.product.salePrice || item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 pt-1">
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Shipping {isFreeShipping && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-2">FREE</span>}</span>
                <span>{isFreeShipping ? '৳0' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total to Pay</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base py-3 rounded-md shadow-sm transition-all active:scale-[0.99]"
          >
            Confirm Order
          </button>
        </form>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Place Order?</h3>
            <p className="text-gray-600 text-sm mb-6">
              You are placing an order for <strong className="text-gray-900">{formatPrice(total)}</strong>. Pay cash on delivery.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPopup(false)} 
                disabled={submitting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmOrder} 
                disabled={submitting}
                className="flex-1 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-md transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Placing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
