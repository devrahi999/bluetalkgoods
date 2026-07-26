"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Star, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { getProducts, deleteProductFromFirestore } from '@/lib/firestore';
import { AdminProduct } from '@/types/admin';

function formatBDT(v: number) { return new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', minimumFractionDigits:0 }).format(v); }

function StockBadge({ stock }: { stock?: number }) {
  if (stock === undefined) return <span className="text-xs text-gray-400">—</span>;
  if (stock === 0) return <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-bold">Out of Stock</span>;
  if (stock <= 10) return <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-[11px] font-bold">{stock} Low</span>;
  return <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold">{stock}</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data as AdminProduct[]);
    } catch (err) {
      console.error("Error loading products from Firestore:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductFromFirestore(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product from Firestore:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const stats = [
    { label: 'Total', value: products.length, color: 'text-gray-900' },
    { label: 'Active', value: products.filter(p => p.isActive !== false).length, color: 'text-green-600' },
    { label: 'Featured', value: products.filter(p => p.isFeatured).length, color: 'text-primary-600' },
    { label: 'Out of Stock', value: products.filter(p => (p.stock||0) === 0).length, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} total products (Real Firestore Data)</p>
        </div>
        <Link href="/btgpanel/products/new" className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              {['Product','Category','Price','Sale Price','Stock','Status','Featured','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">Loading products from Firestore...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">No products found</td>
                </tr>
              ) : (
                paginated.map((product: AdminProduct) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.title} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                        <span className="font-semibold text-gray-900 line-clamp-1 max-w-[160px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{product.category || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{formatBDT(product.price)}</td>
                    <td className="px-5 py-4 text-gray-500">{product.salePrice ? formatBDT(product.salePrice) : '—'}</td>
                    <td className="px-5 py-4"><StockBadge stock={product.stock} /></td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${product.isActive !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {product.isFeatured ? <Star size={16} className="fill-yellow-400 text-yellow-400" /> : <Star size={16} className="text-gray-200" />}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/btgpanel/products/${product.id}/edit`} className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-primary-500 text-gray-500 transition-colors">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => setDeleteId(product.id)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product from Firestore?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete the product from your database.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
