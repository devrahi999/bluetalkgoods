"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Loader2, Link as LinkIcon, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { mockAdminProducts } from '@/lib/adminData';
import { getBannersFromFirestore, updateBannersInFirestore } from '@/lib/firestore';
import { AdminBanner } from '@/types/admin';

const defaultBanners: AdminBanner[] = [
  { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070' },
  { url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070' },
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070' },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newUrl, setNewUrl] = useState('');
  const [newLink, setNewLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [featured, setFeatured] = useState<string[]>(mockAdminProducts.filter(p=>p.isFeatured).map(p=>p.id));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadBanners() {
      try {
        const firestoreBanners = await getBannersFromFirestore();
        if (firestoreBanners.length > 0) {
          setBanners(firestoreBanners);
        } else {
          setBanners(defaultBanners);
        }
      } catch (err) {
        console.error("Failed to load banners:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addBanner = () => {
    if (newUrl.trim()) { 
      setBanners(prev => [...prev, { url: newUrl.trim(), link: newLink.trim() || undefined }]);
      setNewUrl('');
      setNewLink('');
    }
  };

  const removeBanner = (idx: number) => setBanners(prev => prev.filter((_,i)=>i!==idx));
  
  const toggleFeatured = (id: string) => setFeatured(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  
  const handleSave = async () => { 
    try {
      setSaving(true);
      await updateBannersInFirestore(banners);
      setSaved(true); 
      setTimeout(()=>setSaved(false), 3000); 
    } catch (err) {
      console.error("Failed to save banners:", err);
      alert("Failed to save banners.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#1A35FF] w-8 h-8" />
      </div>
    );
  }

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
          {banners.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No banners added yet.</p>
          ) : (
            banners.map((banner, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.url} alt={`Banner ${idx+1}`} className="w-full sm:w-40 h-24 sm:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">Banner {idx+1}</p>
                  <p className="text-xs text-gray-600 truncate font-mono mb-2 bg-white px-2 py-1 rounded border border-gray-100" title={banner.url}>{banner.url}</p>
                  {banner.link ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#1A35FF] font-medium bg-blue-50 px-2 py-1 rounded w-max">
                      <LinkIcon size={12} /> {banner.link}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No link attached</div>
                  )}
                </div>
                
                <button onClick={() => removeBanner(idx)} className="p-2.5 rounded-xl bg-white border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                  <Trash2 size={16}/>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Banner Form */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Add New Banner</h3>
          
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">1. Image Source</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={newUrl} 
                  onChange={e=>setNewUrl(e.target.value)} 
                  placeholder="Paste image URL here..." 
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
                />
                <div className="flex items-center justify-center font-bold text-gray-400 text-sm">OR</div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-gray-200 ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'} whitespace-nowrap`}>
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    {uploading ? 'Uploading...' : 'Upload from Device'}
                  </div>
                </div>
              </div>
            </div>

            {newUrl && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">Image Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newUrl} alt="Preview" className="h-24 rounded-lg border border-gray-200 object-cover" />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">2. Banner Link (Optional)</label>
              <input 
                type="text" 
                value={newLink} 
                onChange={e=>setNewLink(e.target.value)} 
                placeholder="e.g. /products/new-arrival or https://example.com" 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
              />
            </div>
            
            <button 
              onClick={addBanner} 
              disabled={!newUrl.trim() || uploading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#1A35FF] hover:bg-[#0018e6] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16}/> Add to Banner List
            </button>
          </div>
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

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#1A35FF] hover:bg-[#0018e6] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
