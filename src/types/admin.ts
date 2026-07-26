// Admin Panel Types

export interface AdminUser {
  id: string;
  adminId: string;
  adminPass: string;
  role: string;
  isActive: boolean;
  isMainAdmin: boolean;
  allowedPages: string[];
  createdAt: number;
}

export interface AdminStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalReviews: number;
  unreadMessages: number;
  netProfit: number;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    note?: string;
  };
  items: {
    productId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  timeline: { status: string; note?: string; timestamp: number }[];
  createdAt: number;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  salePrice?: number;
  stock?: number;
  rating?: number;
  soldCount?: number;
  shortDescription?: string;
  description?: string;
  benefits?: string[];
  specifications?: { key: string; value: string }[];
  faq?: { question: string; answer: string }[];
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  basePrice?: number;
  isFreeDelivery?: boolean;
  discountPercent?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: number;
  createdAt: number;
}

export interface AdminReview {
  id: string;
  productId: string;
  productTitle: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  isPublished: boolean;
  createdAt: number;
}

export interface AdminMessage {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  subject: string;
  content: string;
  isRead: boolean;
  reply?: string;
  createdAt: number;
}

export interface StoreSettings {
  websiteName: string;
  contactNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  businessAddress: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  messengerUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  footerCopyright?: string;
  currency: string;
  shippingInsideDhaka: number;
  shippingDhakaSubArea: number;
  shippingOutsideDhaka: number;
  freeShippingLimit?: number;
  codEnabled: boolean;
  maintenanceMode: boolean;
  announcementBar?: string;
  announcementEnabled: boolean;
}

export interface AdminLog {
  id: string;
  adminName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource: string;
  details: string;
  timestamp: number;
}
