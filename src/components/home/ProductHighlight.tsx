import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ProductHighlight() {
  const benefits = [
    "Premium Quality Materials",
    "100% Authentic Products",
    "Fast Cash on Delivery",
    "Easy Return Policy"
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              {/* Fallback to gradient if no image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="text-xl font-medium">Highlight Product Image</span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 font-semibold text-sm">
              Featured Collection
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Experience Unmatched Quality
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our featured collection brings you the best in class products, 
              carefully selected for durability, style, and everyday use. 
              Elevate your lifestyle with BluaTalk Goods.
            </p>
            
            <ul className="space-y-4 pt-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-6">
              <Link href="/products" className="btn-primary inline-flex">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
