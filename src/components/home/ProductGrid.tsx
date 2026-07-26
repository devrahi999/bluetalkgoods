import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";

interface ProductGridProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export function ProductGrid({ title, products, viewAllLink }: ProductGridProps) {
  return (
    <section className="py-4 md:py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
            <p className="text-sm text-gray-500 font-medium">Explore our premium collection</p>
          </div>
          {viewAllLink && (
            <a href={viewAllLink} className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </a>
          )}
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
