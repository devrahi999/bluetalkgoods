"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
}

export function QuantitySelector({ quantity, onChange, max = 10 }: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md bg-white">
      <button
        onClick={decrease}
        disabled={quantity <= 1}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white rounded-l-md transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      
      <div className="w-12 h-10 flex items-center justify-center border-x border-gray-300 text-gray-900 font-medium text-sm">
        {quantity}
      </div>
      
      <button
        onClick={increase}
        disabled={quantity >= max}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white rounded-r-md transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
