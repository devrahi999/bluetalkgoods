"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProductInFirestore } from '@/lib/firestore';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: '', slug: '', tags: '', price: '', salePrice: '', basePrice: '',
    discountPercent: '', stock: '', shortDescription: '', description: '',
    images: [] as string[], imageUrlsText: '', seoTitle: '', seoDescription: '',
    isFeatured: false, isActive: true, isFreeDelivery: false, soldCount: '0', rating: '5.0', reviewCount: '0'
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const product = await getProductById(id);
        if (product) {
          setForm({
            title: product.title || '',
            slug: product.slug || '',
            tags: product.tags ? product.tags.join(', ') : '',
            price: product.price?.toString() || '',
            salePrice: product.salePrice?.toString() || '',
            basePrice: product.basePrice?.toString() || '',
            discountPercent: product.discountPercent?.toString() || '',
            stock: product.stock?.toString() || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            images: product.images || [],
            imageUrlsText: '',
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
            isFeatured: product.isFeatured || false,
            isActive: product.isActive !== false,
            isFreeDelivery: product.isFreeDelivery || false,
            soldCount: product.soldCount?.toString() || '0',
            rating: product.rating?.toString() || '5.0',
            reviewCount: product.reviewCount?.toString() || '0'
          });
        } else {
          alert("Product not found");
          router.push('/btgpanel/products');
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setFetching(false);
      }
    }
    loadProduct();
  }, [id, router]);

  const set = (key: string, val: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'title') next.slug = slugify(val as string);
      if (key === 'price' || key === 'salePrice') {
        const p = parseFloat(next.price) || 0;
        const sp = parseFloat(next.salePrice) || 0;
        if (p && sp && sp < p) next.discountPercent = String(Math.round((1 - sp/p)*100));
      }
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image to Cloudinary');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      alert("Please fill in Title and Price.");
      return;
    }

    try {
      setLoading(true);
      
      const textUrls = form.imageUrlsText.split('\n').map(u => u.trim()).filter(Boolean);
      const finalImages = Array.from(new Set([...form.images, ...textUrls]));

      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        price: parseFloat(form.price) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        basePrice: form.basePrice ? parseFloat(form.basePrice) : undefined,
        discountPercent: form.discountPercent ? parseInt(form.discountPercent) : undefined,
        stock: form.stock ? parseInt(form.stock) : 100,
        shortDescription: form.shortDescription,
        description: form.description,
        images: finalImages.length > 0 ? finalImages : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        isFreeDelivery: form.isFreeDelivery,
        rating: form.rating ? parseFloat(form.rating) : 5.0,
        reviewCount: form.reviewCount ? parseInt(form.reviewCount) : 0,
        soldCount: form.soldCount ? parseInt(form.soldCount) : 0,
      };

      await updateProductInFirestore(id, payload);

      setSaved(true);
      setTimeout(() => router.push('/btgpanel/products'), 1500);
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product in Firestore');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/btgpanel/products" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft size={18}/>
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Edit Product</h1>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle size={18}/> Product updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Product Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Slug</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-blue-100 font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFreeDelivery} onChange={e => set('isFreeDelivery', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-700">Free Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Base Price</label>
                <input type="number" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Price (BDT) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Sale Price</label>
                <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Discount %</label>
                <input type="number" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">Manual Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Sold Count</label>
                <input type="number" value={form.soldCount} onChange={e => set('soldCount', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Star Rating (Max 5)</label>
                <input type="number" step="0.1" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Review Count</label>
                <input type="number" value={form.reviewCount} onChange={e => set('reviewCount', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Short Description</label>
                <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">SEO Title</label>
                <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">SEO Description</label>
                <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Images + Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-gray-200 hover:border-primary-500 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 relative bg-gray-50">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={uploadingImage}
              />
              <div className="flex flex-col items-center justify-center">
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-primary-500 mb-2" />
                )}
                <p className="text-xs font-bold text-gray-800">
                  {uploadingImage ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop'}
                </p>
              </div>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Or Paste Image URLs (one per line)</label>
              <textarea 
                value={form.imageUrlsText} 
                onChange={e => set('imageUrlsText', e.target.value)} 
                rows={3} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none font-mono text-xs" 
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6 space-y-3">
            <button 
              type="submit" 
              disabled={loading || uploadingImage}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Update Product'}
            </button>
            <Link href="/btgpanel/products" className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
