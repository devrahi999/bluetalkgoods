"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrdersFromFirestore } from '@/lib/firestore';
import { AdminOrder } from '@/types/admin';

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const allStatuses = ['all','pending','confirmed','processing','shipped','delivered','cancelled','returned'];

function formatBDT(v: number) { return new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', minimumFractionDigits:0 }).format(v); }
function formatDate(ts: number) { return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }); }

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getOrdersFromFirestore();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || o.status === activeTab;
    return matchSearch && matchTab;
  });

  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders from Firestore</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allStatuses.map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => { setActiveTab(s); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${activeTab === s ? 'bg-primary-500 text-white border-primary-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500 hover:text-primary-600'}`}>
              <span className="capitalize">{s}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID or customer name..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              {['Order ID','Customer','Phone','Items','Total','Status','Date',''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">Loading orders from Firestore...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No orders found</td></tr>
              ) : paginated.map((order: AdminOrder) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-primary-600">{order.orderId}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{order.customer?.name}</td>
                  <td className="px-5 py-4 text-gray-600">{order.customer?.phone}</td>
                  <td className="px-5 py-4 text-gray-600">{order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}</td>
                  <td className="px-5 py-4 font-bold text-gray-900">{formatBDT(order.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${statusColor[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/btgpanel/orders/${order.id}`} className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-primary-600 text-gray-500 transition-colors inline-flex">
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {((page-1)*perPage)+1}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft size={16}/></button>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
