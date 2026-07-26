import { AdminStats, AdminOrder, AdminProduct, AdminCustomer } from '@/types/admin';

// Mock data for admin panel - replace with Firestore in production

export const mockStats: AdminStats = {
  totalRevenue: 485320,
  todayRevenue: 12500,
  monthlyRevenue: 128400,
  totalOrders: 312,
  pendingOrders: 28,
  confirmedOrders: 15,
  processingOrders: 22,
  deliveredOrders: 231,
  cancelledOrders: 12,
  returnedOrders: 4,
  totalCustomers: 198,
  totalProducts: 24,
  lowStockProducts: 5,
  outOfStockProducts: 2,
  totalReviews: 89,
  unreadMessages: 7,
  netProfit: 215400,
};

export const mockOrders: AdminOrder[] = [
  {
    id: 'ord1',
    orderId: 'BTG-A1B2C3D',
    customer: { name: 'Rahim Uddin', phone: '01712345678', whatsapp: '01712345678', address: 'House 12, Road 5, Dhanmondi', city: 'Dhaka' },
    items: [
      { productId: '1', title: 'Wireless Noise-Cancelling Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', price: 2999, quantity: 1 },
    ],
    subtotal: 2999, shipping: 60, total: 3059,
    status: 'pending',
    timeline: [{ status: 'pending', timestamp: Date.now() - 3600000 }],
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'ord2',
    orderId: 'BTG-X7Y8Z9W',
    customer: { name: 'Fatema Begum', phone: '01898765432', whatsapp: '01898765432', address: 'Flat 4B, Gulshan Ave', city: 'Dhaka' },
    items: [
      { productId: '3', title: 'Smart Fitness Watch', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&q=80', price: 1999, quantity: 2 },
    ],
    subtotal: 3998, shipping: 60, total: 4058,
    status: 'delivered',
    timeline: [
      { status: 'pending', timestamp: Date.now() - 86400000 * 3 },
      { status: 'confirmed', timestamp: Date.now() - 86400000 * 2 },
      { status: 'delivered', timestamp: Date.now() - 86400000 },
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'ord3',
    orderId: 'BTG-M3N4O5P',
    customer: { name: 'Karim Ahmed', phone: '01611234567', whatsapp: '01611234567', address: 'Mirpur 10, Block C', city: 'Dhaka' },
    items: [
      { productId: '5', title: 'Stainless Steel Water Bottle', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80', price: 650, quantity: 3 },
    ],
    subtotal: 1950, shipping: 60, total: 2010,
    status: 'processing',
    timeline: [
      { status: 'pending', timestamp: Date.now() - 86400000 },
      { status: 'confirmed', timestamp: Date.now() - 43200000 },
      { status: 'processing', timestamp: Date.now() - 21600000 },
    ],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'ord4',
    orderId: 'BTG-Q6R7S8T',
    customer: { name: 'Nasrin Akter', phone: '01755555555', whatsapp: '01755555555', address: 'Uttara, Sector 7', city: 'Dhaka' },
    items: [
      { productId: '2', title: 'Minimalist Leather Wallet', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80', price: 1200, quantity: 1 },
    ],
    subtotal: 1200, shipping: 60, total: 1260,
    status: 'shipped',
    timeline: [
      { status: 'pending', timestamp: Date.now() - 86400000 * 2 },
      { status: 'confirmed', timestamp: Date.now() - 86400000 * 1.5 },
      { status: 'shipped', timestamp: Date.now() - 43200000 },
    ],
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const mockAdminProducts: AdminProduct[] = [
  {
    id: '1', title: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-noise-cancelling-headphones',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    price: 3500, salePrice: 2999, stock: 50, rating: 4.8, soldCount: 850, category: 'Electronics',
    isFeatured: true, isActive: true, discountPercent: 14, createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: '2', title: 'Minimalist Leather Wallet', slug: 'minimalist-leather-wallet',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
    price: 1200, stock: 120, rating: 4.5, soldCount: 340, category: 'Accessories',
    isFeatured: false, isActive: true, createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: '3', title: 'Smart Fitness Watch', slug: 'smart-fitness-watch',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'],
    price: 2500, salePrice: 1999, stock: 8, rating: 4.2, soldCount: 1200, category: 'Electronics',
    isFeatured: true, isActive: true, discountPercent: 20, createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: '4', title: 'Organic Cotton T-Shirt', slug: 'organic-cotton-t-shirt',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    price: 500, stock: 0, rating: 4.9, soldCount: 890, category: 'Clothing',
    isFeatured: false, isActive: false, createdAt: Date.now() - 86400000 * 10,
  },
];

export const mockAdminCustomers: AdminCustomer[] = [
  { id: 'c1', name: 'Rahim Uddin', phone: '01712345678', address: 'Dhanmondi', city: 'Dhaka', totalOrders: 5, totalSpend: 14250, lastOrderDate: Date.now() - 3600000, createdAt: Date.now() - 86400000 * 60 },
  { id: 'c2', name: 'Fatema Begum', phone: '01898765432', address: 'Gulshan', city: 'Dhaka', totalOrders: 2, totalSpend: 4058, lastOrderDate: Date.now() - 86400000, createdAt: Date.now() - 86400000 * 30 },
  { id: 'c3', name: 'Karim Ahmed', phone: '01611234567', address: 'Mirpur', city: 'Dhaka', totalOrders: 8, totalSpend: 22400, lastOrderDate: Date.now() - 86400000 * 2, createdAt: Date.now() - 86400000 * 90 },
  { id: 'c4', name: 'Nasrin Akter', phone: '01755555555', address: 'Uttara', city: 'Dhaka', totalOrders: 1, totalSpend: 1260, lastOrderDate: Date.now() - 86400000 * 2, createdAt: Date.now() - 86400000 * 5 },
];

export const salesChartData = [
  { month: 'Jan', revenue: 42000, orders: 38 },
  { month: 'Feb', revenue: 58000, orders: 52 },
  { month: 'Mar', revenue: 71000, orders: 65 },
  { month: 'Apr', revenue: 65000, orders: 58 },
  { month: 'May', revenue: 89000, orders: 82 },
  { month: 'Jun', revenue: 95000, orders: 91 },
  { month: 'Jul', revenue: 128400, orders: 118 },
];
