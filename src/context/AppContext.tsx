import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  CropListing, 
  CartItem, 
  Order, 
  RFQRequirement, 
  RFQOffer, 
  AppNotification 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CROPS, 
  INITIAL_ORDERS, 
  INITIAL_RFQS, 
  INITIAL_RFQ_OFFERS 
} from '../data/mockData';

async function readApiJson(response: Response, endpoint: string): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`${endpoint} returned ${contentType || 'a non-JSON response'} (HTTP ${response.status})`);
  }
  return response.json();
}

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  
  // Crops
  crops: CropListing[];
  addCrop: (crop: Omit<CropListing, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerPhone'>) => CropListing;
  updateCrop: (id: string, updates: Partial<CropListing>) => void;
  deleteCrop: (id: string) => void;
  
  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (crop: CropListing, quantityQuintals: number) => void;
  removeFromCart: (cropId: string) => void;
  updateCartQuantity: (cropId: string, quantityQuintals: number) => void;
  clearCart: () => void;
  wishlistIds: string[];
  toggleWishlist: (cropId: string) => void;
  
  // Orders
  orders: Order[];
  createOrderFromCart: (orderData: {
    crop: CropListing;
    quantityQuintals: number;
    paymentMethod: 'UPI' | 'NetBanking / NEFT' | 'Escrow Agropay';
    deliveryAddress: {
      addressLine: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    };
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], newCheckpoint?: string) => void;
  submitRating: (orderId: string, type: 'buyer' | 'farmer', rating: number, review: string) => void;
  
  // RFQ
  rfqs: RFQRequirement[];
  createRFQ: (rfqData: Omit<RFQRequirement, 'id' | 'buyerId' | 'buyerName' | 'offersCount' | 'createdAt' | 'status'>) => void;
  rfqOffers: RFQOffer[];
  submitRFQOffer: (offerData: Omit<RFQOffer, 'id' | 'farmerId' | 'farmerName' | 'farmerLocation' | 'createdAt' | 'status'>) => void;
  respondToOffer: (offerId: string, action: 'accept' | 'counter' | 'reject', counterPrice?: number, counterNotes?: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Navigation & View
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCropDetail: CropListing | null;
  setSelectedCropDetail: (crop: CropListing | null) => void;
  selectedCrop: CropListing | null;
  setSelectedCrop: (crop: CropListing | null) => void;
  
  // Toast notifications
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  toastMessage: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: () => void;
  refreshData: () => Promise<void>;
}

function mapDbProductToCropListing(p: any): CropListing {
  const images = Array.isArray(p.images) && p.images.length > 0 
    ? p.images.map((img: any) => typeof img === 'string' ? img : (img.imageUrl || img)) 
    : [p.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'];

  return {
    id: p.id,
    title: p.title,
    hindiTitle: p.hindiTitle || p.title,
    category: p.crop?.category || 'Grains & Cereals',
    variety: p.variety?.varietyName || 'Standard Certified Variety',
    grade: p.grade || 'Grade A',
    moisturePercentage: p.inventory?.moisturePercentage ?? 10.5,
    quantityAvailable: p.inventory?.totalAvailableQuintals ?? 100,
    minOrderQuantity: p.inventory?.minOrderQuantityQuintals ?? 10,
    pricePerQuintal: p.pricePerQuintal,
    mandiBenchmarkPrice: p.mandiBenchmarkPrice || (p.pricePerQuintal - 120),
    isOrganicCertified: Boolean(p.organicCertified),
    harvestDate: p.harvestDate || '2026-03-25',
    packagingType: '50kg HDPE / Jute Bags',
    description: p.description || '',
    sellerId: p.farmerId,
    sellerName: p.farmer?.name || 'Verified Producer',
    sellerPhone: p.farmer?.phone || '+91 98260 44123',
    sellerType: p.farmer?.isVerifiedFPO ? 'FPO (Farmer Producer Org)' : 'Individual Farmer',
    location: {
      district: p.farmer?.location?.split(',')?.[0]?.trim() || 'Sehore',
      state: p.farmer?.location?.split(',')?.[1]?.trim() || 'Madhya Pradesh',
      nearestMandi: p.apmcMandiYard || 'Sehore APMC Yard',
    },
    imageUrl: images[0],
    images: images,
    shelfLifeDays: p.crop?.shelfLifeDays || 365,
    status: p.status || 'active',
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-03-28',
  };
}

function mapDbOrderToFrontendOrder(o: any): Order {
  const item = o.items?.[0] || {};
  return {
    id: o.orderNumber || o.id,
    buyerId: o.buyerId,
    buyerName: o.buyer?.name || 'Wholesale Buyer',
    buyerPhone: o.buyer?.phone || '+91 98112 55981',
    sellerId: o.farmerId,
    sellerName: o.farmer?.name || 'Verified Producer',
    sellerPhone: o.farmer?.phone || '+91 98260 44123',
    cropId: item.productId || 'prod-001',
    cropTitle: item.cropName || 'Agricultural Commodity',
    category: 'Grains & Cereals',
    quantityQuintals: o.totalQuantityQuintals || item.quantityQuintals || 50,
    pricePerQuintal: item.pricePerQuintal || 3850,
    subtotal: o.cropSubtotalAmount || 192500,
    mandiCess: o.mandiTaxCessAmount || 1925,
    logisticsFee: o.freightLogisticsAmount || 8500,
    totalAmount: o.totalAmount || 202925,
    deliveryAddress: {
      addressLine: 'Wholesale Depot Gate 2',
      city: 'Delhi',
      district: 'North West Delhi',
      state: 'Delhi',
      pincode: '110033'
    },
    paymentMethod: 'Escrow Agropay',
    paymentId: o.payment?.transactionReference || `PAY-${o.id.slice(-6)}`,
    paymentStatus: o.payment?.status === 'escrow_locked' ? 'escrow_hold' : o.payment?.status === 'disbursed' ? 'released_to_farmer' : 'escrow_hold',
    orderStatus: o.status === 'confirmed' ? 'confirmed' : o.status === 'in_transit' || o.status === 'dispatched' ? 'dispatched' : o.status === 'delivered' ? 'delivered' : 'placed',
    trackingId: o.shipment?.trackingConsignmentNumber || `TRK-${o.id.slice(-6)}`,
    vehicleNumber: o.shipment?.vehicleNumber || 'MP 04 HE 8812',
    driverContact: o.shipment?.driverContactNumber || '+91 97552 11984',
    checkpoints: o.statusHistory?.map((sh: any) => ({
      title: sh.changeReason || `Status: ${sh.newStatus}`,
      location: sh.locationCheckpoint || 'Regional Agribusiness Terminal',
      timestamp: new Date(sh.timestamp).toLocaleString(),
      completed: true,
      notes: ''
    })) || [
      {
        title: 'Order Placed & Escrow Funded',
        location: 'Online Payment Gateway',
        timestamp: 'Today',
        completed: true,
        notes: 'Payment held in RBI-compliant Agro Escrow account'
      }
    ],
    createdAt: new Date(o.createdAt).toLocaleDateString(),
    estimatedDeliveryDate: o.estimatedDeliveryDate ? new Date(o.estimatedDeliveryDate).toLocaleDateString() : 'In 3 days'
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('ks_role') as UserRole) || 'buyer';
  });

  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('ks_lang') as 'en' | 'hi') || 'en';
  });

  const [crops, setCrops] = useState<CropListing[]>(() => {
    const saved = localStorage.getItem('ks_crops');
    return saved ? JSON.parse(saved) : INITIAL_CROPS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ks_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [rfqs, setRfqs] = useState<RFQRequirement[]>(() => {
    const saved = localStorage.getItem('ks_rfqs');
    return saved ? JSON.parse(saved) : INITIAL_RFQS;
  });

  const [rfqOffers, setRfqOffers] = useState<RFQOffer[]>(() => {
    const saved = localStorage.getItem('ks_rfq_offers');
    return saved ? JSON.parse(saved) : INITIAL_RFQ_OFFERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ks_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ks_wishlist');
    return saved ? JSON.parse(saved) : ['crop_wheat_01', 'crop_turmeric_05'];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      userId: 'user_farmer_1',
      title: 'New RFQ Match: Sharbati Wheat',
      message: 'Bharat Agro Exporters posted a bulk RFQ for 400 Quintals at target price ₹3,750.',
      type: 'rfq',
      isRead: false,
      timestamp: '15 mins ago'
    },
    {
      id: 'notif_2',
      userId: 'user_buyer_1',
      title: 'Shipment On The Move: Order #KS-ORD-98214',
      message: 'Your Sharbati Wheat cargo has crossed Gwalior Bypass on NH-46. ETA: Tomorrow morning.',
      type: 'order',
      isRead: false,
      timestamp: '1 hour ago'
    },
    {
      id: 'notif_3',
      userId: 'all',
      title: 'Mandi Bhav Surge: Lasalgaon Red Onion',
      message: 'Garwa onion modal price rose +4.2% today to ₹2,380/Quintal due to strong southern demand.',
      type: 'price_alert',
      isRead: true,
      timestamp: '3 hours ago'
    }
  ]);

  const [activeView, setActiveView] = useState<string>('marketplace');
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropListing | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ks_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('ks_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ks_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('ks_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ks_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    localStorage.setItem('ks_rfq_offers', JSON.stringify(rfqOffers));
  }, [rfqOffers]);

  useEffect(() => {
    localStorage.setItem('ks_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ks_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Check if an authentic authenticated user exists in storage
  let savedAuthUser: User | null = null;
  try {
    const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('ks_auth_user') : null;
    if (savedUserStr) {
      savedAuthUser = JSON.parse(savedUserStr);
    }
  } catch (e) {
    // Ignore parse error
  }

  const currentUser: User = (savedAuthUser && savedAuthUser.role === currentRole)
    ? savedAuthUser
    : (INITIAL_USERS[currentRole] || INITIAL_USERS.farmer);

  // Synchronize live data from the 30-entity persistent database layer
  const refreshData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ks_auth_token') : null;
      const authHeader: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Fetch live products from database
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await readApiJson(prodRes, '/api/products');
        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          const mapped = prodData.products.map(mapDbProductToCropListing);
          setCrops(mapped);
        }
      }

      // 2. Fetch live orders from database if logged in
      if (token) {
        const orderRes = await fetch('/api/orders', { headers: authHeader });
        if (orderRes.ok) {
          const orderData = await readApiJson(orderRes, '/api/orders');
          if (orderData.success && Array.isArray(orderData.orders) && orderData.orders.length > 0) {
            const mappedOrders = orderData.orders.map(mapDbOrderToFrontendOrder);
            setOrders(mappedOrders);
          }
        }

        // 3. Fetch user notifications
        const notifRes = await fetch('/api/notifications', { headers: authHeader });
        if (notifRes.ok) {
          const notifData = await readApiJson(notifRes, '/api/notifications');
          if (notifData.success && Array.isArray(notifData.notifications)) {
            const mappedNotifs = notifData.notifications.map((n: any) => ({
              id: n.id,
              userId: n.userId,
              title: n.title,
              message: n.message,
              type: n.type === 'order_event' ? 'order' : n.type === 'rfq_event' ? 'rfq' : 'price_alert',
              isRead: n.isRead,
              timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setNotifications(mappedNotifs);
          }
        }
      }

      // 4. Fetch RFQ Requirements
      const rfqRes = await fetch('/api/rfq/requirements');
      if (rfqRes.ok) {
        const rfqData = await readApiJson(rfqRes, '/api/rfq/requirements');
        if (rfqData.success && Array.isArray(rfqData.requirements) && rfqData.requirements.length > 0) {
          const mappedRfqs = rfqData.requirements.map((r: any) => ({
            id: r.id,
            cropName: r.cropName,
            variety: r.varietyName,
            grade: r.requiredGrade,
            quantityQuintals: r.quantityQuintals,
            targetPricePerQuintal: r.targetPricePerQuintal,
            deliveryLocation: `${r.deliveryDistrict}, ${r.deliveryState}`,
            requiredByDate: r.requiredByDate,
            packagingRequirement: r.packagingRequirements || '50kg HDPE bags',
            notes: r.inspectionPreferences || '',
            buyerId: r.buyerId,
            buyerName: r.buyerProfile?.companyName || 'Corporate Wholesale Buyer',
            buyerType: 'Corporate Buyer',
            offersCount: r.offers?.length || 0,
            status: r.status,
            createdAt: new Date(r.createdAt).toLocaleDateString()
          }));
          setRfqs(mappedRfqs);
        }
      }
    } catch (err) {
      console.warn('Backend database sync notice:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser.id, currentRole]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);
    showToast(`Switched view to ${role === 'farmer' ? 'Farmer / Seller' : role === 'buyer' ? 'Wholesale Buyer' : 'Platform Admin'} mode`, 'info');
  };

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    showToast(lang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language set to English', 'info');
  };

  // Crop CRUD
  const addCrop = (cropData: Omit<CropListing, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerPhone'>): CropListing => {
    const tempId = `crop_${Date.now()}`;
    const newCrop: CropListing = {
      ...cropData,
      id: tempId,
      sellerId: currentUser.id,
      sellerName: currentUser.name + (currentUser.isVerifiedFPO ? ` (${currentUser.fpoName})` : ''),
      sellerPhone: currentUser.phone,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setCrops(prev => [newCrop, ...prev]);
    showToast('New crop listing published successfully to Kisan Saathi marketplace!', 'success');

    // Async persist to server database
    const token = typeof window !== 'undefined' ? localStorage.getItem('ks_auth_token') : null;
    fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        product: {
          cropId: 'crop-001',
          varietyId: 'var-001',
          title: cropData.title,
          hindiTitle: cropData.hindiTitle,
          description: cropData.description,
          grade: cropData.grade,
          organicCertified: cropData.isOrganicCertified,
          pricePerQuintal: cropData.pricePerQuintal,
          mandiBenchmarkPrice: cropData.mandiBenchmarkPrice,
          harvestDate: cropData.harvestDate,
          apmcMandiYard: cropData.location?.nearestMandi || 'Central APMC Yard',
          status: 'active'
        },
        inventory: {
          totalAvailableQuintals: cropData.quantityAvailable,
          allocatedQuintals: 0,
          minOrderQuantityQuintals: cropData.minOrderQuantity,
          maxOrderQuantityQuintals: cropData.quantityAvailable,
          moisturePercentage: cropData.moisturePercentage,
          warehouseStorageType: 'warehouse',
          warehouseLocation: `${cropData.location?.district || 'Sehore'}, ${cropData.location?.state || 'Madhya Pradesh'}`
        },
        imageUrls: cropData.images && cropData.images.length > 0 ? cropData.images : [cropData.imageUrl]
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.product) {
        refreshData();
      }
    })
    .catch(err => console.warn('Product persist warning:', err));

    return newCrop;
  };

  const updateCrop = (id: string, updates: Partial<CropListing>) => {
    setCrops(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Crop listing updated successfully.', 'info');
  };

  const deleteCrop = (id: string) => {
    setCrops(prev => prev.filter(c => c.id !== id));
    showToast('Crop listing removed.', 'warning');
  };

  // Cart & Wishlist
  const addToCart = (crop: CropListing, quantityQuintals: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.crop.id === crop.id);
      if (existing) {
        return prev.map(item => 
          item.crop.id === crop.id 
            ? { ...item, quantityQuintals: item.quantityQuintals + quantityQuintals } 
            : item
        );
      }
      return [...prev, { crop, quantityQuintals }];
    });
    showToast(`Added ${quantityQuintals} Quintals of ${crop.title} to cart`, 'success');
  };

  const removeFromCart = (cropId: string) => {
    setCart(prev => prev.filter(item => item.crop.id !== cropId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cropId: string, quantityQuintals: number) => {
    if (quantityQuintals <= 0) {
      removeFromCart(cropId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.crop.id === cropId ? { ...item, quantityQuintals } : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (cropId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(cropId);
      if (exists) {
        showToast('Removed from saved crops', 'info');
        return prev.filter(id => id !== cropId);
      } else {
        showToast('Added to saved crops wishlist', 'success');
        return [...prev, cropId];
      }
    });
  };

  // Orders
  const createOrderFromCart = async (orderData: {
    crop: CropListing;
    quantityQuintals: number;
    paymentMethod: 'UPI' | 'NetBanking / NEFT' | 'Escrow Agropay';
    deliveryAddress: {
      addressLine: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    };
  }): Promise<Order> => {
    const subtotal = orderData.crop.pricePerQuintal * orderData.quantityQuintals;
    const mandiCess = Math.round(subtotal * 0.01); // 1% mandi cess
    const logisticsFee = Math.round(Math.max(3500, orderData.quantityQuintals * 150));
    const totalAmount = subtotal + mandiCess + logisticsFee;
    const orderId = `KS-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      sellerId: orderData.crop.sellerId,
      sellerName: orderData.crop.sellerName,
      sellerPhone: orderData.crop.sellerPhone,
      cropId: orderData.crop.id,
      cropTitle: orderData.crop.title,
      category: orderData.crop.category,
      quantityQuintals: orderData.quantityQuintals,
      pricePerQuintal: orderData.crop.pricePerQuintal,
      subtotal,
      mandiCess,
      logisticsFee,
      totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      paymentId: `PAY-${Date.now().toString().slice(-8)}`,
      paymentStatus: 'escrow_hold',
      orderStatus: 'confirmed',
      trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      checkpoints: [
        {
          title: 'Prepaid Payment Secured & Held in Escrow',
          location: 'Kisan Saathi Digital Escrow Vault',
          timestamp: 'Just now',
          completed: true,
          notes: 'Amount locked safely until buyer quality sign-off'
        },
        {
          title: 'Farmer Order Acceptance & Mandi Weighment',
          location: `${orderData.crop.location.nearestMandi}`,
          timestamp: 'Scheduled for tomorrow',
          completed: false,
          notes: 'Assayer moisture & weight inspection booked'
        },
        {
          title: 'Dispatch with GPS Sealed Truck',
          location: orderData.crop.location.district,
          timestamp: 'Pending',
          completed: false
        },
        {
          title: 'Delivery & Escrow Settlement',
          location: `${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state}`,
          timestamp: 'Pending',
          completed: false
        }
      ],
      createdAt: 'Just now',
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    // Update crop quantity
    updateCrop(orderData.crop.id, {
      quantityAvailable: Math.max(0, orderData.crop.quantityAvailable - orderData.quantityQuintals)
    });

    setOrders(prev => [newOrder, ...prev]);

    // Persist order to server database
    const token = typeof window !== 'undefined' ? localStorage.getItem('ks_auth_token') : null;
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        farmerId: orderData.crop.sellerId,
        items: [
          {
            productId: orderData.crop.id,
            quantityQuintals: orderData.quantityQuintals,
            pricePerQuintal: orderData.crop.pricePerQuintal,
            cropName: orderData.crop.title,
            grade: orderData.crop.grade
          }
        ],
        notes: `Delivery to ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state}`
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        refreshData();
      }
    })
    .catch(err => console.warn('Order sync warning:', err));

    // Add notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: currentUser.id,
        title: `Order Placed: #${orderId}`,
        message: `Successfully created contract for ${orderData.quantityQuintals} Qtl ${orderData.crop.title}. Escrow funded ₹${totalAmount.toLocaleString('en-IN')}.`,
        type: 'order',
        isRead: false,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    showToast(`Order #${orderId} confirmed with escrow lock!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], newCheckpoint?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const updatedCheckpoints = [...order.checkpoints];
      if (newCheckpoint) {
        updatedCheckpoints.push({
          title: newCheckpoint,
          location: 'En-route Hub',
          timestamp: 'Just now',
          completed: true
        });
      }
      return {
        ...order,
        orderStatus: status,
        checkpoints: updatedCheckpoints,
        paymentStatus: status === 'delivered' ? 'released_to_farmer' : order.paymentStatus
      };
    }));

    // Server-side status update
    const token = typeof window !== 'undefined' ? localStorage.getItem('ks_auth_token') : null;
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        status: status === 'placed' ? 'pending_confirmation' : status === 'confirmed' ? 'confirmed' : status === 'dispatched' || status === 'out_for_delivery' ? 'in_transit' : status === 'delivered' ? 'delivered' : 'confirmed',
        reason: newCheckpoint || `Status advanced to ${status}`,
        checkpoint: newCheckpoint
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        refreshData();
      }
    })
    .catch(err => console.warn('Order status sync warning:', err));

    showToast(`Order #${orderId} status updated to ${status}`, 'info');
  };

  const submitRating = (orderId: string, type: 'buyer' | 'farmer', rating: number, review: string) => {
    const timestamp = 'Today';
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      if (type === 'buyer') {
        return { ...order, buyerRating: { rating, review, timestamp } };
      } else {
        return { ...order, farmerRating: { rating, review, timestamp } };
      }
    }));
    showToast('Rating and feedback submitted successfully!', 'success');
  };

  // RFQ
  const createRFQ = (rfqData: Omit<RFQRequirement, 'id' | 'buyerId' | 'buyerName' | 'offersCount' | 'createdAt' | 'status'>) => {
    const newRfq: RFQRequirement = {
      ...rfqData,
      id: `rfq_req_${Date.now()}`,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      offersCount: 0,
      createdAt: 'Today',
      status: 'open'
    };
    setRfqs(prev => [newRfq, ...prev]);
    showToast('Bulk RFQ published to farmers nationwide!', 'success');
  };

  const submitRFQOffer = (offerData: Omit<RFQOffer, 'id' | 'farmerId' | 'farmerName' | 'farmerLocation' | 'createdAt' | 'status'>) => {
    const newOffer: RFQOffer = {
      ...offerData,
      id: `rfq_off_${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name + (currentUser.isVerifiedFPO ? ` (${currentUser.fpoName})` : ''),
      farmerLocation: `${currentUser.location.district}, ${currentUser.location.state}`,
      status: 'pending',
      createdAt: 'Today'
    };
    setRfqOffers(prev => [newOffer, ...prev]);
    setRfqs(prev => prev.map(r => r.id === offerData.rfqId ? { ...r, offersCount: r.offersCount + 1 } : r));
    showToast('Offer submitted to buyer successfully!', 'success');
  };

  const respondToOffer = (offerId: string, action: 'accept' | 'counter' | 'reject', counterPrice?: number, counterNotes?: string) => {
    setRfqOffers(prev => prev.map(offer => {
      if (offer.id !== offerId) return offer;
      if (action === 'accept') {
        return { ...offer, status: 'accepted' };
      } else if (action === 'reject') {
        return { ...offer, status: 'rejected' };
      } else {
        return { ...offer, status: 'countered', counterPrice, counterNotes };
      }
    }));
    showToast(`RFQ Offer updated: ${action}`, 'info');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setRole,
        language,
        setLanguage,
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlistIds,
        toggleWishlist,
        orders,
        createOrderFromCart,
        updateOrderStatus,
        submitRating,
        rfqs,
        createRFQ,
        rfqOffers,
        submitRFQOffer,
        respondToOffer,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        activeView,
        setActiveView,
        selectedCropDetail,
        setSelectedCropDetail,
        selectedCrop: selectedCropDetail,
        setSelectedCrop: setSelectedCropDetail,
        toast,
        toastMessage: toast,
        showToast,
        dismissToast: () => setToast(null)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
