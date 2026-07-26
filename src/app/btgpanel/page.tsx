"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, TrendingUp, Calendar, ShoppingBag, Clock, CheckCircle,
  Loader2, Truck, XCircle, RotateCcw, Users, Package, AlertTriangle,
  PackageX, Star, MessageSquare
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getOrdersFromFirestore, getProducts, getCustomersFromFirestore,
  getReviewsFromFirestore, getMessagesFromFirestore
} from '@/lib/firestore';
import { AdminOrder, AdminCustomer, AdminReview, AdminMessage } from '@/types/admin';
import { Product } from '@/types';

function formatBDT(val: number) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(val);
}

function AnimatedCounter({ target, prefix = '', duration = 1200 }: { target: number; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    if (target === 0) {
      setCount(0);
      return;
    }
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{prefix}{count.toLocaleString()}</span>;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-orange-50 text-orange-700 border border-orange-200',
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0, todayRevenue: 0, monthlyRevenue: 0, netProfit: 0,
    totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, processingOrders: 0,
    deliveredOrders: 0, cancelledOrders: 0, returnedOrders: 0,
    totalCustomers: 0, totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0,
    totalReviews: 0, unreadMessages: 0,
  });

  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [salesChartData, setSalesChartData] = useState<{month: string, revenue: number, orders: number}[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [orders, products, customers, reviews, messages] = await Promise.all([
          getOrdersFromFirestore(),
          getProducts(),
          getCustomersFromFirestore(),
          getReviewsFromFirestore(),
          getMessagesFromFirestore(),
        ]);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const basePriceMap: Record<string, number> = {};
        products.forEach(p => {
          basePriceMap[p.id] = p.basePrice || (p.price * 0.75); // fallback to 25% margin if no base price
        });

        let totalRev = 0;
        let totalCost = 0;
        let todayRev = 0;
        let monthlyRev = 0;
        let pending = 0;
        let confirmed = 0;
        let processing = 0;
        let delivered = 0;
        let cancelled = 0;
        let returned = 0;

        orders.forEach(o => {
          totalRev += o.total || 0;
          if (o.status !== 'cancelled' && o.status !== 'returned') {
            o.items?.forEach(item => {
              const bp = basePriceMap[item.productId] || (item.price * 0.75);
              totalCost += bp * item.quantity;
            });
          }
          if (o.createdAt && o.createdAt >= startOfToday) todayRev += o.total || 0;
          if (o.createdAt && o.createdAt >= startOfMonth) monthlyRev += o.total || 0;

          if (o.status === 'pending') pending++;
          if (o.status === 'confirmed') confirmed++;
          if (o.status === 'processing') processing++;
          if (o.status === 'delivered') delivered++;
          if (o.status === 'cancelled') cancelled++;
          if (o.status === 'returned') returned++;
        });

        let lowStock = 0;
        let outOfStock = 0;
        products.forEach(p => {
          if ((p.stock || 0) === 0) outOfStock++;
          else if ((p.stock || 0) <= 10) lowStock++;
        });

        setStats({
          totalRevenue: totalRev,
          todayRevenue: todayRev,
          monthlyRevenue: monthlyRev,
          netProfit: totalRev - totalCost,
          totalOrders: orders.length,
          pendingOrders: pending,
          confirmedOrders: confirmed,
          processingOrders: processing,
          deliveredOrders: delivered,
          cancelledOrders: cancelled,
          returnedOrders: returned,
          totalCustomers: customers.length,
          totalProducts: products.length,
          lowStockProducts: lowStock,
          outOfStockProducts: outOfStock,
          totalReviews: reviews.length,
          unreadMessages: messages.filter(m => !m.isRead).length,
        });

        setRecentOrders(orders.slice(0, 4));
        
        const sortedProducts = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5);
        setTopProducts(sortedProducts);

        // Basic mock chart data generation based on total revenue/orders for shape, 
        // normally this would aggregate orders by actual month
        const mockChart = [
          { month: 'Jan', revenue: totalRev * 0.05, orders: Math.floor(orders.length * 0.05) },
          { month: 'Feb', revenue: totalRev * 0.08, orders: Math.floor(orders.length * 0.08) },
          { month: 'Mar', revenue: totalRev * 0.12, orders: Math.floor(orders.length * 0.12) },
          { month: 'Apr', revenue: totalRev * 0.15, orders: Math.floor(orders.length * 0.15) },
          { month: 'May', revenue: totalRev * 0.20, orders: Math.floor(orders.length * 0.20) },
          { month: 'Jun', revenue: totalRev * 0.40, orders: Math.floor(orders.length * 0.40) },
        ];
        setSalesChartData(mockChart);

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'border-l-blue-500', iconBg: 'bg-blue-50 text-blue-600', prefix: '৳' },
    { label: "Today's Revenue", value: stats.todayRevenue, icon: TrendingUp, color: 'border-l-green-500', iconBg: 'bg-green-50 text-green-600', prefix: '৳' },
    { label: 'Monthly Revenue', value: stats.monthlyRevenue, icon: Calendar, color: 'border-l-purple-500', iconBg: 'bg-purple-50 text-purple-600', prefix: '৳' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'border-l-blue-400', iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'border-l-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
    { label: 'Confirmed Orders', value: stats.confirmedOrders, icon: CheckCircle, color: 'border-l-blue-500', iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'Processing', value: stats.processingOrders, icon: Loader2, color: 'border-l-yellow-500', iconBg: 'bg-yellow-50 text-yellow-600' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: Truck, color: 'border-l-green-500', iconBg: 'bg-green-50 text-green-600' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, color: 'border-l-red-500', iconBg: 'bg-red-50 text-red-600' },
    { label: 'Returned', value: stats.returnedOrders, icon: RotateCcw, color: 'border-l-orange-500', iconBg: 'bg-orange-50 text-orange-600' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'border-l-purple-500', iconBg: 'bg-purple-50 text-purple-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'border-l-indigo-500', iconBg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Low Stock', value: stats.lowStockProducts, icon: AlertTriangle, color: 'border-l-yellow-500', iconBg: 'bg-yellow-50 text-yellow-600' },
    { label: 'Out of Stock', value: stats.outOfStockProducts, icon: PackageX, color: 'border-l-red-500', iconBg: 'bg-red-50 text-red-600' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'border-l-yellow-400', iconBg: 'bg-yellow-50 text-yellow-600' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'border-l-blue-400', iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'Net Profit (Est.)', value: stats.netProfit, icon: TrendingUp, color: 'border-l-green-600', iconBg: 'bg-green-50 text-green-600', prefix: '৳' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 border-l-4 ${card.color} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 leading-none mb-1">
                <AnimatedCounter target={card.value} prefix={card.prefix || ''} />
              </p>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-1 text-base">Revenue Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Monthly revenue in BDT</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A35FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A35FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#1A35FF" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-1 text-base">Monthly Orders</h2>
          <p className="text-xs text-gray-400 mb-4">Number of orders per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'Orders']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="orders" fill="#1A35FF" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-base">Recent Orders</h2>
            <Link href="/btgpanel/orders" className="text-xs text-[#1A35FF] font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">No orders yet</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#1A35FF]">
                        <Link href={`/btgpanel/orders/${order.id}`}>{order.orderId}</Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900">{order.customer.name}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{formatBDT(order.total)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor[order.status] || statusColor.pending}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-base">Top Products</h2>
            <Link href="/btgpanel/products" className="text-xs text-[#1A35FF] font-semibold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-400 text-sm">No products yet</div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <span className="text-xs font-bold text-gray-300 w-5">#{idx+1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.soldCount} sold</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatBDT((p.salePrice||p.price)*(p.soldCount||0))}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
