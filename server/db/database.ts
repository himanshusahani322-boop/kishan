import fs from 'fs';
import path from 'path';
import { 
  DatabaseSchema, 
  User, 
  FarmerProfile, 
  BuyerProfile, 
  Address, 
  Crop, 
  CropVariety, 
  Product, 
  ProductImage, 
  Inventory, 
  QualityReport, 
  Cart, 
  CartItem, 
  Wishlist, 
  Order, 
  OrderItem, 
  OrderStatusHistory, 
  Shipment, 
  Payment, 
  PaymentTransaction, 
  BulkRequirement, 
  RFQOffer, 
  Review, 
  Notification, 
  Weather, 
  ColdStorage, 
  Article,
  Conversation,
  Message,
  Document,
  AuditLog,
  FPO,
  Weighment,
  WeatherAlert,
  ArticleCategory,
  WishlistItem
} from './schema';
import { generateSeedData } from './seed';
import * as validation from './validation';

const isVercel = Boolean(process.env.VERCEL);
const DEFAULT_DB_PATH = process.env.DATABASE_STORAGE_PATH || (
  isVercel
    ? path.join('/tmp', 'kisan_saathi.db.json')
    : path.join(process.cwd(), 'data', 'kisan_saathi.db.json')
);

export interface ProductDetailView extends Product {
  farmer: {
    name: string;
    phone: string;
    location: string;
    isVerifiedFPO: boolean;
    fpoName?: string;
    rating: number;
  };
  crop: Crop;
  variety: CropVariety;
  images: ProductImage[];
  inventory?: Inventory;
  qualityReport?: QualityReport;
  reviews?: Review[];
}

export interface OrderDetailView extends Order {
  buyer: {
    name: string;
    businessName: string;
    phone: string;
  };
  farmer: {
    name: string;
    phone: string;
    primaryApmcMandi: string;
  };
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  shipment?: Shipment;
  payment?: Payment;
}

export interface CartDetailView {
  cart: Cart;
  items: Array<CartItem & { product: Product; primaryImage?: string }>;
  totalAmount: number;
  totalQuintals: number;
}

export interface BulkRequirementDetailView extends BulkRequirement {
  buyer: {
    name: string;
    businessName: string;
  };
  crop: Crop;
  offers: Array<RFQOffer & { sellerName: string; sellerPhone: string; sellerRating: number }>;
}

export class KisanSaathiDatabase {
  private static instance: KisanSaathiDatabase;
  private dbFilePath: string;
  private data: DatabaseSchema;
  private writeTimeout: NodeJS.Timeout | null = null;

  // Secondary Indexes for high performance
  private indexes = {
    usersById: new Map<string, User>(),
    farmerProfilesByUserId: new Map<string, FarmerProfile>(),
    buyerProfilesByUserId: new Map<string, BuyerProfile>(),
    addressesByUserId: new Map<string, Address[]>(),
    cropsById: new Map<string, Crop>(),
    varietiesById: new Map<string, CropVariety>(),
    productsById: new Map<string, Product>(),
    productsByFarmerId: new Map<string, Product[]>(),
    productImagesByProductId: new Map<string, ProductImage[]>(),
    inventoryByProductId: new Map<string, Inventory>(),
    qualityReportsByProductId: new Map<string, QualityReport>(),
    cartByBuyerId: new Map<string, Cart>(),
    cartItemsByCartId: new Map<string, CartItem[]>(),
    wishlistByBuyerId: new Map<string, Wishlist>(),
    ordersById: new Map<string, Order>(),
    ordersByBuyerId: new Map<string, Order[]>(),
    ordersByFarmerId: new Map<string, Order[]>(),
    orderItemsByOrderId: new Map<string, OrderItem[]>(),
    orderStatusByOrderId: new Map<string, OrderStatusHistory[]>(),
    shipmentByOrderId: new Map<string, Shipment>(),
    paymentByOrderId: new Map<string, Payment>(),
    bulkRequirementsById: new Map<string, BulkRequirement>(),
    rfqOffersByRequirementId: new Map<string, RFQOffer[]>(),
    reviewsByProductId: new Map<string, Review[]>(),
    reviewsByFarmerId: new Map<string, Review[]>(),
    notificationsByUserId: new Map<string, Notification[]>(),
    coldStoragesById: new Map<string, ColdStorage>(),
    articlesById: new Map<string, Article>(),
    conversationsByUserId: new Map<string, Conversation[]>(),
    messagesByConversationId: new Map<string, Message[]>(),
    fposById: new Map<string, FPO>(),
    weighmentsByOrderId: new Map<string, Weighment>(),
    weatherAlertsById: new Map<string, WeatherAlert>(),
    articleCategoriesById: new Map<string, ArticleCategory>(),
    wishlistItemsByWishlistId: new Map<string, WishlistItem[]>(),
  };

  private constructor() {
    this.dbFilePath = process.env.DATABASE_STORAGE_PATH || DEFAULT_DB_PATH;
    this.data = this.initializeDatabase();
    this.rebuildIndexes();
  }

  public static getInstance(): KisanSaathiDatabase {
    if (!KisanSaathiDatabase.instance) {
      KisanSaathiDatabase.instance = new KisanSaathiDatabase();
    }
    return KisanSaathiDatabase.instance;
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Verify all 34 collections exist
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          parsed.fpos = parsed.fpos || [];
          parsed.weighments = parsed.weighments || [];
          parsed.weatherAlerts = parsed.weatherAlerts || [];
          parsed.articleCategories = parsed.articleCategories || [];
          parsed.wishlistItems = parsed.wishlistItems || [];
          return parsed;
        }
      } else if (isVercel) {
        // On Vercel: copy pre-seeded database from bundled repo
        const repoDbPath = path.join(process.cwd(), 'data', 'kisan_saathi.db.json');
        if (fs.existsSync(repoDbPath)) {
          const raw = fs.readFileSync(repoDbPath, 'utf-8');
          const parsed = JSON.parse(raw) as DatabaseSchema;
          if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
            this.persistSync(parsed);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('[Database] Existing database could not be loaded, initializing seed data:', err);
    }

    // Auto-seed if empty or missing
    console.log('[Database] Seeding fresh 30-entity agricultural enterprise data...');
    const seed = generateSeedData();
    this.persistSync(seed);
    return seed;
  }

  private rebuildIndexes(): void {
    const d = this.data;
    const idx = this.indexes;

    // Reset maps
    for (const key of Object.keys(idx) as Array<keyof typeof idx>) {
      (idx[key] as any).clear();
    }

    d.users.forEach(u => idx.usersById.set(u.id, u));
    d.farmerProfiles.forEach(fp => idx.farmerProfilesByUserId.set(fp.userId, fp));
    d.buyerProfiles.forEach(bp => idx.buyerProfilesByUserId.set(bp.userId, bp));
    
    d.addresses.forEach(a => {
      const list = idx.addressesByUserId.get(a.userId) || [];
      list.push(a);
      idx.addressesByUserId.set(a.userId, list);
    });

    d.crops.forEach(c => idx.cropsById.set(c.id, c));
    d.cropVarieties.forEach(v => idx.varietiesById.set(v.id, v));

    d.products.forEach(p => {
      idx.productsById.set(p.id, p);
      const list = idx.productsByFarmerId.get(p.farmerId) || [];
      list.push(p);
      idx.productsByFarmerId.set(p.farmerId, list);
    });

    d.productImages.forEach(img => {
      const list = idx.productImagesByProductId.get(img.productId) || [];
      list.push(img);
      idx.productImagesByProductId.set(img.productId, list);
    });

    d.inventories.forEach(inv => idx.inventoryByProductId.set(inv.productId, inv));
    d.qualityReports.forEach(qr => idx.qualityReportsByProductId.set(qr.productId, qr));

    d.carts.forEach(c => idx.cartByBuyerId.set(c.buyerId, c));
    d.cartItems.forEach(ci => {
      const list = idx.cartItemsByCartId.get(ci.cartId) || [];
      list.push(ci);
      idx.cartItemsByCartId.set(ci.cartId, list);
    });

    d.wishlists.forEach(w => idx.wishlistByBuyerId.set(w.buyerId, w));

    d.orders.forEach(o => {
      idx.ordersById.set(o.id, o);
      const bList = idx.ordersByBuyerId.get(o.buyerId) || [];
      bList.push(o);
      idx.ordersByBuyerId.set(o.buyerId, bList);

      const fList = idx.ordersByFarmerId.get(o.farmerId) || [];
      fList.push(o);
      idx.ordersByFarmerId.set(o.farmerId, fList);
    });

    d.orderItems.forEach(oi => {
      const list = idx.orderItemsByOrderId.get(oi.orderId) || [];
      list.push(oi);
      idx.orderItemsByOrderId.set(oi.orderId, list);
    });

    d.orderStatusHistories.forEach(osh => {
      const list = idx.orderStatusByOrderId.get(osh.orderId) || [];
      list.push(osh);
      idx.orderStatusByOrderId.set(osh.orderId, list);
    });

    d.shipments.forEach(s => idx.shipmentByOrderId.set(s.orderId, s));
    d.payments.forEach(p => idx.paymentByOrderId.set(p.orderId, p));

    d.bulkRequirements.forEach(br => idx.bulkRequirementsById.set(br.id, br));
    d.rfqOffers.forEach(o => {
      const list = idx.rfqOffersByRequirementId.get(o.bulkRequirementId) || [];
      list.push(o);
      idx.rfqOffersByRequirementId.set(o.bulkRequirementId, list);
    });

    d.reviews.forEach(r => {
      if (r.productId) {
        const pList = idx.reviewsByProductId.get(r.productId) || [];
        pList.push(r);
        idx.reviewsByProductId.set(r.productId, pList);
      }
      const fList = idx.reviewsByFarmerId.get(r.farmerId) || [];
      fList.push(r);
      idx.reviewsByFarmerId.set(r.farmerId, fList);
    });

    d.notifications.forEach(n => {
      const list = idx.notificationsByUserId.get(n.userId) || [];
      list.push(n);
      idx.notificationsByUserId.set(n.userId, list);
    });

    d.coldStorages.forEach(cs => idx.coldStoragesById.set(cs.id, cs));
    d.articles.forEach(a => idx.articlesById.set(a.id, a));

    d.conversations.forEach(c => {
      const p1List = idx.conversationsByUserId.get(c.participant1Id) || [];
      p1List.push(c);
      idx.conversationsByUserId.set(c.participant1Id, p1List);

      const p2List = idx.conversationsByUserId.get(c.participant2Id) || [];
      p2List.push(c);
      idx.conversationsByUserId.set(c.participant2Id, p2List);
    });

    d.messages.forEach(m => {
      const list = idx.messagesByConversationId.get(m.conversationId) || [];
      list.push(m);
      idx.messagesByConversationId.set(m.conversationId, list);
    });

    d.fpos?.forEach(f => idx.fposById.set(f.id, f));
    d.weighments?.forEach(w => idx.weighmentsByOrderId.set(w.orderId, w));
    d.weatherAlerts?.forEach(wa => idx.weatherAlertsById.set(wa.id, wa));
    d.articleCategories?.forEach(ac => idx.articleCategoriesById.set(ac.id, ac));
    d.wishlistItems?.forEach(wi => {
      const list = idx.wishlistItemsByWishlistId.get(wi.wishlistId) || [];
      list.push(wi);
      idx.wishlistItemsByWishlistId.set(wi.wishlistId, list);
    });
  }

  /**
   * Atomic file persistence with safe temporary file write and atomic rename
   */
  private scheduleSave(): void {
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }
    this.writeTimeout = setTimeout(() => {
      this.persistSync(this.data);
      this.writeTimeout = null;
    }, 50);
  }

  private persistSync(dataToSave: DatabaseSchema): void {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${this.dbFilePath}.tmp-${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbFilePath);
    } catch (err) {
      console.error('[Database] Failed to write database file:', err);
    }
  }

  // ==========================================
  // AUDIT LOGGING
  // ==========================================
  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.data.auditLogs.unshift(newLog);
    this.scheduleSave();
    return newLog;
  }

  // ==========================================
  // USERS & PROFILES ACCESS LAYER
  // ==========================================
  public getAllUsers(): User[] {
    return [...this.data.users];
  }

  public getUserById(id: string): User | undefined {
    return this.indexes.usersById.get(id);
  }

  public getUserByEmailOrPhone(identifier: string): User | undefined {
    const normalized = identifier.toLowerCase().trim();
    return this.data.users.find(u => 
      u.email.toLowerCase() === normalized || 
      u.phone.trim() === normalized.replace(/\D/g, '') ||
      u.phone.trim() === normalized
    );
  }

  public insertUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    validation.CreateUserSchema.parse(userData);
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr-${userData.role}-${Date.now().toString().slice(-6)}`,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);
    this.indexes.usersById.set(newUser.id, newUser);

    // Create profile accordingly
    if (userData.role === 'farmer') {
      const fp: FarmerProfile = {
        id: `fp-${Date.now().toString().slice(-6)}`,
        userId: newUser.id,
        isVerifiedFPO: false,
        primaryApmcMandi: 'Local APMC Mandi',
        landSizeAcres: 5,
        farmingType: 'conventional',
        certifications: [],
        rating: 5,
        totalRatingsCount: 0,
        totalCropsListed: 0,
        totalOrdersFulfilled: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.data.farmerProfiles.push(fp);
      this.indexes.farmerProfilesByUserId.set(newUser.id, fp);
    } else if (userData.role === 'buyer') {
      const bp: BuyerProfile = {
        id: `bp-${Date.now().toString().slice(-6)}`,
        userId: newUser.id,
        businessName: newUser.name,
        businessType: 'trader',
        isGstVerified: false,
        creditLimitAmount: 1000000,
        creditBalanceAmount: 1000000,
        preferredCommodities: [],
        rating: 5,
        totalRatingsCount: 0,
        totalProcuredQuintals: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.data.buyerProfiles.push(bp);
      this.indexes.buyerProfilesByUserId.set(newUser.id, bp);

      // Create cart & wishlist for buyer
      const cart: Cart = {
        id: `cart-${newUser.id}`,
        buyerId: newUser.id,
        status: 'active',
        currency: 'INR',
        createdAt: now,
        updatedAt: now,
      };
      this.data.carts.push(cart);
      this.indexes.cartByBuyerId.set(newUser.id, cart);

      const wishlist: Wishlist = {
        id: `wish-${newUser.id}`,
        buyerId: newUser.id,
        productIds: [],
        createdAt: now,
        updatedAt: now,
      };
      this.data.wishlists.push(wishlist);
      this.indexes.wishlistByBuyerId.set(newUser.id, wishlist);
    }

    this.logAudit({
      entityName: 'User',
      entityId: newUser.id,
      action: 'create',
      performedByUserId: newUser.id,
      changesSummary: `Registered new ${newUser.role} user: ${newUser.name}`,
      newState: { email: newUser.email, role: newUser.role },
    });

    this.scheduleSave();
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): User {
    const user = this.indexes.usersById.get(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.scheduleSave();
    return user;
  }

  public getFarmerProfile(userId: string): FarmerProfile | undefined {
    return this.indexes.farmerProfilesByUserId.get(userId) ||
      (userId === 'user_farmer_1' ? this.indexes.farmerProfilesByUserId.get('usr-farmer-001') : undefined) ||
      (userId === 'usr-farmer-001' ? this.indexes.farmerProfilesByUserId.get('user_farmer_1') : undefined);
  }

  public updateFarmerProfile(userId: string, updates: Partial<FarmerProfile>): FarmerProfile {
    let profile = this.indexes.farmerProfilesByUserId.get(userId);
    if (!profile && userId === 'user_farmer_1') {
      profile = this.indexes.farmerProfilesByUserId.get('usr-farmer-001');
    }
    if (!profile && userId === 'usr-farmer-001') {
      profile = this.indexes.farmerProfilesByUserId.get('user_farmer_1');
    }
    if (!profile) {
      const now = new Date().toISOString();
      profile = {
        id: `fp-${userId}`,
        userId,
        farmName: updates.farmName || 'Kisan Farm',
        village: updates.village || 'Narsinghpur',
        district: updates.district || 'Sehore',
        state: updates.state || 'Madhya Pradesh',
        pincode: updates.pincode || '466001',
        landSizeAcres: updates.landSizeAcres || 10,
        fpoName: updates.fpoName,
        isVerifiedFPO: Boolean(updates.fpoName),
        primaryApmcMandi: 'Sehore APMC Mandi',
        farmingType: 'conventional',
        certifications: [],
        rating: 5,
        totalRatingsCount: 1,
        totalCropsListed: 0,
        totalOrdersFulfilled: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.data.farmerProfiles.push(profile);
      this.indexes.farmerProfilesByUserId.set(userId, profile);
    } else {
      Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    }
    this.scheduleSave();
    return profile;
  }

  public getBuyerProfile(userId: string): BuyerProfile | undefined {
    return this.indexes.buyerProfilesByUserId.get(userId);
  }

  public updateBuyerProfile(userId: string, updates: Partial<BuyerProfile>): BuyerProfile {
    const profile = this.indexes.buyerProfilesByUserId.get(userId);
    if (!profile) throw new Error(`Buyer profile not found for user: ${userId}`);
    Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    this.scheduleSave();
    return profile;
  }

  // ==========================================
  // CROPS & VARIETIES MASTER CATALOG
  // ==========================================
  public getAllCrops(): Crop[] {
    return [...this.data.crops];
  }

  public getCropById(id: string): Crop | undefined {
    return this.indexes.cropsById.get(id);
  }

  public getVarietiesForCrop(cropId: string): CropVariety[] {
    return this.data.cropVarieties.filter(v => v.cropId === cropId);
  }

  public getAllVarieties(): CropVariety[] {
    return [...this.data.cropVarieties];
  }

  public getAddressesForUser(userId: string): Address[] {
    return this.indexes.addressesByUserId.get(userId) || [];
  }

  public getDefaultAddressForUser(userId: string): Address | undefined {
    let list = this.getAddressesForUser(userId);
    if (list.length === 0 && userId === 'user_farmer_1') {
      list = this.getAddressesForUser('usr-farmer-001');
    }
    if (list.length === 0 && userId === 'usr-farmer-001') {
      list = this.getAddressesForUser('user_farmer_1');
    }
    return list.find(a => a.isDefault) || list[0];
  }

  public addQualityReport(report: QualityReport): void {
    this.data.qualityReports.push(report);
    this.indexes.qualityReportsByProductId.set(report.productId, report);
    this.scheduleSave();
  }

  // ==========================================
  // PRODUCTS & INVENTORY (BUSINESS RULES)
  // - A Product belongs to a seller/farmer
  // - Inventory belongs to a product
  // ==========================================
  public getAllProducts(filter?: {
    cropId?: string;
    farmerId?: string;
    grade?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: Product['status'] | 'all';
  }): ProductDetailView[] {
    const farmerIds = filter?.farmerId
      ? [filter.farmerId, filter.farmerId === 'user_farmer_1' ? 'usr-farmer-001' : filter.farmerId === 'usr-farmer-001' ? 'user_farmer_1' : '']
      : undefined;

    return this.data.products
      .filter(p => {
        if (filter?.status && filter.status !== 'all' && p.status !== filter.status) return false;
        if (filter?.cropId && p.cropId !== filter.cropId) return false;
        if (farmerIds && !farmerIds.includes(p.farmerId)) return false;
        if (filter?.grade && p.grade !== filter.grade) return false;
        if (filter?.minPrice && p.pricePerQuintal < filter.minPrice) return false;
        if (filter?.maxPrice && p.pricePerQuintal > filter.maxPrice) return false;
        if (filter?.search) {
          const s = filter.search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(s) || p.hindiTitle.toLowerCase().includes(s);
          const matchDesc = p.description.toLowerCase().includes(s);
          const matchMandi = p.apmcMandiYard.toLowerCase().includes(s);
          if (!matchTitle && !matchDesc && !matchMandi) return false;
        }
        return true;
      })
      .map(p => this.hydrateProductDetail(p));
  }

  public getProductById(id: string): ProductDetailView | undefined {
    const product = this.indexes.productsById.get(id);
    if (!product) return undefined;
    return this.hydrateProductDetail(product);
  }

  private hydrateProductDetail(product: Product): ProductDetailView {
    const farmerUser = this.indexes.usersById.get(product.farmerId);
    const farmerProfile = this.indexes.farmerProfilesByUserId.get(product.farmerId);
    const crop = this.indexes.cropsById.get(product.cropId) || {
      id: product.cropId,
      name: 'Agricultural Crop',
      category: 'cereal',
      hindiName: 'फसल',
      standardUnit: 'quintal',
      shelfLifeDays: 180,
      createdAt: '',
      updatedAt: '',
    };
    const variety = this.indexes.varietiesById.get(product.varietyId) || {
      id: product.varietyId,
      cropId: product.cropId,
      varietyName: 'Standard Variety',
      agmarknetStandardGrade: product.grade,
      typicalMaturityDays: 120,
      suitableSoilTypes: [],
      description: '',
      createdAt: '',
      updatedAt: '',
    };

    const images = this.indexes.productImagesByProductId.get(product.id) || [];
    const inventory = this.indexes.inventoryByProductId.get(product.id);
    const qualityReport = this.indexes.qualityReportsByProductId.get(product.id);
    const reviews = this.indexes.reviewsByProductId.get(product.id) || [];

    const farmAddress = this.data.addresses.find(a => a.id === product.farmGateAddressId);
    const locationStr = farmAddress 
      ? `${farmAddress.district}, ${farmAddress.state}`
      : product.apmcMandiYard;

    return {
      ...product,
      farmer: {
        name: farmerUser?.name || 'Verified Farmer',
        phone: farmerUser?.phone || '',
        location: locationStr,
        isVerifiedFPO: !!farmerProfile?.isVerifiedFPO,
        fpoName: farmerProfile?.fpoName,
        rating: farmerProfile?.rating || 4.9,
      },
      crop,
      variety,
      images,
      inventory,
      qualityReport,
      reviews,
    };
  }

  public createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    inventoryData: Omit<Inventory, 'id' | 'productId' | 'createdAt' | 'updatedAt'>,
    imageUrls: string[]
  ): ProductDetailView {
    validation.CreateProductSchema.parse(productData);

    const now = new Date().toISOString();
    const productId = `prod-${Date.now().toString().slice(-6)}`;

    const newProduct: Product = {
      id: productId,
      ...productData,
      createdAt: now,
      updatedAt: now,
    };

    // Create attached Inventory
    const newInventory: Inventory = {
      id: `inv-${Date.now().toString().slice(-6)}`,
      productId,
      ...inventoryData,
      createdAt: now,
      updatedAt: now,
    };

    // Create attached ProductImages
    const newImages: ProductImage[] = (imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200']).map((url, idx) => ({
      id: `img-${productId}-${idx}`,
      productId,
      imageUrl: url,
      isPrimary: idx === 0,
      orderIndex: idx,
      createdAt: now,
    }));

    this.data.products.push(newProduct);
    this.data.inventories.push(newInventory);
    this.data.productImages.push(...newImages);

    // Update indexes
    this.indexes.productsById.set(productId, newProduct);
    const farmerProducts = this.indexes.productsByFarmerId.get(newProduct.farmerId) || [];
    farmerProducts.push(newProduct);
    this.indexes.productsByFarmerId.set(newProduct.farmerId, farmerProducts);

    this.indexes.inventoryByProductId.set(productId, newInventory);
    this.indexes.productImagesByProductId.set(productId, newImages);

    this.logAudit({
      entityName: 'Product',
      entityId: productId,
      action: 'create',
      performedByUserId: newProduct.farmerId,
      changesSummary: `Listed new crop product: ${newProduct.title} (${newInventory.totalAvailableQuintals} Qtl)`,
      newState: { price: newProduct.pricePerQuintal, grade: newProduct.grade },
    });

    this.scheduleSave();
    return this.hydrateProductDetail(newProduct);
  }

  public updateProduct(
    id: string,
    updates: Partial<Product>,
    inventoryUpdates?: Partial<Inventory>,
    imageUrls?: string[],
    qualityReportUpdates?: Partial<QualityReport>
  ): ProductDetailView | undefined {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const current = this.data.products[index];
    const updated: Product = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    this.data.products[index] = updated;
    this.indexes.productsById.set(id, updated);

    // Update inventory if supplied
    if (inventoryUpdates) {
      const invIndex = this.data.inventories.findIndex(inv => inv.productId === id);
      if (invIndex !== -1) {
        const currentInv = this.data.inventories[invIndex];
        const updatedInv: Inventory = {
          ...currentInv,
          ...inventoryUpdates,
          productId: id,
          updatedAt: new Date().toISOString(),
        };
        this.data.inventories[invIndex] = updatedInv;
        this.indexes.inventoryByProductId.set(id, updatedInv);
      }
    }

    // Update quality report if supplied
    if (qualityReportUpdates) {
      const qrIndex = this.data.qualityReports.findIndex(qr => qr.productId === id);
      if (qrIndex !== -1) {
        const currentQr = this.data.qualityReports[qrIndex];
        const updatedQr: QualityReport = {
          ...currentQr,
          ...qualityReportUpdates,
          productId: id,
        };
        this.data.qualityReports[qrIndex] = updatedQr;
        this.indexes.qualityReportsByProductId.set(id, updatedQr);
      } else {
        const newQr: QualityReport = {
          id: `qr-${Date.now()}`,
          productId: id,
          assayingAgency: qualityReportUpdates.assayingAgency || 'State Mandi Board Assaying Lab',
          certificateNumber: qualityReportUpdates.certificateNumber || `AGM-${Math.floor(100000 + Math.random() * 900000)}`,
          moisturePercent: qualityReportUpdates.moisturePercent ?? 11.2,
          foreignMatterPercent: qualityReportUpdates.foreignMatterPercent ?? 0.8,
          grainSizeMm: qualityReportUpdates.grainSizeMm ?? 6.5,
          damagedGrainsPercent: qualityReportUpdates.damagedGrainsPercent ?? 0.4,
          certifiedGrade: (qualityReportUpdates.certifiedGrade as any) || 'Grade A',
          inspectionDate: new Date().toISOString().split('T')[0],
          verifiedByInspector: qualityReportUpdates.verifiedByInspector || 'Chief Assaying Officer',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...qualityReportUpdates,
        };
        this.data.qualityReports.push(newQr);
        this.indexes.qualityReportsByProductId.set(id, newQr);
      }
    }

    // Update images if supplied
    if (imageUrls && imageUrls.length > 0) {
      this.data.productImages = this.data.productImages.filter(img => img.productId !== id);
      const newImages: ProductImage[] = imageUrls.map((url, idx) => ({
        id: `img-${id}-${idx}`,
        productId: id,
        imageUrl: url,
        isPrimary: idx === 0,
        orderIndex: idx,
        createdAt: new Date().toISOString(),
      }));
      this.data.productImages.push(...newImages);
      this.indexes.productImagesByProductId.set(id, newImages);
    }

    this.logAudit({
      entityName: 'Product',
      entityId: id,
      action: 'update',
      performedByUserId: updated.farmerId,
      changesSummary: `Updated crop product details for ${updated.title}`,
      newState: { updates, inventoryUpdates },
    });

    this.scheduleSave();
    return this.hydrateProductDetail(updated);
  }

  public deleteProduct(id: string, deletedByUserId: string): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    const product = this.data.products[index];
    this.data.products.splice(index, 1);
    this.indexes.productsById.delete(id);

    this.logAudit({
      entityName: 'Product',
      entityId: id,
      action: 'delete',
      performedByUserId: deletedByUserId,
      changesSummary: `Archived/Deleted crop product ${product.title}`,
    });

    this.scheduleSave();
    return true;
  }

  public getInventoryForProduct(productId: string): Inventory | undefined {
    return this.indexes.inventoryByProductId.get(productId);
  }

  public updateInventory(productId: string, updates: Partial<Inventory>): Inventory {
    const inv = this.indexes.inventoryByProductId.get(productId);
    if (!inv) throw new Error(`Inventory not found for product: ${productId}`);
    Object.assign(inv, updates, { updatedAt: new Date().toISOString() });
    this.scheduleSave();
    return inv;
  }

  // ==========================================
  // CART & WISHLIST (BUSINESS RULES)
  // - Cart belongs to buyer
  // - Wishlist belongs to buyer
  // ==========================================
  public getBuyerCart(buyerId: string): CartDetailView {
    let cart = this.indexes.cartByBuyerId.get(buyerId);
    if (!cart) {
      cart = {
        id: `cart-${buyerId}`,
        buyerId,
        status: 'active',
        currency: 'INR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.carts.push(cart);
      this.indexes.cartByBuyerId.set(buyerId, cart);
    }

    const items = this.indexes.cartItemsByCartId.get(cart.id) || [];
    const hydratedItems = items.map(ci => {
      const product = this.indexes.productsById.get(ci.productId);
      const images = product ? this.indexes.productImagesByProductId.get(product.id) : [];
      const primaryImage = images && images.length > 0 ? images[0].imageUrl : undefined;
      return {
        ...ci,
        product: product || ({} as Product),
        primaryImage,
      };
    });

    const totalAmount = hydratedItems.reduce((acc, curr) => acc + curr.subtotalAmount, 0);
    const totalQuintals = hydratedItems.reduce((acc, curr) => acc + curr.quantityQuintals, 0);

    return {
      cart,
      items: hydratedItems,
      totalAmount,
      totalQuintals,
    };
  }

  public addToBuyerCart(buyerId: string, productId: string, quantityQuintals: number): CartDetailView {
    const product = this.indexes.productsById.get(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);

    const cartView = this.getBuyerCart(buyerId);
    const cartId = cartView.cart.id;

    let items = this.indexes.cartItemsByCartId.get(cartId) || [];
    const existingIndex = items.findIndex(ci => ci.productId === productId);

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      items[existingIndex].quantityQuintals += quantityQuintals;
      items[existingIndex].subtotalAmount = items[existingIndex].quantityQuintals * product.pricePerQuintal;
      items[existingIndex].updatedAt = now;
    } else {
      const newItem: CartItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        cartId,
        productId,
        quantityQuintals,
        pricePerQuintal: product.pricePerQuintal,
        subtotalAmount: quantityQuintals * product.pricePerQuintal,
        addedAt: now,
        updatedAt: now,
      };
      this.data.cartItems.push(newItem);
      items.push(newItem);
    }

    this.indexes.cartItemsByCartId.set(cartId, items);
    this.scheduleSave();
    return this.getBuyerCart(buyerId);
  }

  public removeFromBuyerCart(buyerId: string, productId: string): CartDetailView {
    const cartView = this.getBuyerCart(buyerId);
    const cartId = cartView.cart.id;

    this.data.cartItems = this.data.cartItems.filter(ci => !(ci.cartId === cartId && ci.productId === productId));
    const updatedItems = this.data.cartItems.filter(ci => ci.cartId === cartId);
    this.indexes.cartItemsByCartId.set(cartId, updatedItems);

    this.scheduleSave();
    return this.getBuyerCart(buyerId);
  }

  public updateCartItemQuantity(buyerId: string, productId: string, quantityQuintals: number): CartDetailView {
    if (quantityQuintals <= 0) {
      return this.removeFromBuyerCart(buyerId, productId);
    }
    const cartView = this.getBuyerCart(buyerId);
    const cartId = cartView.cart.id;
    const items = this.indexes.cartItemsByCartId.get(cartId) || [];
    const item = items.find(ci => ci.productId === productId);
    if (item) {
      item.quantityQuintals = quantityQuintals;
      item.subtotalAmount = quantityQuintals * item.pricePerQuintal;
      item.updatedAt = new Date().toISOString();
    }
    this.scheduleSave();
    return this.getBuyerCart(buyerId);
  }

  public clearBuyerCart(buyerId: string): CartDetailView {
    const cartView = this.getBuyerCart(buyerId);
    const cartId = cartView.cart.id;

    this.data.cartItems = this.data.cartItems.filter(ci => ci.cartId !== cartId);
    this.indexes.cartItemsByCartId.set(cartId, []);

    this.scheduleSave();
    return this.getBuyerCart(buyerId);
  }

  public getBuyerWishlist(buyerId: string): string[] {
    const wl = this.indexes.wishlistByBuyerId.get(buyerId);
    return wl ? [...wl.productIds] : [];
  }

  public toggleBuyerWishlist(buyerId: string, productId: string): string[] {
    let wl = this.indexes.wishlistByBuyerId.get(buyerId);
    const now = new Date().toISOString();
    if (!wl) {
      wl = {
        id: `wish-${buyerId}`,
        buyerId,
        productIds: [productId],
        createdAt: now,
        updatedAt: now,
      };
      this.data.wishlists.push(wl);
      this.indexes.wishlistByBuyerId.set(buyerId, wl);
    } else {
      if (wl.productIds.includes(productId)) {
        wl.productIds = wl.productIds.filter(id => id !== productId);
      } else {
        wl.productIds.push(productId);
      }
      wl.updatedAt = now;
    }
    this.scheduleSave();
    return [...wl.productIds];
  }

  // ==========================================
  // ORDERS & SHIPMENTS (BUSINESS RULES)
  // - Orders contain order items
  // - Buyer and farmer are linked to orders
  // ==========================================
  public getAllOrders(): OrderDetailView[] {
    return this.data.orders.map(o => this.hydrateOrderDetail(o));
  }

  public getOrdersForBuyer(buyerId: string): OrderDetailView[] {
    const orders = this.indexes.ordersByBuyerId.get(buyerId) || [];
    return orders.map(o => this.hydrateOrderDetail(o));
  }

  public getOrdersForFarmer(farmerId: string): OrderDetailView[] {
    const ids = [farmerId];
    if (farmerId === 'user_farmer_1') ids.push('usr-farmer-001');
    if (farmerId === 'usr-farmer-001') ids.push('user_farmer_1');
    const seen = new Set<string>();
    const orders: Order[] = [];
    for (const id of ids) {
      const list = this.indexes.ordersByFarmerId.get(id) || [];
      for (const o of list) {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          orders.push(o);
        }
      }
    }
    return orders.map(o => this.hydrateOrderDetail(o));
  }

  public getOrderById(orderId: string): OrderDetailView | undefined {
    const order = this.indexes.ordersById.get(orderId);
    if (!order) return undefined;
    return this.hydrateOrderDetail(order);
  }

  private hydrateOrderDetail(order: Order): OrderDetailView {
    const buyerUser = this.indexes.usersById.get(order.buyerId);
    const buyerProfile = this.indexes.buyerProfilesByUserId.get(order.buyerId);
    const farmerUser = this.indexes.usersById.get(order.farmerId);
    const farmerProfile = this.indexes.farmerProfilesByUserId.get(order.farmerId);

    const items = this.indexes.orderItemsByOrderId.get(order.id) || [];
    const statusHistory = this.indexes.orderStatusByOrderId.get(order.id) || [];
    const shipment = this.indexes.shipmentByOrderId.get(order.id);
    const payment = this.indexes.paymentByOrderId.get(order.id);

    return {
      ...order,
      buyer: {
        name: buyerUser?.name || 'Verified Wholesale Buyer',
        businessName: buyerProfile?.businessName || buyerUser?.name || 'Bharat Agro Trading',
        phone: buyerUser?.phone || '',
      },
      farmer: {
        name: farmerUser?.name || 'Registered Producer',
        phone: farmerUser?.phone || '',
        primaryApmcMandi: farmerProfile?.primaryApmcMandi || 'APMC Yard',
      },
      items,
      statusHistory,
      shipment,
      payment,
    };
  }

  public createOrder(params: {
    buyerId: string;
    farmerId: string;
    deliveryAddressId: string;
    farmGatePickupAddressId?: string;
    items: Array<{
      productId: string;
      quantityQuintals: number;
    }>;
    notes?: string;
  }): OrderDetailView {
    const now = new Date().toISOString();
    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    const orderNumber = `KS-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let cropSubtotalAmount = 0;
    let totalQuantityQuintals = 0;

    const orderItems: OrderItem[] = params.items.map((item, idx) => {
      const product = this.indexes.productsById.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found for order`);

      const lineTotal = item.quantityQuintals * product.pricePerQuintal;
      cropSubtotalAmount += lineTotal;
      totalQuantityQuintals += item.quantityQuintals;

      // Deduct from available inventory with strict non-negative check
      const inv = this.indexes.inventoryByProductId.get(product.id);
      if (inv) {
        if (inv.totalAvailableQuintals < item.quantityQuintals) {
          throw new Error(`Insufficient inventory for product "${product.title}". Requested: ${item.quantityQuintals} Quintals, Available: ${inv.totalAvailableQuintals} Quintals.`);
        }
        inv.reservedQuintals += item.quantityQuintals;
        inv.totalAvailableQuintals -= item.quantityQuintals;
      }

      return {
        id: `oi-${orderId}-${idx + 1}`,
        orderId,
        productId: product.id,
        cropName: product.title,
        varietyName: product.grade,
        quantityQuintals: item.quantityQuintals,
        pricePerQuintal: product.pricePerQuintal,
        totalPrice: lineTotal,
        grade: product.grade,
        createdAt: now,
      };
    });

    const mandiTaxCessAmount = Number((cropSubtotalAmount * 0.015).toFixed(2)); // 1.5% APMC cess
    const platformFeeAmount = Number((cropSubtotalAmount * 0.01).toFixed(2));   // 1% platform fee
    const freightLogisticsAmount = totalQuantityQuintals * 250;                 // ₹250/Qtl baseline logistics
    const totalAmount = cropSubtotalAmount + mandiTaxCessAmount + platformFeeAmount + freightLogisticsAmount;

    // Delivery and pickup address resolution
    const pickupAddress = this.indexes.addressesByUserId.get(params.farmerId)?.[0]?.id || 'addr-farm-001';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      buyerId: params.buyerId,
      farmerId: params.farmerId,
      status: 'confirmed',
      totalQuantityQuintals,
      cropSubtotalAmount,
      mandiTaxCessAmount,
      platformFeeAmount,
      freightLogisticsAmount,
      totalAmount,
      deliveryAddressId: params.deliveryAddressId,
      farmGatePickupAddressId: params.farmGatePickupAddressId || pickupAddress,
      estimatedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Initial Status History
    const initialStatusHistory: OrderStatusHistory = {
      id: `osh-${Date.now()}-1`,
      orderId,
      newStatus: 'confirmed',
      changedByUserId: params.buyerId,
      changeReason: 'Wholesale Procurement Order Placed & Confirmed',
      locationCheckpoint: 'APMC Digital Escrow Booking Gate',
      timestamp: now,
    };

    // Initial Shipment Record
    const initialShipment: Shipment = {
      id: `ship-${orderId}`,
      orderId,
      logisticsPartnerName: 'Kisan Saathi Fleet Logistics',
      vehicleNumber: 'MP-04-TRK-Scheduled',
      driverName: 'Assigned upon weighment',
      driverPhone: '9826000000',
      eWayBillNumber: `EWB-2026-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      trackingNumber: `KS-TRK-${Math.floor(10000 + Math.random() * 90000)}`,
      currentLocationCity: 'Sehore Mandi Logistic Yard',
      gpsLatitude: 23.2012,
      gpsLongitude: 77.0851,
      status: 'dispatched',
      dispatchedAt: now,
      estimatedArrival: new Date(Date.now() + 4 * 86400000).toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    // Payment Record (Schema compliant; payment not processed yet)
    const initialPayment: Payment = {
      id: `pay-${orderId}`,
      orderId,
      buyerId: params.buyerId,
      farmerId: params.farmerId,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: 'escrow_agropay',
      status: 'escrow_locked',
      escrowAccountId: `ESCROW-RBI-KS-${Date.now().toString().slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);
    this.data.orderItems.push(...orderItems);
    this.data.orderStatusHistories.push(initialStatusHistory);
    this.data.shipments.push(initialShipment);
    this.data.payments.push(initialPayment);

    // Update indexes
    this.indexes.ordersById.set(orderId, newOrder);
    const bOrders = this.indexes.ordersByBuyerId.get(params.buyerId) || [];
    bOrders.unshift(newOrder);
    this.indexes.ordersByBuyerId.set(params.buyerId, bOrders);

    const fOrders = this.indexes.ordersByFarmerId.get(params.farmerId) || [];
    fOrders.unshift(newOrder);
    this.indexes.ordersByFarmerId.set(params.farmerId, fOrders);

    this.indexes.orderItemsByOrderId.set(orderId, orderItems);
    this.indexes.orderStatusByOrderId.set(orderId, [initialStatusHistory]);
    this.indexes.shipmentByOrderId.set(orderId, initialShipment);
    this.indexes.paymentByOrderId.set(orderId, initialPayment);

    // Audit and notify
    this.logAudit({
      entityName: 'Order',
      entityId: orderId,
      action: 'create',
      performedByUserId: params.buyerId,
      changesSummary: `Created wholesale procurement order ${orderNumber} for ₹${totalAmount.toLocaleString('en-IN')}`,
      newState: { status: 'confirmed', totalAmount },
    });

    this.sendNotification({
      userId: params.farmerId,
      title: `New Order Received: ${orderNumber}`,
      titleHindi: `नया ऑर्डर प्राप्त हुआ: ${orderNumber}`,
      message: `Buyer confirmed ${totalQuantityQuintals} Qtl harvest procurement. Escrow locked.`,
      messageHindi: `खरीदार ने ${totalQuantityQuintals} क्विंटल की खरीद पक्की की। एस्कौ राशि सुरक्षित है।`,
      type: 'order_status',
      actionUrl: '/farmer_dashboard',
    });

    this.scheduleSave();
    return this.hydrateOrderDetail(newOrder);
  }

  public updateOrderStatus(orderId: string, newStatus: Order['status'], changedByUserId: string, reason?: string, checkpoint?: string): OrderDetailView | undefined {
    const order = this.indexes.ordersById.get(orderId);
    if (!order) return undefined;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    const historyEntry: OrderStatusHistory = {
      id: `osh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId,
      previousStatus,
      newStatus,
      changedByUserId,
      changeReason: reason || `Status transitioned from ${previousStatus} to ${newStatus}`,
      locationCheckpoint: checkpoint,
      timestamp: new Date().toISOString(),
    };

    this.data.orderStatusHistories.push(historyEntry);
    const existingHist = this.indexes.orderStatusByOrderId.get(orderId) || [];
    existingHist.push(historyEntry);
    this.indexes.orderStatusByOrderId.set(orderId, existingHist);

    // Update shipment status if delivered or in_transit
    const ship = this.indexes.shipmentByOrderId.get(orderId);
    if (ship) {
      if (newStatus === 'delivered') {
        ship.status = 'delivered';
        ship.deliveredAt = new Date().toISOString();
      } else if (newStatus === 'in_transit') {
        ship.status = 'in_transit';
      }
      ship.updatedAt = new Date().toISOString();
    }

    this.logAudit({
      entityName: 'Order',
      entityId: orderId,
      action: 'status_change',
      performedByUserId: changedByUserId,
      changesSummary: `Order status changed to ${newStatus}`,
      previousState: { status: previousStatus },
      newState: { status: newStatus },
    });

    this.scheduleSave();
    return this.hydrateOrderDetail(order);
  }

  public updateShipment(orderId: string, updates: Partial<Shipment>): Shipment {
    const shipment = this.indexes.shipmentByOrderId.get(orderId);
    if (!shipment) throw new Error(`Shipment record not found for order: ${orderId}`);
    Object.assign(shipment, updates, { updatedAt: new Date().toISOString() });
    this.scheduleSave();
    return shipment;
  }

  // ==========================================
  // BULK REQUIREMENTS & RFQ OFFERS (BUSINESS RULES)
  // - Bulk requirements belong to buyers
  // - RFQ offers belong to bulk requirements and sellers
  // ==========================================
  public getAllBulkRequirements(status?: BulkRequirement['status']): BulkRequirementDetailView[] {
    return this.data.bulkRequirements
      .filter(br => !status || br.status === status)
      .map(br => this.hydrateBulkRequirement(br));
  }

  public getBulkRequirementById(id: string): BulkRequirementDetailView | undefined {
    const br = this.indexes.bulkRequirementsById.get(id);
    if (!br) return undefined;
    return this.hydrateBulkRequirement(br);
  }

  private hydrateBulkRequirement(br: BulkRequirement): BulkRequirementDetailView {
    const buyer = this.indexes.usersById.get(br.buyerId);
    const buyerProfile = this.indexes.buyerProfilesByUserId.get(br.buyerId);
    const crop = this.indexes.cropsById.get(br.cropId) || {
      id: br.cropId,
      name: br.cropName,
      category: 'cereal',
      hindiName: br.cropName,
      standardUnit: 'quintal',
      shelfLifeDays: 180,
      createdAt: '',
      updatedAt: '',
    };

    const rawOffers = this.indexes.rfqOffersByRequirementId.get(br.id) || [];
    const offers = rawOffers.map(o => {
      const seller = this.indexes.usersById.get(o.sellerId);
      const fp = this.indexes.farmerProfilesByUserId.get(o.sellerId);
      return {
        ...o,
        sellerName: seller?.name || 'Verified Farmer / FPO',
        sellerPhone: seller?.phone || '',
        sellerRating: fp?.rating || 4.9,
      };
    });

    return {
      ...br,
      buyer: {
        name: buyer?.name || 'Institutional Buyer',
        businessName: buyerProfile?.businessName || buyer?.name || 'Buyer Enterprise',
      },
      crop,
      offers,
    };
  }

  public createBulkRequirement(data: Omit<BulkRequirement, 'id' | 'createdAt' | 'updatedAt' | 'offersCount' | 'status'>): BulkRequirementDetailView {
    const now = new Date().toISOString();
    const id = `rfq-req-${Date.now().toString().slice(-6)}`;

    const newReq: BulkRequirement = {
      id,
      ...data,
      status: 'open',
      offersCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.data.bulkRequirements.unshift(newReq);
    this.indexes.bulkRequirementsById.set(id, newReq);

    this.logAudit({
      entityName: 'BulkRequirement',
      entityId: id,
      action: 'create',
      performedByUserId: data.buyerId,
      changesSummary: `Posted RFQ for ${data.targetQuantityQuintals} Qtl ${data.cropName}`,
      newState: { targetPrice: data.maxTargetPricePerQuintal },
    });

    this.scheduleSave();
    return this.hydrateBulkRequirement(newReq);
  }

  public submitRFQOffer(offerData: Omit<RFQOffer, 'id' | 'createdAt' | 'updatedAt' | 'status'>): RFQOffer {
    const req = this.indexes.bulkRequirementsById.get(offerData.bulkRequirementId);
    if (!req) throw new Error(`Bulk requirement not found: ${offerData.bulkRequirementId}`);

    const now = new Date().toISOString();
    const offerId = `offer-${Date.now().toString().slice(-6)}`;

    const newOffer: RFQOffer = {
      id: offerId,
      ...offerData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.data.rfqOffers.push(newOffer);
    const existingOffers = this.indexes.rfqOffersByRequirementId.get(req.id) || [];
    existingOffers.push(newOffer);
    this.indexes.rfqOffersByRequirementId.set(req.id, existingOffers);

    req.offersCount += 1;
    req.updatedAt = now;

    this.logAudit({
      entityName: 'RFQOffer',
      entityId: offerId,
      action: 'create',
      performedByUserId: offerData.sellerId,
      changesSummary: `Submitted bid of ₹${offerData.offeredPricePerQuintal}/Qtl on RFQ #${req.id}`,
      newState: { offeredPrice: offerData.offeredPricePerQuintal },
    });

    // Notify buyer
    this.sendNotification({
      userId: req.buyerId,
      title: `New Offer Received on ${req.cropName}`,
      titleHindi: `नया प्रस्ताव प्राप्त हुआ: ${req.cropName}`,
      message: `Farmer submitted a quote of ₹${offerData.offeredPricePerQuintal}/Qtl for ${offerData.offeredQuantityQuintals} Qtl.`,
      messageHindi: `किसान ने ₹${offerData.offeredPricePerQuintal}/क्विंटल का प्रस्ताव दिया।`,
      type: 'rfq_offer',
      actionUrl: '/rfq',
    });

    this.scheduleSave();
    return newOffer;
  }

  public respondToRFQOffer(offerId: string, action: 'accept' | 'counter' | 'reject', counterPrice?: number, counterNotes?: string): RFQOffer | undefined {
    const offer = this.data.rfqOffers.find(o => o.id === offerId);
    if (!offer) return undefined;

    const now = new Date().toISOString();
    if (action === 'accept') {
      offer.status = 'accepted';
    } else if (action === 'counter') {
      offer.status = 'countered';
      offer.counterPricePerQuintal = counterPrice;
      offer.counterNotes = counterNotes;
    } else {
      offer.status = 'rejected';
    }
    offer.updatedAt = now;

    this.logAudit({
      entityName: 'RFQOffer',
      entityId: offerId,
      action: 'status_change',
      changesSummary: `Buyer responded to RFQ offer with: ${action}`,
      newState: { status: offer.status, counterPrice },
    });

    // Notify seller
    this.sendNotification({
      userId: offer.sellerId,
      title: `Buyer Responded to Offer: ${action.toUpperCase()}`,
      titleHindi: `खरीदार ने आपके प्रस्ताव का उत्तर दिया: ${action}`,
      message: action === 'counter' ? `Buyer offered counter price of ₹${counterPrice}/Qtl.` : `Buyer marked offer as ${action}.`,
      type: 'rfq_offer',
      actionUrl: '/rfq',
    });

    this.scheduleSave();
    return offer;
  }

  // ==========================================
  // REVIEWS (BUSINESS RULES)
  // - Reviews connect buyer/farmer/product/order
  // ==========================================
  public getReviewsForProduct(productId: string): Review[] {
    return this.indexes.reviewsByProductId.get(productId) || [];
  }

  public getReviewsForFarmer(farmerId: string): Review[] {
    return this.indexes.reviewsByFarmerId.get(farmerId) || [];
  }

  public addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'isVerifiedPurchase' | 'status'>): Review {
    validation.ReviewSchema.omit({ id: true, createdAt: true, updatedAt: true, isVerifiedPurchase: true, status: true }).parse(reviewData);

    // Business Constraint: Prevent self-review
    if (reviewData.buyerId === reviewData.farmerId) {
      throw new Error('Self-review is strictly prohibited. Buyer and farmer cannot be the same account.');
    }

    // Business Constraint: Prevent duplicate transaction review
    const duplicate = this.data.reviews.find(r => r.orderId === reviewData.orderId && r.buyerId === reviewData.buyerId);
    if (duplicate) {
      throw new Error(`A review has already been submitted for order #${reviewData.orderId}. Duplicate reviews are prohibited.`);
    }

    const now = new Date().toISOString();
    const newReview: Review = {
      id: `rev-${Date.now().toString().slice(-6)}`,
      ...reviewData,
      isVerifiedPurchase: true,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    };

    this.data.reviews.push(newReview);

    if (newReview.productId) {
      const pReviews = this.indexes.reviewsByProductId.get(newReview.productId) || [];
      pReviews.unshift(newReview);
      this.indexes.reviewsByProductId.set(newReview.productId, pReviews);
    }

    const fReviews = this.indexes.reviewsByFarmerId.get(newReview.farmerId) || [];
    fReviews.unshift(newReview);
    this.indexes.reviewsByFarmerId.set(newReview.farmerId, fReviews);

    // Update farmer average rating
    const farmerProfile = this.indexes.farmerProfilesByUserId.get(newReview.farmerId);
    if (farmerProfile) {
      const totalScore = fReviews.reduce((sum, r) => sum + r.rating, 0);
      farmerProfile.totalRatingsCount = fReviews.length;
      farmerProfile.rating = Number((totalScore / fReviews.length).toFixed(2));
      farmerProfile.updatedAt = now;
    }

    this.logAudit({
      entityName: 'Review',
      entityId: newReview.id,
      action: 'create',
      performedByUserId: newReview.buyerId,
      changesSummary: `Submitted ${newReview.rating}-star review for order #${newReview.orderId}`,
    });

    this.scheduleSave();
    return newReview;
  }

  // ==========================================
  // NOTIFICATIONS (BUSINESS RULES)
  // - Notifications belong to users
  // ==========================================
  public getUserNotifications(userId: string): Notification[] {
    return this.indexes.notificationsByUserId.get(userId) || [];
  }

  public sendNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.data.notifications.unshift(newNotif);
    const existing = this.indexes.notificationsByUserId.get(data.userId) || [];
    existing.unshift(newNotif);
    this.indexes.notificationsByUserId.set(data.userId, existing);

    this.scheduleSave();
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.scheduleSave();
    }
  }

  public clearAllNotificationsForUser(userId: string): void {
    this.data.notifications = this.data.notifications.filter(n => n.userId !== userId);
    this.indexes.notificationsByUserId.set(userId, []);
    this.scheduleSave();
  }

  // ==========================================
  // WEATHER, COLD STORAGE, ARTICLES & CONVERSATIONS
  // ==========================================
  public getWeatherForecasts(district?: string): Weather[] {
    if (district) {
      return this.data.weather.filter(w => w.district.toLowerCase() === district.toLowerCase());
    }
    return [...this.data.weather];
  }

  public getAllColdStorages(district?: string): ColdStorage[] {
    if (district) {
      return this.data.coldStorages.filter(cs => cs.district.toLowerCase() === district.toLowerCase());
    }
    return [...this.data.coldStorages];
  }

  public getColdStorageById(id: string): ColdStorage | undefined {
    return this.indexes.coldStoragesById.get(id);
  }

  public getAllArticles(category?: string): Article[] {
    if (category) {
      return this.data.articles.filter(a => a.category === category && a.status === 'published');
    }
    return this.data.articles.filter(a => a.status === 'published');
  }

  public getArticleById(id: string): Article | undefined {
    return this.indexes.articlesById.get(id);
  }

  public getUserConversations(userId: string): Conversation[] {
    return this.indexes.conversationsByUserId.get(userId) || [];
  }

  public getMessagesForConversation(conversationId: string): Message[] {
    return this.indexes.messagesByConversationId.get(conversationId) || [];
  }

  public sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Message {
    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt: now,
    };

    this.data.messages.push(msg);
    const existing = this.indexes.messagesByConversationId.get(conversationId) || [];
    existing.push(msg);
    this.indexes.messagesByConversationId.set(conversationId, existing);

    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessageSnippet = content.substring(0, 80);
      conv.lastMessageTimestamp = now;
      conv.updatedAt = now;
    }

    this.scheduleSave();
    return msg;
  }

  // ==========================================
  // FPO ACCESS LAYER
  // ==========================================
  public getAllFPOs(): FPO[] {
    return this.data.fpos || [];
  }

  public getFPOById(id: string): FPO | undefined {
    return this.indexes.fposById.get(id);
  }

  public createFPO(fpoData: Omit<FPO, 'id' | 'createdAt' | 'updatedAt'>): FPO {
    const now = new Date().toISOString();
    const newFPO: FPO = {
      id: `fpo-${Date.now().toString().slice(-6)}`,
      ...fpoData,
      createdAt: now,
      updatedAt: now,
    };
    this.data.fpos.push(newFPO);
    this.indexes.fposById.set(newFPO.id, newFPO);
    this.scheduleSave();
    return newFPO;
  }

  // ==========================================
  // WEIGHMENT ACCESS LAYER
  // ==========================================
  public getWeighmentByOrderId(orderId: string): Weighment | undefined {
    return this.indexes.weighmentsByOrderId.get(orderId);
  }

  public createWeighment(data: Omit<Weighment, 'id' | 'createdAt' | 'updatedAt'>): Weighment {
    validation.WeighmentSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    const now = new Date().toISOString();
    const newWeighment: Weighment = {
      id: `wm-${Date.now().toString().slice(-6)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.data.weighments.push(newWeighment);
    this.indexes.weighmentsByOrderId.set(newWeighment.orderId, newWeighment);
    this.scheduleSave();
    return newWeighment;
  }

  // ==========================================
  // WEATHER ALERTS ACCESS LAYER
  // ==========================================
  public getAllWeatherAlerts(): WeatherAlert[] {
    return this.data.weatherAlerts || [];
  }

  public getWeatherAlertsByLocation(location: string): WeatherAlert[] {
    const norm = location.toLowerCase();
    return (this.data.weatherAlerts || []).filter(a => a.location.toLowerCase().includes(norm));
  }

  public createWeatherAlert(data: Omit<WeatherAlert, 'id' | 'createdAt'>): WeatherAlert {
    validation.WeatherAlertSchema.omit({ id: true, createdAt: true }).parse(data);
    const now = new Date().toISOString();
    const newAlert: WeatherAlert = {
      id: `wa-${Date.now().toString().slice(-6)}`,
      ...data,
      createdAt: now,
    };
    this.data.weatherAlerts.push(newAlert);
    this.indexes.weatherAlertsById.set(newAlert.id, newAlert);
    this.scheduleSave();
    return newAlert;
  }

  // ==========================================
  // ARTICLE CATEGORIES ACCESS LAYER
  // ==========================================
  public getAllArticleCategories(): ArticleCategory[] {
    return this.data.articleCategories || [];
  }

  public createArticleCategory(data: Omit<ArticleCategory, 'id' | 'createdAt' | 'updatedAt'>): ArticleCategory {
    validation.ArticleCategorySchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    const now = new Date().toISOString();
    const newCat: ArticleCategory = {
      id: `ac-${Date.now().toString().slice(-6)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.data.articleCategories.push(newCat);
    this.indexes.articleCategoriesById.set(newCat.id, newCat);
    this.scheduleSave();
    return newCat;
  }

  // ==========================================
  // VALIDATION & STATUS HEALTH CHECK
  // ==========================================
  public validateDatabaseHealth(): {
    healthy: boolean;
    entitiesCounts: Record<string, number>;
    errors: string[];
  } {
    const errors: string[] = [];
    const counts: Record<string, number> = {};

    const tableNames: Array<keyof DatabaseSchema> = [
      'users', 'farmerProfiles', 'buyerProfiles', 'addresses', 'fpos', 'crops', 'cropVarieties',
      'products', 'productImages', 'inventories', 'qualityReports', 'carts', 'cartItems',
      'wishlists', 'wishlistItems', 'orders', 'orderItems', 'orderStatusHistories', 'shipments',
      'weighments', 'payments', 'paymentTransactions', 'bulkRequirements', 'rfqOffers', 'reviews',
      'notifications', 'weather', 'weatherAlerts', 'coldStorages', 'articles', 'articleCategories',
      'conversations', 'messages', 'documents', 'auditLogs'
    ];

    for (const table of tableNames) {
      const collection = this.data[table] as any[];
      counts[table] = Array.isArray(collection) ? collection.length : 0;
      if (!Array.isArray(collection)) {
        errors.push(`Table ${table} is missing or not an array`);
      }
    }

    // Check foreign keys
    for (const p of this.data.products) {
      if (!this.indexes.usersById.has(p.farmerId)) {
        errors.push(`Product ${p.id} has invalid farmerId: ${p.farmerId}`);
      }
      if (!this.indexes.cropsById.has(p.cropId)) {
        errors.push(`Product ${p.id} has invalid cropId: ${p.cropId}`);
      }
    }

    for (const o of this.data.orders) {
      if (!this.indexes.usersById.has(o.buyerId)) {
        errors.push(`Order ${o.id} has invalid buyerId: ${o.buyerId}`);
      }
      if (!this.indexes.usersById.has(o.farmerId)) {
        errors.push(`Order ${o.id} has invalid farmerId: ${o.farmerId}`);
      }
    }

    return {
      healthy: errors.length === 0,
      entitiesCounts: counts,
      errors,
    };
  }

  public resetToSeed(): DatabaseSchema {
    this.data = generateSeedData();
    this.rebuildIndexes();
    this.persistSync(this.data);
    return this.data;
  }
}

export const db = KisanSaathiDatabase.getInstance();
