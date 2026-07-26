"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getMessagesFromFirestore, markMessageReadInFirestore, replyMessageInFirestore, deleteMessageFromFirestore } from '@/lib/firestore';
import { AdminMessage } from '@/types/admin';

function formatDate(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short' });
}

function initials(name: string) {
  return name ? name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMessagesFromFirestore();
        setMessages(data.sort((a,b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'read') return m.isRead;
    return true;
  });
  const unreadCount = messages.filter(m => !m.isRead).length;

  const toggleExpand = async (id: string, isRead: boolean) => {
    setExpandedId(prev => prev === id ? null : id);
    if (!isRead && expandedId !== id) {
      // Mark as read when expanding
      await markRead(id);
    }
  };

  const markRead = async (id: string) => {
    try {
      await markMessageReadInFirestore(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMsg = async (id: string) => {
    try {
      await deleteMessageFromFirestore(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const saveReply = async (id: string) => {
    try {
      await replyMessageInFirestore(id, replyText);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, reply: replyText, isRead: true } : m));
      setReplyId(null); 
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { key:'all', label:'All', count:messages.length },
    { key:'unread', label:'Unread', count:unreadCount },
    { key:'read', label:'Read', count:messages.length - unreadCount },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Support Messages</h1>
        {unreadCount > 0 && <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread messages</p>}
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${filter===t.key ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500'}`}>
            {t.label} <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter===t.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {filtered.map(msg => {
          const isExpanded = expandedId === msg.id;
          return (
            <div key={msg.id} className={`transition-all ${!msg.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
              
              {/* Header (Click to expand) */}
              <div 
                onClick={() => toggleExpand(msg.id, msg.isRead)}
                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${!msg.isRead ? 'bg-primary-500' : 'bg-gray-300'} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {initials(msg.customerName)}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${!msg.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{msg.customerName}</p>
                      {!msg.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
                      {msg.reply && <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold rounded-full">Replied</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-md mt-0.5"><span className="font-semibold">{msg.subject}:</span> {msg.content}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 pl-[72px]">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                    <div className="flex gap-6 mb-3 pb-3 border-b border-gray-200 text-xs text-gray-600">
                      <p><span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Phone</span>{msg.customerPhone || 'N/A'}</p>
                      <p><span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Email</span>{msg.customerEmail || 'N/A'}</p>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.reply && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs font-bold text-primary-500 mb-1 uppercase tracking-wider">Your Reply</p>
                      <p className="text-sm text-gray-700">{msg.reply}</p>
                    </div>
                  )}

                  {replyId === msg.id ? (
                    <div className="mb-4 space-y-2">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Write your reply/note..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => saveReply(msg.id)} className="flex items-center gap-1.5 bg-primary-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"><Check size={13}/>Save Note</button>
                        <button onClick={() => setReplyId(null)} className="bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => { setReplyId(msg.id); setReplyText(msg.reply || ''); }} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary-600 transition-colors">
                        <MessageSquare size={13}/> {msg.reply ? 'Edit Note' : 'Add Note'}
                      </button>
                      {msg.customerPhone && (
                        <a href={`https://wa.me/${msg.customerPhone.replace(/^0/, '880')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                          <ExternalLink size={13}/> Reply on WhatsApp
                        </a>
                      )}
                      <button onClick={() => deleteMsg(msg.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors ml-auto">
                        <Trash2 size={13}/> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No messages found
          </div>
        )}
      </div>
    </div>
  );
}
