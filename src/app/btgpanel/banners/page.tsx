"use client";

import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { mockAdminProducts } from '@/lib/adminData';

const defaultBanners = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
];

export default function BannersPage() {
  const [banners, setBanners] = useState(defaultBanners);
  const [newUrl, setNewUrl] = useState('');
  const [featured, setFeatured] = useState<string[]>(mockAdminProducts.filter(p=>p.isFeatured).map(p=>p.id));
  const [saved, setSaved] = useState(false);

  const addBanner = () => {
    if (newUrl.trim()) { setBanners(prev => [...prev, newUrl.trim()]); setNewUrl(''); }
  };
  const removeBanner = (idx: number) => setBanners(prev => prev.filter((_,i)=>i!==idx));
  const toggleFeatured = (id: string) => setFeatured(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 3000); };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Banner Manager</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold">
          <Check size={16}/> Changes saved!
        </div>
      )}

      {/* Hero Banners */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">Homepage Hero Banners</h2>
        <div className="space-y-4 mb-6">
          {banners.map((url, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Banner ${idx+1}`} className="w-32 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-1">Banner {idx+1}</p>
                <p className="text-xs text-gray-600 truncate font-mono">{url}</p>
              </div>
              <button onClick={() => removeBanner(idx)} className="p-2 rounded-xl bg-white border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0">
                <Trash2 size={15}/>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input type="text" value={newUrl} onChange={e=>setNewUrl(e.target.value)} placeholder="Paste image URL here..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
          <button onClick={addBanner} className="flex items-center gap-2 bg-[#1A35FF] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0">
            <Plus size={16}/> Add Banner
          </button>
        </div>
      </div>

      {/* Featured Products on Homepage */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-2">Featured Products on Homepage</h2>
        <p className="text-sm text-gray-400 mb-5">Select products to display in the featured section on the homepage</p>

        <div className="space-y-3 mb-6">
          {mockAdminProducts.map(p => (
            <label key={p.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-blue-200 transition-colors">
              <input type="checkbox" checked={featured.includes(p.id)} onChange={()=>toggleFeatured(p.id)} className="w-4 h-4 rounded border-gray-300 text-[#1A35FF]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images?.[0]} alt={p.title} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                <p className="text-xs text-gray-400">{p.category} · ৳{(p.salePrice||p.price).toLocaleString()}</p>
              </div>
            </label>
          ))}
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 bg-[#1A35FF] hover:bg-[#0018e6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          <Check size={16}/> Save Changes
        </button>
      </div>
    </div>
  );
}
