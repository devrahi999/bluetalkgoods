"use client";

import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Loader2, Truck, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { getOrderByOrderId } from '@/lib/firestore';
import { AdminOrder } from '@/types/admin';
import { formatPrice } from '@/lib/utils';

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const timelineIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  processing: <Loader2 size={14} />,
  shipped: <Truck size={14} />,
  delivered: <Package size={14} />,
  cancelled: <XCircle size={14} />,
  returned: <RotateCcw size={14} />,
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrderTrackingPage() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      
      const found = await getOrderByOrderId(orderIdInput.trim());

      if (found) {
        if (phoneInput.trim() && found.customer?.phone && !found.customer.phone.includes(phoneInput.trim())) {
          setError('Order ID found, but phone number does not match.');
          setOrder(null);
        } else {
          setOrder(found);
        }
      } else {
        setError('No order found with this Order ID.');
        setOrder(null);
      }
    } catch (err) {
      console.error('Error tracking order in Firestore:', err);
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10 md:py-16 max-w-xl mx-auto">
      <div className="bg-white rounded-md p-6 md:p-8 shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">Track Your Order</h1>
        <p className="text-gray-600 text-sm text-center mb-6 font-medium">
          Enter your Order ID (e.g. BTG-72B76HS) to check live status in Firestore.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-md mb-5 flex items-center gap-2 font-medium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Order ID *
            </label>
            <input
              type="text"
              id="orderId"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="e.g. BTG-A1B2C3D"
              className="input-field uppercase font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. 01700..."
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span>{loading ? 'Tracking...' : 'Track Order'}</span>
          </button>
        </form>
      </div>

      {/* Live Order Details Card */}
      {order && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order ID</span>
              <p className="text-xl font-mono font-bold text-primary-600">{order.orderId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Order Timeline</h3>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
              {order.timeline?.map((t, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${idx === (order.timeline?.length || 1) - 1 ? 'bg-primary-500 ring-2 ring-primary-100' : 'bg-gray-300'}`}>
                    {timelineIcons[t.status] || <Package size={12} />}
                  </div>
                  <p className="font-bold text-gray-900 text-sm capitalize">{t.status}</p>
                  {t.note && <p className="text-xs text-gray-600 mt-0.5">{t.note}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(t.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Ordered Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || '/placeholder.jpg'} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Customer Name</span>
              <span className="text-gray-900 font-semibold">{order.customer?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Address</span>
              <span className="text-gray-900 font-semibold text-right max-w-[60%]">{order.customer?.address}, {order.customer?.city}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="text-gray-900 font-semibold">Cash on Delivery</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="text-gray-900 font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span className="text-gray-900 font-semibold">{formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <div className="flex items-center gap-2">
                <span className="text-primary-600">{formatPrice(order.total)}</span>
                {order.status === 'delivered' && (
                  <span className="px-2.5 py-0.5 bg-green-500 text-white text-[11px] font-bold rounded-full">✓ Full Paid</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
