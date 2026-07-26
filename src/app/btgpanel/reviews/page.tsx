"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Check, X, Eye, EyeOff, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getReviewsFromFirestore, toggleReviewPublishedInFirestore, replyReviewInFirestore, deleteReviewFromFirestore } from '@/lib/firestore';
import { AdminReview } from '@/types/admin';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' });
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getReviewsFromFirestore();
        setReviews(data.sort((a,b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = reviews.filter(r => {
    if (filter === 'published') return r.isPublished;
    if (filter === 'pending') return !r.isPublished;
    return true;
  });
  const pendingCount = reviews.filter(r => !r.isPublished).length;

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await toggleReviewPublishedInFirestore(id, !currentStatus);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isPublished: !currentStatus } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRev = async (id: string) => {
    try {
      await deleteReviewFromFirestore(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const saveReply = async (id: string) => {
    try {
      await replyReviewInFirestore(id, replyText);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r));
      setReplyId(null); 
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const tabs = [
    { key:'all', label:'All', count:reviews.length },
    { key:'pending', label:'Pending', count:pendingCount },
    { key:'published', label:'Published', count:reviews.length - pendingCount },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Reviews</h1>
        {pendingCount > 0 && <p className="text-sm text-gray-400 mt-0.5">{pendingCount} reviews waiting for approval</p>}
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
        {filtered.map(rev => {
          const isExpanded = expandedId === rev.id;
          return (
            <div key={rev.id} className="transition-all hover:bg-gray-50/30">
              
              {/* Header (Click to expand) */}
              <div 
                onClick={() => toggleExpand(rev.id)}
                className="p-5 flex items-start gap-4 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-900 text-sm">{rev.customerName}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${rev.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {rev.isPublished ? 'Published' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-gray-400 font-medium">{formatDate(rev.createdAt)}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-primary-600 mb-1">{rev.productTitle}</p>
                  <p className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-1'}`}>{rev.comment}</p>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/50">
                  
                  {rev.reply && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 mb-4 mt-2">
                      <p className="text-xs font-bold text-primary-500 mb-1 uppercase tracking-wider">Your Reply</p>
                      <p className="text-sm text-gray-700">{rev.reply}</p>
                    </div>
                  )}

                  {replyId === rev.id ? (
                    <div className="my-4 space-y-2">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Write your reply (public)..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => saveReply(rev.id)} className="flex items-center gap-1.5 bg-primary-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"><Check size={13}/>Send Reply</button>
                        <button onClick={() => setReplyId(null)} className="bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <button onClick={() => togglePublish(rev.id, rev.isPublished)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${rev.isPublished ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
                        {rev.isPublished ? <EyeOff size={13}/> : <Eye size={13}/>}
                        {rev.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => { setReplyId(rev.id); setReplyText(rev.reply || ''); }} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary-600 transition-colors">
                        <MessageSquare size={13}/> {rev.reply ? 'Edit Reply' : 'Reply'}
                      </button>
                      <button onClick={() => deleteRev(rev.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors ml-auto">
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
            No reviews found
          </div>
        )}
      </div>
    </div>
  );
}
