"use client";

import { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { getStoreSettingsFromFirestore, updateStoreSettingsInFirestore } from '@/lib/firestore';
import { StoreSettings } from '@/types/admin';

const tabs = ['General','Social Media','SEO','Payment & Shipping','Advanced'];

function Field({ label, type='text', value, onChange, placeholder='' }: { label:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
      {type === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" />
      }
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label:string; description?:string; checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<StoreSettings>({
    websiteName: 'BluaTalk Goods',
    contactNumber: '+880 1700-000000',
    whatsappNumber: '8801700000000',
    supportEmail: 'support@bluatalkgoods.com',
    businessAddress: 'Dhaka, Bangladesh',
    announcementBar: 'Free shipping on orders above ৳1000!',
    announcementEnabled: false,
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    messengerUrl: '',
    seoTitle: 'BluaTalk Goods - Premium Products',
    seoDescription: 'Shop premium products in Bangladesh.',
    googleAnalyticsId: '',
    facebookPixelId: '',
    currency: 'BDT',
    shippingInsideDhaka: 70,
    shippingDhakaSubArea: 100,
    shippingOutsideDhaka: 120,
    freeShippingLimit: 1000,
    codEnabled: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await getStoreSettingsFromFirestore();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error loading store settings from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateStoreSettingsInFirestore(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving store settings to Firestore:", err);
      alert("Failed to save settings to Firestore");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-gray-900">Store Settings</h1>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Store Settings</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold">
          <Check size={16}/> Store settings saved in Firestore!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${activeTab===t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-6 space-y-5">
        {activeTab === 'General' && (
          <>
            <Field label="Website Name" value={settings.websiteName} onChange={v => setSettings(p=>({...p,websiteName:v}))} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Number" value={settings.contactNumber} onChange={v => setSettings(p=>({...p,contactNumber:v}))} placeholder="+880..." />
              <Field label="WhatsApp Number" value={settings.whatsappNumber} onChange={v => setSettings(p=>({...p,whatsappNumber:v}))} placeholder="+880..." />
            </div>
            <Field label="Support Email" type="email" value={settings.supportEmail} onChange={v => setSettings(p=>({...p,supportEmail:v}))} />
            <Field label="Business Address" type="textarea" value={settings.businessAddress} onChange={v => setSettings(p=>({...p,businessAddress:v}))} />
            <Field label="Announcement Bar Text" value={settings.announcementBar || ''} onChange={v => setSettings(p=>({...p,announcementBar:v}))} placeholder="e.g. Free shipping on orders above ৳1000!" />
            <Toggle label="Enable Announcement Bar" checked={settings.announcementEnabled} onChange={v => setSettings(p=>({...p,announcementEnabled:v}))} />
          </>
        )}

        {activeTab === 'Social Media' && (
          <>
            {[['Facebook URL','facebookUrl','https://facebook.com/...'],['Instagram URL','instagramUrl','https://instagram.com/...'],['TikTok URL','tiktokUrl','https://tiktok.com/...'],['YouTube URL','youtubeUrl','https://youtube.com/...'],['Messenger URL','messengerUrl','https://m.me/...']].map(([label,key,placeholder]) => (
              <Field key={key} label={label} value={(settings as any)[key] || ''} onChange={v => setSettings(p=>({...p,[key]:v}))} placeholder={placeholder} />
            ))}
          </>
        )}

        {activeTab === 'SEO' && (
          <>
            <Field label="SEO Title" value={settings.seoTitle || ''} onChange={v => setSettings(p=>({...p,seoTitle:v}))} />
            <Field label="SEO Description" type="textarea" value={settings.seoDescription || ''} onChange={v => setSettings(p=>({...p,seoDescription:v}))} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Google Analytics ID" value={settings.googleAnalyticsId || ''} onChange={v => setSettings(p=>({...p,googleAnalyticsId:v}))} placeholder="G-XXXXXXXXXX" />
              <Field label="Facebook Pixel ID" value={settings.facebookPixelId || ''} onChange={v => setSettings(p=>({...p,facebookPixelId:v}))} placeholder="XXXXXXXXXX" />
            </div>
            <Field label="Footer Copyright Text" value={settings.footerCopyright || ''} onChange={v => setSettings(p=>({...p,footerCopyright:v}))} />
          </>
        )}

        {activeTab === 'Payment & Shipping' && (
          <>
            <Toggle label="Cash on Delivery (COD)" description="Allow customers to pay on delivery" checked={settings.codEnabled} onChange={v => setSettings(p=>({...p,codEnabled:v}))} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Field label="Inside Dhaka (BDT)" type="number" value={String(settings.shippingInsideDhaka || 70)} onChange={v => setSettings(p=>({...p,shippingInsideDhaka:parseFloat(v)||0}))} />
              <Field label="Dhaka Sub Area (BDT)" type="number" value={String(settings.shippingDhakaSubArea || 100)} onChange={v => setSettings(p=>({...p,shippingDhakaSubArea:parseFloat(v)||0}))} />
              <Field label="Outside Dhaka (BDT)" type="number" value={String(settings.shippingOutsideDhaka || 120)} onChange={v => setSettings(p=>({...p,shippingOutsideDhaka:parseFloat(v)||0}))} />
              <Field label="Free Shipping Above (BDT)" type="number" value={String(settings.freeShippingLimit || '')} onChange={v => setSettings(p=>({...p,freeShippingLimit:parseFloat(v)||0}))} placeholder="e.g. 1000" />
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Currency</label>
                <select value={settings.currency} onChange={e => setSettings(p=>({...p,currency:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Advanced' && (
          <>
            <Toggle
              label="Maintenance Mode"
              description="⚠️ Warning: This will show a maintenance page to all visitors"
              checked={settings.maintenanceMode}
              onChange={v => setSettings(p=>({...p,maintenanceMode:v}))}
            />
          </>
        )}

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm mt-4"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          <Save size={16}/> {saving ? 'Saving to Firestore...' : 'Save Settings to Firestore'}
        </button>
      </div>
    </div>
  );
}
