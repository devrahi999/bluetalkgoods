"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">All Products</h1>
        <p className="text-gray-600 text-sm font-medium mt-1">
          Browse our complete collection of high quality goods
          {!loading && <span className="ml-2 text-gray-400">({products.length} products)</span>}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
          {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
            <div key={n} className="bg-white rounded-md h-72 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-md p-12 text-center text-gray-500 border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-300" />
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
