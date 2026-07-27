import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Product } from '../types';
import { AdminOrder, AdminCustomer, AdminReview, AdminMessage, StoreSettings, AdminUser, AdminBanner } from '../types/admin';
import { mockProducts } from './mockData';

// Collection Names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  BANNERS: 'banners',
  SETTINGS: 'settings',
  ADMINS: 'admins',
};

// ==================== ADMIN USERS & AUTH ====================

const ALL_ADMIN_PAGES = [
  'dashboard', 'orders', 'products', 'customers',
  'reviews', 'messages', 'settings', 'banners',
  'analytics', 'logs', 'backup', 'admins'
];

export const getAdminsFromFirestore = async (): Promise<AdminUser[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.ADMINS);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed initial Super Admin if admins collection is empty
      console.log('Seeding initial Super Admin into Firestore...');
      const defaultAdmin: Omit<AdminUser, 'id'> = {
        adminId: 'admin',
        adminPass: 'admin123',
        role: 'Super Admin',
        isActive: true,
        isMainAdmin: true,
        allowedPages: ALL_ADMIN_PAGES,
        createdAt: Date.now(),
      };
      const docRef = await addDoc(colRef, defaultAdmin);
      return [{ id: docRef.id, ...defaultAdmin }];
    }

    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminUser[];
  } catch (error) {
    console.error('Error fetching admins from Firestore:', error);
    return [];
  }
};

export const verifyAdminLoginInFirestore = async (adminId: string, adminPass: string): Promise<AdminUser | null> => {
  try {
    // Check all admins (or trigger seed if empty)
    const admins = await getAdminsFromFirestore();
    const found = admins.find(a => 
      a.adminId.trim().toLowerCase() === adminId.trim().toLowerCase() && 
      a.adminPass === adminPass &&
      a.isActive !== false
    );
    return found || null;
  } catch (error) {
    console.error('Error verifying admin login in Firestore:', error);
    return null;
  }
};

export const createAdminInFirestore = async (adminData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<string> => {
  const colRef = collection(db, COLLECTIONS.ADMINS);
  const docRef = await addDoc(colRef, {
    ...adminData,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateAdminInFirestore = async (id: string, adminData: Partial<AdminUser>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ADMINS, id);
  await updateDoc(docRef, {
    ...adminData,
    updatedAt: Date.now(),
  });
};

export const deleteAdminFromFirestore = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ADMINS, id);
  await deleteDoc(docRef);
};

// ==================== PRODUCTS ====================

export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsCol = collection(db, COLLECTIONS.PRODUCTS);
    const productSnapshot = await getDocs(productsCol);
    
    if (productSnapshot.empty) {
      // Seed initial mock products into Firestore if empty
      console.log('Seeding initial products into Firestore...');
      for (const p of mockProducts) {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, p.id);
        await setDoc(docRef, { ...p, createdAt: Date.now() });
      }
      return mockProducts;
    }

    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    return productList;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return mockProducts;
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product by id:', error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const products = await getProducts();
    const found = products.find(p => p.slug === slug);
    return found || null;
  } catch (error) {
    console.error('Error getting product by slug:', error);
    return null;
  }
};

export const createProductInFirestore = async (productData: Partial<Product>): Promise<string> => {
  const colRef = collection(db, COLLECTIONS.PRODUCTS);
  const docRef = await addDoc(colRef, {
    ...productData,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateProductInFirestore = async (id: string, productData: Partial<Product>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: Date.now(),
  });
};

export const deleteProductFromFirestore = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
};

// ==================== ORDERS ====================

export const createOrderInFirestore = async (orderData: Omit<AdminOrder, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    const docRef = await addDoc(colRef, {
      ...orderData,
      createdAt: Date.now(),
    });
    
    // Also save/update customer in customers collection
    await saveCustomerFromOrder(orderData.customer, orderData.total);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    throw error;
  }
};

export const getOrdersFromFirestore = async (): Promise<AdminOrder[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      return [];
    }
    
    const orders = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as AdminOrder[];

    return orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateOrderStatusInFirestore = async (id: string, status: string, note?: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentData = docSnap.data() as AdminOrder;
    const newTimeline = [
      ...(currentData.timeline || []),
      { status, note, timestamp: Date.now() }
    ];
    await updateDoc(docRef, {
      status,
      timeline: newTimeline,
      updatedAt: Date.now(),
    });
  }
};

export const getOrderByOrderId = async (orderId: string): Promise<AdminOrder | null> => {
  try {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(colRef, where('orderId', '==', orderId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() } as AdminOrder;
    }
    return null;
  } catch (error) {
    console.error('Error getting order by orderId:', error);
    return null;
  }
};

export const deleteOrderFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ==================== CUSTOMERS ====================

export const saveCustomerFromOrder = async (
  customerData: AdminOrder['customer'],
  orderTotal: number
): Promise<void> => {
  try {
    const colRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(colRef, where('phone', '==', customerData.phone), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const customerDoc = snapshot.docs[0];
      const existing = customerDoc.data() as AdminCustomer;
      await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, customerDoc.id), {
        name: customerData.name,
        whatsapp: customerData.whatsapp || existing.whatsapp,
        address: customerData.address,
        city: customerData.city,
        totalOrders: (existing.totalOrders || 0) + 1,
        totalSpend: (existing.totalSpend || 0) + orderTotal,
        lastOrderDate: Date.now(),
      });
    } else {
      await addDoc(colRef, {
        name: customerData.name,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp,
        address: customerData.address,
        city: customerData.city,
        totalOrders: 1,
        totalSpend: orderTotal,
        lastOrderDate: Date.now(),
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error saving customer to Firestore:', error);
  }
};

export const getCustomersFromFirestore = async (): Promise<AdminCustomer[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.CUSTOMERS);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminCustomer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// ==================== REVIEWS ====================

export const getReviewsByProductId = async (productId: string): Promise<AdminReview[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(colRef, where('productId', '==', productId), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminReview[];
  } catch (error) {
    console.error('Error fetching reviews by product:', error);
    return [];
  }
};

export const getReviewsFromFirestore = async (): Promise<AdminReview[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.REVIEWS);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminReview[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReviewToFirestore = async (review: Omit<AdminReview, 'id' | 'createdAt'>): Promise<string> => {
  const colRef = collection(db, COLLECTIONS.REVIEWS);
  const docRef = await addDoc(colRef, {
    ...review,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const toggleReviewPublishedInFirestore = async (id: string, isPublished: boolean): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await updateDoc(docRef, { isPublished });
};

export const replyReviewInFirestore = async (id: string, reply: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await updateDoc(docRef, { reply });
};

export const deleteReviewFromFirestore = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await deleteDoc(docRef);
};

// ==================== MESSAGES ====================

export const getMessagesFromFirestore = async (): Promise<AdminMessage[]> => {
  try {
    const colRef = collection(db, COLLECTIONS.MESSAGES);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AdminMessage[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const addMessageToFirestore = async (msg: Omit<AdminMessage, 'id' | 'createdAt'>): Promise<string> => {
  const colRef = collection(db, COLLECTIONS.MESSAGES);
  const docRef = await addDoc(colRef, {
    ...msg,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const markMessageReadInFirestore = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MESSAGES, id);
  await updateDoc(docRef, { isRead: true });
};

export const replyMessageInFirestore = async (id: string, reply: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MESSAGES, id);
  await updateDoc(docRef, { reply, isRead: true });
};

export const deleteMessageFromFirestore = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MESSAGES, id);
  await deleteDoc(docRef);
};

// ==================== SETTINGS & BANNERS ====================

export const getStoreSettingsFromFirestore = async (): Promise<StoreSettings | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'store');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StoreSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting store settings:', error);
    return null;
  }
};

export const updateStoreSettingsInFirestore = async (settings: StoreSettings): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'store');
  await setDoc(docRef, settings, { merge: true });
};

export const getBannersFromFirestore = async (): Promise<AdminBanner[]> => {
  try {
    const docRef = doc(db, COLLECTIONS.BANNERS, 'homepage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.banners) {
        return data.banners as AdminBanner[];
      } else if (data.urls) {
        return (data.urls as string[]).map(url => ({ url }));
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const updateBannersInFirestore = async (banners: AdminBanner[]): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BANNERS, 'homepage');
  await setDoc(docRef, { banners }, { merge: true });
};
