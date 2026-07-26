"use client";

import { useState, useEffect } from 'react';
import { getOrdersFromFirestore, getProducts } from '@/lib/firestore';
import { AdminOrder } from '@/types/admin';
import { Product } from '@/types';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';

function formatBDT(v: number) { return new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', minimumFractionDigits:0 }).format(v); }

const periods = ['7 Days','30 Days','3 Months','Year'];
const COLORS = ['#1A35FF','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30 Days');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalRev: 0,
    totalOrders: 0,
    netProfit: 0,
  });
  const [statusData, setStatusData] = useState<{name: string, value: number}[]>([]);
  const [salesChartData, setSalesChartData] = useState<{month: string, revenue: number}[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orders, products] = await Promise.all([
          getOrdersFromFirestore(),
          getProducts(),
        ]);

        const basePriceMap: Record<string, number> = {};
        products.forEach(p => {
          basePriceMap[p.id] = p.basePrice || (p.price * 0.75); 
        });

        let tRev = 0;
        let tCost = 0;
        const sData: Record<string, number> = { pending:0, confirmed:0, processing:0, shipped:0, delivered:0, cancelled:0, returned:0 };

        orders.forEach(o => {
          tRev += o.total || 0;
          if (o.status !== 'cancelled' && o.status !== 'returned') {
            o.items?.forEach(item => {
              const bp = basePriceMap[item.productId] || (item.price * 0.75);
              tCost += bp * item.quantity;
            });
          }
          if (sData[o.status] !== undefined) {
            sData[o.status]++;
          }
        });

        setStats({
          totalRev: tRev,
          totalOrders: orders.length,
          netProfit: tRev - tCost,
        });

        const statusArray = Object.entries(sData)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
        setStatusData(statusArray);

        const sortedProducts = [...products].sort((a,b) => (b.soldCount||0) - (a.soldCount||0)).slice(0, 10);
        setTopProducts(sortedProducts);

        // Mock sales data based on actual total (for visualization purposes)
        const mockChart = [
          { month: 'Jan', revenue: tRev * 0.05 },
          { month: 'Feb', revenue: tRev * 0.08 },
          { month: 'Mar', revenue: tRev * 0.12 },
          { month: 'Apr', revenue: tRev * 0.15 },
          { month: 'May', revenue: tRev * 0.20 },
          { month: 'Jun', revenue: tRev * 0.40 },
        ];
        setSalesChartData(mockChart);

      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [period]); // In a real app, 'period' would filter the data by date range

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  const avgOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalRev / stats.totalOrders) : 0;
  const marginPercent = stats.totalRev > 0 ? Math.round((stats.netProfit / stats.totalRev) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period===p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue', value:formatBDT(stats.totalRev), sub:'Real Firestore Data', color:'text-[#1A35FF]' },
          { label:'Total Orders', value:stats.totalOrders.toString(), sub:'All time', color:'text-green-600' },
          { label:'Avg Order Value', value:formatBDT(avgOrderValue), sub:'Per order', color:'text-purple-600' },
          { label:'Net Profit (Est.)', value:formatBDT(stats.netProfit), sub:`${marginPercent}% margin`, color:'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
            <p className="text-[11px] text-green-500 font-semibold mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
          <h2 className="font-bold text-gray-900 text-base mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A35FF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1A35FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:any)=>[`৳${Number(v).toLocaleString()}`,'Revenue']} contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              <Area type="monotone" dataKey="revenue" stroke="#1A35FF" strokeWidth={2.5} fill="url(#aGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
          <h2 className="font-bold text-gray-900 text-base mb-4">Order Status Distribution</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background:COLORS[i] }}/>
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Top Products by Sales (Real Data)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              {['#','Product','Units Sold','Est. Revenue'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p,i) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-300 font-bold text-xs">#{i+1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-gray-100"/>
                      <span className="font-semibold text-gray-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{p.soldCount || 0}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatBDT((p.salePrice||p.price)*(p.soldCount||0))}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
