"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { addMessageToFirestore, getStoreSettingsFromFirestore } from '@/lib/firestore';
import { StoreSettings } from '@/types/admin';
import * as fbPixel from '@/lib/facebookPixel';

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    getStoreSettingsFromFirestore().then(res => {
      if (res) setSettings(res);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await addMessageToFirestore({
        customerName: form.name,
        customerEmail: form.email || undefined,
        customerPhone: form.phone,
        subject: form.subject || 'General Inquiry',
        content: form.message,
        isRead: false
      });
      fbPixel.contact();
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 font-medium mb-8">We&apos;re here to help. Reach out to us anytime.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Get in Touch</h2>
          <div className="space-y-4 text-sm mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">WhatsApp Support</p>
              <p className="font-semibold text-gray-900">{settings?.whatsappNumber || '+880 1700-000000'}</p>
              <p className="text-gray-500 text-xs mt-0.5">Available every day, 9 AM – 10 PM</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{settings?.supportEmail || 'support@bluatalkgoods.com'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
              <p className="font-semibold text-gray-900">{settings?.businessAddress || 'Dhaka, Bangladesh'}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${(settings?.whatsappNumber || '8801700000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello! I need help with my order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => fbPixel.contact()}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-md transition-colors shadow-sm text-sm"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Send a Message</h2>
          
          {success ? (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded-md p-4 flex flex-col items-center justify-center text-center space-y-2 mb-4 h-full">
              <CheckCircle size={32} className="text-green-500" />
              <p className="font-bold text-sm">Message Sent Successfully!</p>
              <p className="text-xs text-green-600">We&apos;ll get back to you shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-4 text-xs font-bold text-green-700 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Name *</label>
                <input type="text" id="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Your full name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Phone *</label>
                  <input type="tel" id="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="Your phone" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</label>
                  <input type="email" id="email" value={form.email} onChange={handleChange} className="input-field" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Subject</label>
                <input type="text" id="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="What is this regarding?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Message *</label>
                <textarea id="message" value={form.message} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="How can we help you?" required></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
