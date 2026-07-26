export interface Product {
  id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  discountPercent?: number;
  shortDescription?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  basePrice?: number;
  isFreeDelivery?: boolean;
  stock?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  items: CartItem[];
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: number;
}
