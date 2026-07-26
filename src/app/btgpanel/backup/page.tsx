"use client";

import { Download, Package, ShoppingBag, Users } from 'lucide-react';
import { mockAdminProducts, mockOrders, mockAdminCustomers } from '@/lib/adminData';

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const exports = [
  {
    icon: Package,
    title: 'Export Products',
    description: 'Download all products as a CSV file. Includes title, price, stock, category, and status.',
    color: 'bg-blue-50 text-[#1A35FF]',
    action: () => downloadCSV('products.csv',
      mockAdminProducts.map(p => [p.id, p.title, p.slug, String(p.price), String(p.salePrice||''), String(p.stock||''), p.category||'', p.isActive?'Active':'Inactive', p.isFeatured?'Yes':'No']),
      ['ID','Title','Slug','Price','Sale Price','Stock','Category','Status','Featured']
    )
  },
  {
    icon: ShoppingBag,
    title: 'Export Orders',
    description: 'Download all orders as a CSV file. Includes order ID, customer info, items, total, and status.',
    color: 'bg-green-50 text-green-600',
    action: () => downloadCSV('orders.csv',
      mockOrders.map(o => [o.orderId, o.customer.name, o.customer.phone, o.customer.city, String(o.total), o.status, new Date(o.createdAt).toLocaleDateString()]),
      ['Order ID','Customer','Phone','City','Total','Status','Date']
    )
  },
  {
    icon: Users,
    title: 'Export Customers',
    description: 'Download all customer records as a CSV file. Includes name, phone, address, and order stats.',
    color: 'bg-purple-50 text-purple-600',
    action: () => downloadCSV('customers.csv',
      mockAdminCustomers.map(c => [c.name, c.phone, c.address, c.city, String(c.totalOrders), String(c.totalSpend), new Date(c.createdAt).toLocaleDateString()]),
      ['Name','Phone','Address','City','Total Orders','Total Spend','Member Since']
    )
  },
];

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Backup & Export</h1>
        <p className="text-sm text-gray-400 mt-0.5">Export your data as CSV files for backup or analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exports.map(({ icon: Icon, title, description, color, action }) => (
          <div key={title} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col">
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4`}>
              <Icon size={26} />
            </div>
            <h2 className="font-bold text-gray-900 text-base mb-2">{title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">{description}</p>
            <button onClick={action} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              <Download size={16}/> Export as CSV
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-blue-800">💡 Tip: Connect Firestore to export real data. Currently using mock data.</p>
      </div>
    </div>
  );
}
