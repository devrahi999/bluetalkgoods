"use client";

import { Plus, LogIn, LogOut, Pencil, Trash2, Eye } from 'lucide-react';

const mockLogs = [
  { id:'l1', adminName:'Admin', action:'update', resource:'Order #BTG-A1B2C3D', details:'Status changed to Delivered', timestamp:Date.now()-3600000 },
  { id:'l2', adminName:'Admin', action:'create', resource:'Product: Smart Watch', details:'New product added to store', timestamp:Date.now()-7200000 },
  { id:'l3', adminName:'Admin', action:'delete', resource:'Review #r3', details:'Customer review removed', timestamp:Date.now()-86400000 },
  { id:'l4', adminName:'Admin', action:'login', resource:'Admin Panel', details:'Logged in successfully', timestamp:Date.now()-172800000 },
  { id:'l5', adminName:'Admin', action:'update', resource:'Store Settings', details:'Shipping charge updated to ৳80', timestamp:Date.now()-259200000 },
  { id:'l6', adminName:'Admin', action:'logout', resource:'Admin Panel', details:'Session ended', timestamp:Date.now()-345600000 },
];

const actionConfig: Record<string, { icon:React.ReactNode; color:string; bg:string }> = {
  create: { icon:<Plus size={14}/>, color:'text-green-600', bg:'bg-green-50' },
  update: { icon:<Pencil size={14}/>, color:'text-blue-600', bg:'bg-blue-50' },
  delete: { icon:<Trash2 size={14}/>, color:'text-red-600', bg:'bg-red-50' },
  login:  { icon:<LogIn size={14}/>, color:'text-purple-600', bg:'bg-purple-50' },
  logout: { icon:<LogOut size={14}/>, color:'text-gray-600', bg:'bg-gray-50' },
  view:   { icon:<Eye size={14}/>, color:'text-amber-600', bg:'bg-amber-50' },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Logs</h1>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              {['Action','Resource','Details','Admin','Time'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {mockLogs.map(log => {
                const cfg = actionConfig[log.action] || actionConfig.view;
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}{log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{log.resource}</td>
                    <td className="px-6 py-4 text-gray-500">{log.details}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1A35FF] text-white flex items-center justify-center text-xs font-bold">A</div>
                        <span className="font-medium text-gray-700">{log.adminName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(log.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
