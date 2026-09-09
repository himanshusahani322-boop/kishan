import { z } from 'zod';

/**
 * Zod Validation Schemas for Kisan Saathi Data Layer
 */

// 1. User
export const UserRoleSchema = z.enum(['farmer', 'buyer', 'admin']);
export const UserStatusSchema = z.enum(['active', 'pending_verification', 'suspended']);

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  passwordHash: z.string(),
  salt: z.string(),
  role: UserRoleSchema,
  avatar: z.string().optional(),
  status: UserStatusSchema.default('active'),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 2. FarmerProfile
export const FarmerProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  farmName: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  farmSize: z.number().nonnegative().optional(),
  farmSizeUnit: z.enum(['acres', 'hectares', 'bigha']).optional(),
  fpoId: z.string().optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  fpoName: z.string().optional(),
  fpoRegistrationNumber: z.string().optional(),
  isVerifiedFPO: z.boolean().default(false),
  primaryApmcMandi: z.string().min(2),
  landSizeAcres: z.number().nonnegative(),
  farmingType: z.enum(['organic', 'conventional', 'natural']).default('conventional'),
  certifications: z.array(z.string()).default([]),
  bankAccountDetails: z.object({
    accountHolder: z.string(),
    accountNumberMasked: z.string(),
    ifscCode: z.string(),
    bankName: z.string(),
  }).optional(),
  upiId: z.string().optional(),
  rating: z.number().min(0).max(5).default(5),
  totalRatingsCount: z.number().int().nonnegative().default(0),
  totalCropsListed: z.number().int().nonnegative().default(0),
  totalOrdersFulfilled: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 3. BuyerProfile
export const BuyerProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  businessName: z.string().min(2),
  businessType: z.enum(['trader', 'food_processor', 'exporter', 'retail_chain', 'aggregator']),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  isGstVerified: z.boolean().default(false),
  creditLimitAmount: z.number().nonnegative().default(1000000),
  creditBalanceAmount: z.number().nonnegative().default(1000000),
  preferredCommodities: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(5),
  totalRatingsCount: z.number().int().nonnegative().default(0),
  totalProcuredQuintals: z.number().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 4. FPO (Farmer Producer Organization)
export const FPOSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  registrationNumber: z.string().optional(),
  description: z.string().default(''),
  district: z.string().min(2),
  state: z.string().min(2),
  contact: z.string().min(5),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 4. Address
export const AddressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(['farm_gate', 'warehouse', 'billing', 'delivery', 'apmc_yard']),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  villageOrTehsil: z.string().optional(),
  cityOrTown: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit Indian PIN code'),
  landmark: z.string().optional(),
  gpsCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 5. Crop
export const CropSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  scientificName: z.string().optional(),
  category: z.enum(['cereal', 'pulse', 'oilseed', 'spice', 'fruit', 'vegetable', 'cash_crop']),
  hindiName: z.string().min(1),
  iconName: z.string().optional(),
  standardUnit: z.enum(['quintal', 'metric_tonne', 'kg', 'crate']).default('quintal'),
  shelfLifeDays: z.number().int().positive(),
  mspPricePerQuintal: z.number().positive().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 6. CropVariety
export const CropVarietySchema = z.object({
  id: z.string().min(1),
  cropId: z.string().min(1),
  varietyName: z.string().min(2),
  agmarknetStandardGrade: z.string().min(1),
  typicalMaturityDays: z.number().int().positive(),
  suitableSoilTypes: z.array(z.string()).default([]),
  description: z.string().min(3),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 7. Product
export const ProductGradeSchema = z.enum([
  'Grade A+ (Export)',
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair)',
  'Grade A+',
  'Grade A',
  'Grade B',
  'Standard FAQ'
]);
export const ProductStatusSchema = z.enum(['active', 'draft', 'paused', 'sold_out', 'archived']);

export const ProductSchema = z.object({
  id: z.string().min(1),
  farmerId: z.string().min(1),
  farmerProfileId: z.string().min(1),
  cropId: z.string().min(1),
  varietyId: z.string().min(1),
  title: z.string().min(3),
  hindiTitle: z.string().min(2),
  description: z.string().min(5),
  grade: ProductGradeSchema,
  pricePerQuintal: z.number().positive(),
  mandiBenchmarkPrice: z.number().positive(),
  unit: z.enum(['quintal', 'kg', 'tonne']).default('quintal'),
  harvestDate: z.string(),
  dispatchWindowDays: z.number().int().positive().default(2),
  organicCertified: z.boolean().default(false),
  apmcMandiYard: z.string().min(2),
  farmGateAddressId: z.string().min(1),
  status: ProductStatusSchema.default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 8. ProductImage
export const ProductImageSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  imageUrl: z.string().url().or(z.string().min(1)),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
  orderIndex: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
});

// 9. Inventory
export const InventorySchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  batchLotNumber: z.string().min(2),
  totalAvailableQuintals: z.number().nonnegative(),
  reservedQuintals: z.number().nonnegative().default(0),
  soldQuintals: z.number().nonnegative().default(0),
  minOrderQuantityQuintals: z.number().positive(),
  maxOrderQuantityQuintals: z.number().positive().optional(),
  moisturePercentage: z.number().min(0).max(100),
  warehouseLocation: z.string().min(2),
  storageConditions: z.string().min(2),
  status: z.enum(['in_stock', 'low_stock', 'reserved', 'depleted']).default('in_stock'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 10. QualityReport
export const QualityReportSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  inventoryLotId: z.string().optional(),
  assayingAgency: z.string().min(2),
  certificateNumber: z.string().min(2),
  moisturePercent: z.number().min(0).max(100),
  foreignMatterPercent: z.number().min(0).max(100),
  grainSizeMm: z.number().positive(),
  damagedGrainsPercent: z.number().min(0).max(100),
  proteinPercent: z.number().min(0).max(100).optional(),
  certifiedGrade: z.enum(['Grade A+', 'Grade A', 'Grade B', 'Fair Average Quality (FAQ)']),
  inspectionDate: z.string(),
  verifiedByInspector: z.string().min(2),
  reportDocumentUrl: z.string().optional(),
  isVerified: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 11. Cart
export const CartSchema = z.object({
  id: z.string().min(1),
  buyerId: z.string().min(1),
  status: z.enum(['active', 'checked_out', 'abandoned']).default('active'),
  currency: z.string().default('INR'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 12. CartItem
export const CartItemSchema = z.object({
  id: z.string().min(1),
  cartId: z.string().min(1),
  productId: z.string().min(1),
  quantityQuintals: z.number().positive(),
  pricePerQuintal: z.number().positive(),
  subtotalAmount: z.number().positive(),
  addedAt: z.string(),
  updatedAt: z.string(),
});

// 13. Wishlist
export const WishlistSchema = z.object({
  id: z.string().min(1),
  buyerId: z.string().min(1),
  productIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 14. Order
export const OrderStatusSchema = z.enum([
  'pending_confirmation',
  'confirmed',
  'weighment_pending',
  'dispatched',
  'in_transit',
  'delivered',
  'cancelled',
  'disputed',
]);

export const OrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(2),
  buyerId: z.string().min(1),
  farmerId: z.string().min(1),
  status: OrderStatusSchema.default('pending_confirmation'),
  totalQuantityQuintals: z.number().positive(),
  cropSubtotalAmount: z.number().positive(),
  mandiTaxCessAmount: z.number().nonnegative(),
  platformFeeAmount: z.number().nonnegative(),
  freightLogisticsAmount: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  deliveryAddressId: z.string().min(1),
  farmGatePickupAddressId: z.string().min(1),
  weighbridgeSlipNumber: z.string().optional(),
  certifiedWeightQuintals: z.number().positive().optional(),
  estimatedDeliveryDate: z.string(),
  actualDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 15. OrderItem
export const OrderItemSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  productId: z.string().min(1),
  cropName: z.string().min(2),
  varietyName: z.string().min(1),
  quantityQuintals: z.number().positive(),
  pricePerQuintal: z.number().positive(),
  totalPrice: z.number().positive(),
  grade: z.string().min(1),
  createdAt: z.string(),
});

// 16. OrderStatusHistory
export const OrderStatusHistorySchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  previousStatus: z.string().optional(),
  newStatus: z.string().min(1),
  changedByUserId: z.string().min(1),
  changeReason: z.string().optional(),
  locationCheckpoint: z.string().optional(),
  timestamp: z.string(),
});

// 17. Shipment
export const ShipmentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  logisticsPartnerName: z.string().min(2),
  vehicleNumber: z.string().min(2),
  driverName: z.string().min(2),
  driverPhone: z.string().min(10),
  eWayBillNumber: z.string().min(2),
  trackingNumber: z.string().min(2),
  currentLocationCity: z.string().min(2),
  gpsLatitude: z.number(),
  gpsLongitude: z.number(),
  status: z.enum(['dispatched', 'at_weighbridge', 'in_transit', 'out_for_delivery', 'delivered']),
  dispatchedAt: z.string(),
  estimatedArrival: z.string(),
  deliveredAt: z.string().optional(),
  weighbridgeGrossKg: z.number().positive().optional(),
  weighbridgeTareKg: z.number().positive().optional(),
  weighbridgeNetKg: z.number().positive().optional(),
  weighbridgeSlipImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 18. Payment (Schema only)
export const PaymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  buyerId: z.string().min(1),
  farmerId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.literal('INR'),
  paymentMethod: z.enum(['escrow_agropay', 'neft_rtgs', 'upi_collect', 'letter_of_credit']),
  status: z.enum(['created', 'escrow_locked', 'disbursed', 'refunded', 'failed', 'pending']),
  escrowAccountId: z.string().optional(),
  escrowReleasedAt: z.string().optional(),
  payoutTransactionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 19. PaymentTransaction
export const PaymentTransactionSchema = z.object({
  id: z.string().min(1),
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  transactionType: z.enum(['escrow_hold', 'escrow_release', 'mandi_cess_deduction', 'platform_commission', 'refund']),
  amount: z.number().positive(),
  currency: z.literal('INR'),
  status: z.enum(['initiated', 'success', 'failed', 'processing']),
  gatewayReferenceId: z.string().optional(),
  bankUtrNumber: z.string().optional(),
  failureReason: z.string().optional(),
  timestamp: z.string(),
});

// 20. BulkRequirement
export const BulkRequirementSchema = z.object({
  id: z.string().min(1),
  buyerId: z.string().min(1),
  buyerProfileId: z.string().min(1),
  cropId: z.string().min(1),
  varietyId: z.string().optional(),
  cropName: z.string().min(2),
  targetQuantityQuintals: z.number().positive(),
  minTargetPricePerQuintal: z.number().positive(),
  maxTargetPricePerQuintal: z.number().positive(),
  preferredGrade: z.string().min(1),
  maxMoistureAllowedPercent: z.number().min(0).max(100),
  deliveryLocationCity: z.string().min(2),
  deliveryState: z.string().min(2),
  requiredByDate: z.string(),
  status: z.enum(['open', 'negotiating', 'partially_fulfilled', 'fulfilled', 'closed', 'expired']).default('open'),
  offersCount: z.number().int().nonnegative().default(0),
  specialSpecifications: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 21. RFQOffer
export const RFQOfferSchema = z.object({
  id: z.string().min(1),
  bulkRequirementId: z.string().min(1),
  sellerId: z.string().min(1),
  farmerProfileId: z.string().min(1),
  offeredQuantityQuintals: z.number().positive(),
  offeredPricePerQuintal: z.number().positive(),
  estimatedDeliveryDays: z.number().int().positive(),
  sampleAvailable: z.boolean().default(true),
  notes: z.string().min(2),
  status: z.enum(['pending', 'accepted', 'countered', 'rejected', 'withdrawn']).default('pending'),
  counterPricePerQuintal: z.number().positive().optional(),
  counterNotes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 22. Review
export const ReviewSchema = z.object({
  id: z.string().min(1),
  buyerId: z.string().min(1),
  farmerId: z.string().min(1),
  productId: z.string().optional(),
  orderId: z.string().min(1),
  rating: z.number().min(1).max(5),
  qualityRating: z.number().min(1).max(5),
  deliveryPromptnessRating: z.number().min(1).max(5),
  packagingRating: z.number().min(1).max(5),
  comment: z.string().min(3),
  isVerifiedPurchase: z.boolean().default(true),
  farmerResponseComment: z.string().optional(),
  farmerRespondedAt: z.string().optional(),
  status: z.enum(['published', 'hidden_for_review', 'flagged']).default('published'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 23. Notification
export const NotificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(2),
  titleHindi: z.string().optional(),
  message: z.string().min(3),
  messageHindi: z.string().optional(),
  type: z.enum(['order_status', 'rfq_offer', 'price_alert', 'escrow_update', 'advisory', 'system']),
  isRead: z.boolean().default(false),
  actionUrl: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
});

// 24. Weather
export const WeatherSchema = z.object({
  id: z.string().min(1),
  district: z.string().min(2),
  state: z.string().min(2),
  forecastDate: z.string(),
  temperatureMinCelsius: z.number(),
  temperatureMaxCelsius: z.number(),
  humidityPercent: z.number().min(0).max(100),
  rainfallMm: z.number().nonnegative(),
  windSpeedKmh: z.number().nonnegative(),
  conditionSummary: z.enum(['sunny', 'cloudy', 'rainy', 'thunderstorm', 'heatwave']),
  agriculturalAdvisory: z.string().min(5),
  agriculturalAdvisoryHindi: z.string().min(5),
  recordedAt: z.string(),
});

// 25. ColdStorage
export const ColdStorageSchema = z.object({
  id: z.string().min(1),
  facilityName: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
  address: z.string().min(5),
  contactPerson: z.string().min(2),
  phone: z.string().min(10),
  totalCapacityMetricTonnes: z.number().positive(),
  availableCapacityMetricTonnes: z.number().nonnegative(),
  temperatureRangeCelsius: z.string().min(2),
  humidityControl: z.boolean().default(true),
  ratePerBagPerMonthINR: z.number().positive(),
  suitableCommodities: z.array(z.string()).min(1),
  hasWarehouseReceiptFinance: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
  isGovtSubsidized: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 26. Article
export const ArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  titleHindi: z.string().min(3),
  category: z.enum(['crop_protection', 'mandi_trends', 'organic_farming', 'government_schemes', 'weather_alert']),
  summary: z.string().min(5),
  summaryHindi: z.string().min(5),
  contentMarkdown: z.string().min(10),
  contentMarkdownHindi: z.string().min(10),
  authorName: z.string().min(2),
  authorDesignation: z.string().min(2),
  coverImageUrl: z.string().url().or(z.string().min(1)),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string(),
  readTimeMinutes: z.number().int().positive().default(3),
  status: z.enum(['published', 'draft']).default('published'),
});

// 27. Conversation
export const ConversationSchema = z.object({
  id: z.string().min(1),
  participant1Id: z.string().min(1),
  participant2Id: z.string().min(1),
  contextType: z.enum(['product_negotiation', 'rfq_negotiation', 'order_inquiry', 'general']),
  contextReferenceId: z.string().optional(),
  lastMessageSnippet: z.string().default(''),
  lastMessageTimestamp: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 28. Message
export const MessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1),
  attachmentUrl: z.string().optional(),
  attachmentType: z.enum(['image', 'pdf', 'quote']).optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string(),
});

// 29. Document
export const DocumentSchema = z.object({
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  documentType: z.enum(['apmc_mandi_license', 'fssai_cert', 'weighbridge_slip', 'eway_bill', 'lab_quality_test', 'bank_mandate']),
  title: z.string().min(2),
  referenceEntityId: z.string().optional(),
  documentNumber: z.string().optional(),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.number().int().positive().optional(),
  mimeType: z.string().min(2),
  isVerified: z.boolean().default(false),
  verifiedByAdminId: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 30. AuditLog
export const AuditLogSchema = z.object({
  id: z.string().min(1),
  entityName: z.string().min(1),
  entityId: z.string().min(1),
  action: z.enum(['create', 'update', 'delete', 'status_change', 'escrow_lock', 'escrow_release', 'auth_login']),
  performedByUserId: z.string().optional(),
  ipAddress: z.string().optional(),
  changesSummary: z.string().optional(),
  previousState: z.any().optional(),
  newState: z.any().optional(),
  timestamp: z.string(),
});

// 31. Weighment
export const WeighmentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  grossWeight: z.number().nonnegative(),
  tareWeight: z.number().nonnegative(),
  netWeight: z.number().nonnegative(),
  unit: z.string().min(1).default('quintal'),
  weighmentSlipUrl: z.string().optional(),
  verifiedBy: z.string().min(2),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 32. WeatherAlert
export const WeatherAlertSchema = z.object({
  id: z.string().min(1),
  location: z.string().min(2),
  alertType: z.string().min(2),
  title: z.string().min(2),
  message: z.string().min(5),
  severity: z.enum(['low', 'moderate', 'high', 'severe']).default('moderate'),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.string(),
});

// 33. ArticleCategory
export const ArticleCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 34. WishlistItem
export const WishlistItemSchema = z.object({
  id: z.string().min(1),
  wishlistId: z.string().min(1),
  productId: z.string().min(1),
  createdAt: z.string(),
});

