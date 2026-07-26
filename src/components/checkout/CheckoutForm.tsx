"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "Dhaka",
    note: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate order placement
    setTimeout(() => {
      clearCart();
      router.push("/order-success");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            required
            value={formData.fullName}
            onChange={handleChange}
            className="input-field" 
            placeholder="John Doe" 
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            required
            value={formData.phone}
            onChange={handleChange}
            className="input-field" 
            placeholder="01XXXXXXXXX" 
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Detailed Address *</label>
        <textarea 
          id="address" 
          name="address" 
          required
          rows={3}
          value={formData.address}
          onChange={handleChange}
          className="input-field resize-none" 
          placeholder="House/Flat No, Road No, Area"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City/District *</label>
        <select 
          id="city" 
          name="city" 
          required
          value={formData.city}
          onChange={handleChange}
          className="input-field"
        >
          <option value="Dhaka">Dhaka (৳60)</option>
          <option value="Outside Dhaka">Outside Dhaka (৳120)</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Order Note (Optional)</label>
        <input 
          type="text" 
          id="note" 
          name="note" 
          value={formData.note}
          onChange={handleChange}
          className="input-field" 
          placeholder="Special instructions for delivery" 
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
        <p className="font-semibold mb-1">Cash on Delivery</p>
        <p>You will pay the delivery person when you receive the product. No advance payment required for orders inside Dhaka.</p>
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting || items.length === 0}
        className="btn-primary w-full py-4 text-lg"
      >
        {isSubmitting ? "Processing..." : "Confirm Order"}
      </button>
    </form>
  );
}
