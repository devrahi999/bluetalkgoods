import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 divide-y divide-gray-50">
        {[
          { title:'New Order Received', body:'Order BTG-A1B2C3D placed by Rahim Uddin', time:'5 min ago', unread:true },
          { title:'Low Stock Alert', body:'Smart Fitness Watch has only 8 units left', time:'1 hour ago', unread:true },
          { title:'New Message', body:'Karim Ahmed sent a support message', time:'2 hours ago', unread:true },
        ].map((n, i) => (
          <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.unread ? 'bg-[#1A35FF]/10 text-[#1A35FF]' : 'bg-gray-100 text-gray-400'}`}>
              <Bell size={18}/>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] text-gray-400">{n.time}</p>
              {n.unread && <span className="w-2 h-2 bg-[#1A35FF] rounded-full inline-block mt-1"></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
