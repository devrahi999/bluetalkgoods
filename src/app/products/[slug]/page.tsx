"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap, Star } from "lucide-react";
import { ProductImages } from "@/components/product/ProductImages";
import { ProductTabs } from "@/components/product/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { getProductBySlug, getProducts } from "@/lib/firestore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, cn } from "@/lib/utils";
import { Product } from "@/types";
import React from 'react';
import * as fbPixel from '@/lib/facebookPixel';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist } = useWishlistStore();

  useEffect(() => {
    async function loadData() {
      try {
        const found = await getProductBySlug(slug);
        setProduct(found);
        if (found) {
          fbPixel.viewContent({
            content_name: found.title,
            content_ids: [found.id],
            content_type: 'product',
            value: found.salePrice || found.price,
            currency: 'BDT'
          });
        }
        const list = await getProducts();
        setAllProducts(list);
      } catch (err) {
        console.error("Error loading product detail from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const isWishlisted = product ? wishlistItems.some(item => item.id === product.id) : false;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      fbPixel.addToCart({
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: (product.salePrice || product.price) * quantity,
        currency: 'BDT',
        num_items: quantity
      });
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      fbPixel.addToCart({
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: (product.salePrice || product.price) * quantity,
        currency: 'BDT',
        num_items: quantity
      });
      router.push("/checkout");
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      removeWishlist(product.id);
    } else {
      addWishlist(product);
      fbPixel.addToWishlist({
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: product.salePrice || product.price,
        currency: 'BDT'
      });
    }
  };

  if (loading) {
    return (
      <div className="container-custom pt-8 pb-12">
        <div className="bg-white rounded-md p-8 border border-gray-200 h-96 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-20 text-center bg-white text-gray-900 font-medium">
        Product not found
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="container-custom pt-8">
        
        {/* Main Product Area */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left: Images */}
            <div>
              <ProductImages images={product.images || []} alt={product.title} />
            </div>
            
            {/* Right: Info */}
            <div className="flex flex-col">
              {product.category && (
                <span className="text-primary-600 font-semibold text-xs mb-2 uppercase tracking-wider">
                  {product.category}
                </span>
              )}
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium text-gray-900 ml-1">{(product.rating || 5).toFixed(1)}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600 font-medium">{product.reviewCount || 0} Ratings</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600 font-medium">{product.soldCount || 0} Sold</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-primary-600">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="text-base text-gray-500 line-through mb-1">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-gray-700 mb-8 text-sm md:text-base leading-relaxed">
                {product.shortDescription || product.description}
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-semibold text-gray-900 w-16">Quantity:</span>
                <QuantitySelector quantity={quantity} onChange={setQuantity} max={10} />
              </div>
              
              {/* Buttons */}
              <div className="flex items-center gap-3 mt-auto">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:text-primary-700 font-semibold py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 border-2 border-primary-500 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Zap size={18} />
                  <span>Buy Now</span>
                </button>
                
                <button 
                  onClick={toggleWishlist}
                  className={cn(
                    "w-12 h-[52px] border-2 rounded-md flex items-center justify-center transition-colors flex-shrink-0",
                    isWishlisted ? "border-primary-500 text-primary-500 bg-primary-50" : "border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                  title="Wishlist"
                >
                  <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description & Reviews Tabs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProductTabs 
              productId={product.id}
              productTitle={product.title}
              description={product.description || ""} 
              rating={product.rating || 5} 
              reviewCount={product.reviewCount || 0} 
            />
          </div>
          
          <div className="lg:col-span-1 mt-8">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Why Buy From Us?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Cash on Delivery</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Pay when you receive the product</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Fast Shipping</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Delivery within 24-72 hours</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-8">
          <RelatedProducts products={allProducts.filter(p => p.id !== product.id).slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
