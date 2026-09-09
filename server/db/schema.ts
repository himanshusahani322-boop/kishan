/**
 * Kisan Saathi Core Enterprise Agricultural Database Schema
 * Comprehensive 30-Entity Relational Data Model
 */

// 1. User
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'farmer' | 'buyer' | 'admin';
  avatar?: string;
  status: 'active' | 'pending_verification' | 'suspended';
  preferredLanguage: 'en' | 'hi';
  createdAt: string;
  updatedAt: string;
}

// 2. FarmerProfile
export interface FarmerProfile {
  id: string;
  userId: string; // FK -> User.id
  farmName?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farmSize?: number;
  farmSizeUnit?: 'acres' | 'hectares' | 'bigha';
  fpoId?: string; // FK -> FPO.id
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  fpoName?: string;
  fpoRegistrationNumber?: string;
  isVerifiedFPO: boolean;
  primaryApmcMandi: string;
  landSizeAcres: number;
  farmingType: 'organic' | 'conventional' | 'natural';
  certifications: string[];
  bankAccountDetails?: {
    accountHolder: string;
    accountNumberMasked: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
  rating: number;
  totalRatingsCount: number;
  totalCropsListed: number;
  totalOrdersFulfilled: number;
  createdAt: string;
  updatedAt: string;
}

// 3. BuyerProfile
export interface BuyerProfile {
  id: string;
  userId: string; // FK -> User.id
  businessName: string;
  businessType: 'trader' | 'food_processor' | 'exporter' | 'retail_chain' | 'aggregator';
  gstNumber?: string;
  panNumber?: string;
  tradeLicenseNumber?: string;
  businessAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  isGstVerified: boolean;
  creditLimitAmount: number;
  creditBalanceAmount: number;
  preferredCommodities: string[];
  rating: number;
  totalRatingsCount: number;
  totalProcuredQuintals: number;
  createdAt: string;
  updatedAt: string;
}

// 4. FPO (Farmer Producer Organization)
export interface FPO {
  id: string;
  name: string;
  registrationNumber?: string;
  description: string;
  district: string;
  state: string;
  contact: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// 4. Address
export interface Address {
  id: string;
  userId: string; // FK -> User.id
  type: 'farm_gate' | 'warehouse' | 'billing' | 'delivery' | 'apmc_yard';
  addressLine1: string;
  addressLine2?: string;
  villageOrTehsil?: string;
  cityOrTown: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 5. Crop
export interface Crop {
  id: string;
  name: string;
  slug?: string;
  scientificName?: string;
  category: 'cereal' | 'pulse' | 'oilseed' | 'spice' | 'fruit' | 'vegetable' | 'cash_crop';
  hindiName: string;
  iconName?: string;
  standardUnit: 'quintal' | 'metric_tonne' | 'kg' | 'crate';
  shelfLifeDays: number;
  mspPricePerQuintal?: number;
  createdAt: string;
  updatedAt: string;
}

// 6. CropVariety
export interface CropVariety {
  id: string;
  cropId: string; // FK -> Crop.id
  varietyName: string;
  agmarknetStandardGrade: string;
  typicalMaturityDays: number;
  suitableSoilTypes: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Product (Belongs to seller/farmer)
export interface Product {
  id: string;
  farmerId: string; // FK -> User.id (farmer)
  sellerId?: string; // FK -> User.id (farmer) alias
  farmerProfileId: string; // FK -> FarmerProfile.id
  cropId: string; // FK -> Crop.id
  varietyId: string; // FK -> CropVariety.id
  title: string;
  hindiTitle?: string;
  description: string;
  grade: 'Grade A+' | 'Grade A' | 'Grade B' | 'Standard FAQ';
  quality?: string;
  pricePerQuintal: number;
  price?: number;
  priceUnit?: string;
  mandiBenchmarkPrice: number;
  unit: 'quintal' | 'kg' | 'tonne';
  quantity?: number;
  quantityUnit?: string;
  minimumOrderQuantity?: number;
  availabilityStatus?: string;
  harvestDate: string;
  pickupLocation?: string;
  storageInformation?: string;
  dispatchWindowDays: number;
  organicCertified: boolean;
  apmcMandiYard: string;
  farmGateAddressId: string; // FK -> Address.id
  status: 'active' | 'draft' | 'paused' | 'sold_out' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// 8. ProductImage
export interface ProductImage {
  id: string;
  productId: string; // FK -> Product.id
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  orderIndex: number;
  createdAt: string;
}

// 9. Inventory (Belongs to product)
export interface Inventory {
  id: string;
  productId: string; // FK -> Product.id
  batchLotNumber: string;
  totalAvailableQuintals: number;
  reservedQuintals: number;
  soldQuintals: number;
  minOrderQuantityQuintals: number;
  maxOrderQuantityQuintals?: number;
  moisturePercentage: number;
  warehouseLocation: string;
  storageConditions: string;
  status: 'in_stock' | 'low_stock' | 'reserved' | 'depleted';
  createdAt: string;
  updatedAt: string;
}

// 10. QualityReport
export interface QualityReport {
  id: string;
  productId: string; // FK -> Product.id
  inventoryLotId?: string; // FK -> Inventory.id
  assayingAgency: string;
  certificateNumber: string;
  moisturePercent: number;
  foreignMatterPercent: number;
  grainSizeMm: number;
  damagedGrainsPercent: number;
  proteinPercent?: number;
  certifiedGrade: 'Grade A+' | 'Grade A' | 'Grade B' | 'Fair Average Quality (FAQ)';
  inspectionDate: string;
  verifiedByInspector: string;
  reportDocumentUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 11. Cart (Belongs to buyer)
export interface Cart {
  id: string;
  buyerId: string; // FK -> User.id (buyer)
  status: 'active' | 'checked_out' | 'abandoned';
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// 12. CartItem
export interface CartItem {
  id: string;
  cartId: string; // FK -> Cart.id
  productId: string; // FK -> Product.id
  quantityQuintals: number;
  quantity?: number;
  unit?: string;
  pricePerQuintal: number;
  subtotalAmount: number;
  addedAt: string;
  updatedAt: string;
}

// 13. Wishlist (Belongs to buyer)
export interface Wishlist {
  id: string;
  buyerId: string; // FK -> User.id (buyer)
  productIds: string[]; // FKs -> Product.id
  createdAt: string;
  updatedAt: string;
}

// 14. WishlistItem
export interface WishlistItem {
  id: string;
  wishlistId: string; // FK -> Wishlist.id
  productId: string; // FK -> Product.id
  createdAt: string;
}

// 15. Order (Contains OrderItems; Buyer and Farmer linked to Order)
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string; // FK -> User.id (buyer)
  farmerId: string; // FK -> User.id (farmer)
  shippingAddressId?: string; // FK -> Address.id
  deliveryAddressId: string; // FK -> Address.id
  farmGatePickupAddressId: string; // FK -> Address.id
  status: 'pending_confirmation' | 'confirmed' | 'weighment_pending' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
  totalQuantityQuintals: number;
  cropSubtotalAmount: number;
  subtotal?: number;
  taxes?: number;
  freight?: number;
  insurance?: number;
  mandiTaxCessAmount: number;
  platformFeeAmount: number;
  freightLogisticsAmount: number;
  totalAmount: number;
  currency?: string;
  paymentStatus?: 'pending' | 'escrow_locked' | 'paid' | 'failed' | 'refunded';
  weighbridgeSlipNumber?: string;
  certifiedWeightQuintals?: number;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 16. OrderItem
export interface OrderItem {
  id: string;
  orderId: string; // FK -> Order.id
  productId: string; // FK -> Product.id
  sellerId?: string; // FK -> User.id (farmer)
  cropName: string;
  varietyName: string;
  quantityQuintals: number;
  quantity?: number;
  unit?: string;
  pricePerQuintal: number;
  unitPrice?: number;
  totalPrice: number;
  subtotal?: number;
  grade: string;
  createdAt: string;
}

// 17. OrderStatusHistory
export interface OrderStatusHistory {
  id: string;
  orderId: string; // FK -> Order.id
  oldStatus?: string;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  changedByUserId: string; // FK -> User.id
  changeReason?: string;
  note?: string;
  locationCheckpoint?: string;
  timestamp: string;
  createdAt?: string;
}

// 18. Shipment
export interface Shipment {
  id: string;
  orderId: string; // FK -> Order.id
  transporter?: string;
  logisticsPartnerName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  eWayBillNumber: string;
  trackingNumber: string;
  currentLocationCity: string;
  gpsLatitude: number;
  gpsLongitude: number;
  status: 'dispatched' | 'at_weighbridge' | 'in_transit' | 'out_for_delivery' | 'delivered';
  dispatchedAt: string;
  estimatedArrival: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  weighbridgeGrossKg?: number;
  weighbridgeTareKg?: number;
  weighbridgeNetKg?: number;
  weighbridgeSlipImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 19. Weighment
export interface Weighment {
  id: string;
  orderId: string; // FK -> Order.id
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  unit: string;
  weighmentSlipUrl?: string;
  verifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 20. Payment (Schema established; payment not processed yet)
export interface Payment {
  id: string;
  orderId: string; // FK -> Order.id
  buyerId: string; // FK -> User.id
  farmerId: string; // FK -> User.id
  provider?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: 'INR' | string;
  paymentMethod: 'escrow_agropay' | 'neft_rtgs' | 'upi_collect' | 'letter_of_credit';
  status: 'created' | 'escrow_locked' | 'disbursed' | 'refunded' | 'failed' | 'pending';
  escrowAccountId?: string;
  escrowReleasedAt?: string;
  payoutTransactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 21. PaymentTransaction
export interface PaymentTransaction {
  id: string;
  paymentId: string; // FK -> Payment.id
  orderId: string; // FK -> Order.id
  transactionReference?: string;
  transactionType: 'escrow_hold' | 'escrow_release' | 'mandi_cess_deduction' | 'platform_commission' | 'refund';
  amount: number;
  currency: 'INR' | string;
  status: 'initiated' | 'success' | 'failed' | 'processing';
  gatewayReferenceId?: string;
  providerResponseReference?: string;
  bankUtrNumber?: string;
  failureReason?: string;
  timestamp: string;
  createdAt?: string;
}

// 20. BulkRequirement (Belongs to buyers)
export interface BulkRequirement {
  id: string;
  buyerId: string; // FK -> User.id (buyer)
  buyerProfileId: string; // FK -> BuyerProfile.id
  cropId: string; // FK -> Crop.id
  varietyId?: string; // FK -> CropVariety.id
  cropName: string;
  targetQuantityQuintals: number;
  minTargetPricePerQuintal: number;
  maxTargetPricePerQuintal: number;
  preferredGrade: string;
  maxMoistureAllowedPercent: number;
  deliveryLocationCity: string;
  deliveryState: string;
  requiredByDate: string;
  status: 'open' | 'negotiating' | 'partially_fulfilled' | 'fulfilled' | 'closed' | 'expired';
  offersCount: number;
  specialSpecifications?: string;
  createdAt: string;
  updatedAt: string;
}

// 21. RFQOffer (Belongs to bulk requirements and sellers)
export interface RFQOffer {
  id: string;
  bulkRequirementId: string; // FK -> BulkRequirement.id
  sellerId: string; // FK -> User.id (seller/farmer)
  farmerProfileId: string; // FK -> FarmerProfile.id
  offeredQuantityQuintals: number;
  offeredPricePerQuintal: number;
  estimatedDeliveryDays: number;
  sampleAvailable: boolean;
  notes: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'withdrawn';
  counterPricePerQuintal?: number;
  counterNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// 22. Review (Connects buyer/farmer/product/order)
export interface Review {
  id: string;
  reviewerId?: string; // FK -> User.id
  revieweeId?: string; // FK -> User.id
  buyerId: string; // FK -> User.id
  farmerId: string; // FK -> User.id
  productId?: string; // FK -> Product.id
  orderId: string; // FK -> Order.id
  rating: number; // 1-5
  communicationRating?: number;
  qualityRating: number;
  reliabilityRating?: number;
  accuracyRating?: number;
  deliveryPromptnessRating?: number;
  packagingRating?: number;
  comment: string;
  isVerifiedPurchase: boolean;
  farmerResponseComment?: string;
  farmerRespondedAt?: string;
  status: 'published' | 'hidden_for_review' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

// 23. Notification (Belongs to users)
export interface Notification {
  id: string;
  userId: string; // FK -> User.id
  title: string;
  titleHindi?: string;
  message: string;
  messageHindi?: string;
  type: 'order_status' | 'rfq_offer' | 'price_alert' | 'escrow_update' | 'advisory' | 'system' | string;
  isRead: boolean;
  readAt?: string;
  data?: Record<string, any>;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// 24. Weather
export interface Weather {
  id: string;
  district: string;
  state: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  sunrise?: string;
  sunset?: string;
  forecastData?: any;
  fetchedAt?: string;
  forecastDate: string;
  temperatureMinCelsius: number;
  temperatureMaxCelsius: number;
  humidityPercent: number;
  rainfallMm: number;
  windSpeedKmh: number;
  conditionSummary: 'sunny' | 'cloudy' | 'rainy' | 'thunderstorm' | 'heatwave';
  agriculturalAdvisory: string;
  agriculturalAdvisoryHindi: string;
  recordedAt: string;
}

// 25. WeatherAlert
export interface WeatherAlert {
  id: string;
  location: string;
  alertType: string;
  title: string;
  message: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  startTime: string;
  endTime: string;
  createdAt: string;
}

// 26. ColdStorage
export interface ColdStorage {
  id: string;
  name?: string;
  facilityName: string;
  description?: string;
  district: string;
  state: string;
  address: string;
  city?: string;
  pincode?: string;
  contactPerson: string;
  phone: string;
  contact?: string;
  storageType?: string;
  capacity?: number;
  availableCapacity?: number;
  price?: number;
  priceUnit?: string;
  operatingStatus?: string;
  totalCapacityMetricTonnes: number;
  availableCapacityMetricTonnes: number;
  temperatureRangeCelsius: string;
  humidityControl: boolean;
  ratePerBagPerMonthINR: number;
  suitableCommodities: string[];
  hasWarehouseReceiptFinance: boolean;
  latitude: number;
  longitude: number;
  isGovtSubsidized: boolean;
  createdAt: string;
  updatedAt: string;
}

// 27. ArticleCategory
export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// 28. Article
export interface Article {
  id: string;
  title: string;
  titleHindi?: string;
  slug?: string;
  categoryId?: string; // FK -> ArticleCategory.id
  authorId?: string; // FK -> User.id
  imageUrl?: string;
  category: 'crop_protection' | 'mandi_trends' | 'organic_farming' | 'government_schemes' | 'weather_alert' | string;
  summary: string;
  summaryHindi?: string;
  content?: string;
  contentMarkdown: string;
  contentMarkdownHindi?: string;
  authorName: string;
  authorDesignation?: string;
  coverImageUrl: string;
  tags: string[];
  publishedAt: string;
  readTimeMinutes: number;
  status: 'published' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// 29. Conversation
export interface Conversation {
  id: string;
  userId?: string; // FK -> User.id
  title?: string;
  participant1Id: string; // FK -> User.id
  participant2Id: string; // FK -> User.id
  contextType: 'product_negotiation' | 'rfq_negotiation' | 'order_inquiry' | 'general';
  contextReferenceId?: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

// 30. Message
export interface Message {
  id: string;
  conversationId: string; // FK -> Conversation.id
  senderId?: string; // FK -> User.id
  receiverId?: string; // FK -> User.id
  role?: 'USER' | 'ASSISTANT' | 'SYSTEM' | string;
  content: string;
  metadata?: Record<string, any>;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf' | 'quote';
  isRead?: boolean;
  createdAt: string;
}

// 31. Document
export interface Document {
  id: string;
  ownerUserId: string; // FK -> User.id
  userId?: string; // Alias FK -> User.id
  documentType: 'apmc_mandi_license' | 'fssai_cert' | 'weighbridge_slip' | 'eway_bill' | 'lab_quality_test' | 'bank_mandate' | string;
  type?: string;
  title: string;
  name?: string;
  referenceEntityId?: string;
  documentNumber?: string;
  fileUrl: string;
  url?: string;
  fileSizeBytes?: number;
  mimeType: string;
  status?: string;
  isVerified: boolean;
  verifiedByAdminId?: string; // FK -> User.id
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 32. AuditLog
export interface AuditLog {
  id: string;
  userId?: string; // FK -> User.id
  action: 'create' | 'update' | 'delete' | 'status_change' | 'escrow_lock' | 'escrow_release' | 'auth_login' | string;
  entityName: string;
  entityType?: string;
  entityId: string;
  performedByUserId?: string; // FK -> User.id
  ipAddress?: string;
  changesSummary?: string;
  metadata?: Record<string, any>;
  previousState?: any;
  newState?: any;
  timestamp: string;
  createdAt?: string;
}

/**
 * Enterprise Database Tables Map
 */
export interface DatabaseSchema {
  users: User[];
  farmerProfiles: FarmerProfile[];
  buyerProfiles: BuyerProfile[];
  addresses: Address[];
  fpos: FPO[];
  crops: Crop[];
  cropVarieties: CropVariety[];
  products: Product[];
  productImages: ProductImage[];
  inventories: Inventory[];
  qualityReports: QualityReport[];
  carts: Cart[];
  cartItems: CartItem[];
  wishlists: Wishlist[];
  wishlistItems: WishlistItem[];
  orders: Order[];
  orderItems: OrderItem[];
  orderStatusHistories: OrderStatusHistory[];
  shipments: Shipment[];
  weighments: Weighment[];
  payments: Payment[];
  paymentTransactions: PaymentTransaction[];
  bulkRequirements: BulkRequirement[];
  rfqOffers: RFQOffer[];
  reviews: Review[];
  notifications: Notification[];
  weather: Weather[];
  weatherAlerts: WeatherAlert[];
  coldStorages: ColdStorage[];
  articles: Article[];
  articleCategories: ArticleCategory[];
  conversations: Conversation[];
  messages: Message[];
  documents: Document[];
  auditLogs: AuditLog[];
}
