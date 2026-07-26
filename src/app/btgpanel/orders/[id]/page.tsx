"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, Loader2, Truck, Package, XCircle, RotateCcw, MessageCircle, Trash2, AlertCircle } from 'lucide-react';
import { updateOrderStatusInFirestore, getOrdersFromFirestore, deleteOrderFromFirestore } from '@/lib/firestore';
import { AdminOrder } from '@/types/admin';
import React from 'react';

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

const allStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

function formatBDT(v: number) { return new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', minimumFractionDigits:0 }).format(v); }
function formatDate(ts: number) { return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);
  
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const orders = await getOrdersFromFirestore();
        const found = orders.find(o => o.id === id || o.orderId === id);
        if (found) {
          setOrder(found);
          setNewStatus(found.status);
        }
      } catch (err) {
        console.error("Error loading order from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      await updateOrderStatusInFirestore(order.id, newStatus, note);
      
      setOrder(prev => prev ? ({
        ...prev,
        status: newStatus as any,
        timeline: [...(prev.timeline || []), { status: newStatus, note, timestamp: Date.now() }]
      }) : null);
      
      setNote('');
      setUpdated(true);
      setTimeout(() => setUpdated(false), 3000);
    } catch (err) {
      console.error("Error updating order status in Firestore:", err);
      alert("Failed to update status in Firestore");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      setIsDeleting(true);
      await deleteOrderFromFirestore(order.id);
      router.push('/btgpanel/orders');
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order.");
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Link href="/btgpanel/orders" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft size={18} /> Back to Orders
        </Link>
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
          Order not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Link href="/btgpanel/orders" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order {order.orderId}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[order.status] || statusColor.pending}`}>{order.status}</span>
          <button 
            onClick={() => setShowDeletePopup(true)}
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
            title="Delete Order"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {updated && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
          ✓ Order status updated in Firestore successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">Customer Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', order.customer?.name],['Phone', order.customer?.phone],['WhatsApp', order.customer?.whatsapp],['Address', order.customer?.address],['City', order.customer?.city],['Note', order.customer?.note||'—']].map(([k,v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{k}</p>
                  <p className="font-semibold text-gray-900">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Products */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">Ordered Products</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || '/placeholder.jpg'} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatBDT(item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatBDT(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>{formatBDT(order.shipping)}</span></div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary-600">{formatBDT(order.total)}</span>
                  {order.status === 'delivered' && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[11px] font-bold rounded-full">✓ Full Paid</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: 1/3 */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                  {allStatuses.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Add a note for this status update..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
              </div>
              <button 
                onClick={handleUpdateStatus} 
                disabled={updating}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {updating && <Loader2 size={16} className="animate-spin" />}
                {updating ? 'Updating Firestore...' : 'Update Status'}
              </button>

              {(order.status === 'confirmed' || newStatus === 'confirmed') && order.customer?.whatsapp && (
                <a
                  href={`https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${order.customer.name}, your order ${order.orderId} has been confirmed. Thank you for shopping with us!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Send WhatsApp Confirmation
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 text-base">Order Timeline</h2>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-100" />
              {order.timeline?.map((t, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ${i===(order.timeline?.length||1)-1 ? 'bg-primary-500' : 'bg-gray-300'}`}>
                    {timelineIcons[t.status]}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{t.status}</p>
                  {t.note && <p className="text-xs text-gray-500 mt-0.5">{t.note}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(t.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete order <strong>{order.orderId}</strong>? This action cannot be undone and will permanently remove data from the database.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeletePopup(false)} 
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
