"use client";

import { useState, useEffect } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCustomersFromFirestore, getOrdersFromFirestore } from '@/lib/firestore';
import { AdminCustomer, AdminOrder } from '@/types/admin';

function formatBDT(v: number) { return new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', minimumFractionDigits:0 }).format(v); }
function formatDate(ts: number) { return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }); }

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-orange-50 text-orange-700',
};

function initials(name: string) {
  return (name || 'C').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
}

const avatarColors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-red-500','bg-indigo-500'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const customerList = await getCustomersFromFirestore();
        const orderList = await getOrdersFromFirestore();
        setCustomers(customerList);
        setOrders(orderList);
      } catch (err) {
        console.error("Error loading customers from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  );
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const customerOrders = selected ? orders.filter(o => o.customer?.phone === selected.phone) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-400 mt-0.5">{customers.length} total customers in Firestore</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              {['Customer','Phone','City','Total Orders','Total Spend','Last Order',''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Loading customers from Firestore...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No customers found</td></tr>
              ) : (
                paginated.map((c: AdminCustomer, idx: number) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${avatarColors[idx % avatarColors.length]} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>{initials(c.name)}</div>
                        <span className="font-semibold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.phone}</td>
                    <td className="px-5 py-4 text-gray-600">{c.city}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900 text-center">{c.totalOrders}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{formatBDT(c.totalSpend)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(c.lastOrderDate)}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-primary-600 text-gray-500 transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {((page-1)*perPage)+1}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16}/></button>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={18}/></button>
            </div>

            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl font-bold">{initials(selected.name)}</div>
              <div>
                <p className="font-bold text-gray-900 text-base">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.phone}</p>
                <p className="text-xs text-gray-400">Customer record in Firestore</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['Total Orders', selected.totalOrders, 'text-primary-600'],['Total Spend', formatBDT(selected.totalSpend), 'text-green-600'],['Last Order', formatDate(selected.lastOrderDate), 'text-gray-700']].map(([l,v,c]) => (
                <div key={l as string} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className={`font-bold text-sm ${c}`}>{v}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
              <p className="text-sm font-semibold text-gray-900">{selected.address}, {selected.city}</p>
            </div>

            {customerOrders.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order History</p>
                <div className="space-y-2">
                  {customerOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-primary-600 font-mono">{o.orderId}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatBDT(o.total)}</p>
                        <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
