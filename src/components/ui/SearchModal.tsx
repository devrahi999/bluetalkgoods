"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getProducts } from '@/lib/firestore';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as fbPixel from '@/lib/facebookPixel';

// Fuzzy search: returns score based on how well query matches product title/category/tags
function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  return products
    .map((product) => {
      const searchable = [
        product.title,
        product.category || '',
        product.shortDescription || '',
        ...(product.tags || []),
      ].join(' ').toLowerCase();

      let score = 0;
      // Exact match boost
      if (searchable.includes(q)) score += 10;
      // Each word match
      words.forEach(word => {
        if (searchable.includes(word)) score += 3;
      });
      // Partial character match (for partial typing)
      for (let i = 0; i < q.length - 1; i++) {
        if (searchable.includes(q.slice(i, i + 2))) score += 1;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Error loading products for SearchModal:", err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    setResults(searchProducts(allProducts, query));
    
    if (query.trim().length > 2) {
      const timer = setTimeout(() => {
        fbPixel.search({ search_string: query.trim() });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [query, allProducts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-900 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
        aria-label="Open search"
      >
        <Search size={22} />
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search size={20} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-gray-900 text-base outline-none placeholder-gray-400 bg-transparent"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={18} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors ml-1 border border-gray-200 rounded px-2 py-0.5 text-xs font-medium hidden sm:block">
                  Esc
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="py-12 text-center text-gray-500 text-sm font-medium">
                    No products found for &quot;{query}&quot;
                  </div>
                )}
                {!query && (
                  <div className="py-10 text-center text-gray-400 text-sm font-medium">
                    Start typing to search products...
                  </div>
                )}
                {results.length > 0 && (
                  <ul className="py-2">
                    {results.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => { setIsOpen(false); setQuery(''); }}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            {product.images?.[0] && (
                              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{product.category}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-primary-600">
                              {formatPrice(product.salePrice || product.price)}
                            </p>
                            {product.salePrice && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
