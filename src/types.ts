export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  location: {
    villageOrCity: string;
    district: string;
    state: string;
    pincode: string;
  };
  isVerifiedFPO?: boolean;
  fpoName?: string;
  businessName?: string;
  businessType?: string;
  gstNumber?: string;
  landholdingAcres?: number;
  primaryCrops?: string[];
  mandiLicense?: string;
  rating: number;
  totalRatingsCount: number;
  joinedDate: string;
  createdAt?: string;
}

export interface SignupData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  location?: {
    villageOrCity: string;
    district: string;
    state: string;
    pincode: string;
  };
  isVerifiedFPO?: boolean;
  fpoName?: string;
  businessName?: string;
  businessType?: string;
}

export interface LoginCredentials {
  identifier: string; // Email or 10-digit mobile number
  password: string;
  requestedRole?: UserRole;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
  warning?: string;
}

export type CropCategory = 
  | 'Grains & Cereals'
  | 'Pulses (Dal)'
  | 'Spices'
  | 'Oilseeds'
  | 'Fruits'
  | 'Vegetables'
  | 'Cash Crops';

export type QualityGrade = 'Grade A+ (Export)' | 'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Fair)';

export interface CropListing {
  id: string;
  title: string;
  hindiTitle: string;
  category: CropCategory;
  variety: string;
  grade: QualityGrade;
  moisturePercentage: number;
  quantityAvailable: number; // in Quintals
  minOrderQuantity: number; // in Quintals
  pricePerQuintal: number; // in INR
  mandiBenchmarkPrice: number; // in INR
  isOrganicCertified: boolean;
  harvestDate: string;
  packagingType: string;
  description: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerType: 'Individual Farmer' | 'FPO (Farmer Producer Org)' | 'Progressive Grower';
  location: {
    district: string;
    state: string;
    nearestMandi: string;
  };
  imageUrl: string;
  images: string[];
  shelfLifeDays: number;
  status: 'active' | 'negotiating' | 'sold_out' | 'unlisted';
  createdAt: string;
}

export interface CartItem {
  crop: CropListing;
  quantityQuintals: number;
  negotiatedPricePerQuintal?: number;
}

export interface OrderTrackingCheckpoint {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  cropId: string;
  cropTitle: string;
  category: CropCategory;
  quantityQuintals: number;
  pricePerQuintal: number;
  subtotal: number;
  mandiCess: number;
  logisticsFee: number;
  totalAmount: number;
  deliveryAddress: {
    addressLine: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'UPI' | 'NetBanking / NEFT' | 'Escrow Agropay';
  paymentId: string;
  paymentStatus: 'paid' | 'escrow_hold' | 'released_to_farmer' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'aggregated_at_mandi' | 'quality_inspected' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingId: string;
  vehicleNumber?: string;
  driverContact?: string;
  checkpoints: OrderTrackingCheckpoint[];
  buyerRating?: { rating: number; review: string; timestamp: string };
  farmerRating?: { rating: number; review: string; timestamp: string };
  createdAt: string;
  estimatedDeliveryDate: string;
}

export interface RFQRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  cropCategory: CropCategory;
  cropName: string;
  varietyPreferred: string;
  targetQuantityQuintals: number;
  targetPricePerQuintal: number;
  deliveryLocation: string;
  deadlineDate: string;
  specifications: string;
  status: 'open' | 'negotiating' | 'closed' | 'fulfilled';
  offersCount: number;
  createdAt: string;
}

export interface RFQOffer {
  id: string;
  rfqId: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  offeredPricePerQuintal: number;
  offeredQuantityQuintals: number;
  deliveryTimelineDays: number;
  sampleAvailable: boolean;
  notes: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected';
  counterPrice?: number;
  counterNotes?: string;
  createdAt: string;
}

export interface MandiPriceItem {
  commodity: string;
  hindiName: string;
  mandi: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // Benchmark trading price
  changePercentage: number; // +/- change today
  arrivalTonnes: number;
  date: string;
}

export interface ColdStorageFacility {
  id: string;
  name: string;
  district: string;
  state: string;
  distanceKm: number;
  totalCapacityMT: number;
  availableCapacityMT: number;
  temperatureRange: string;
  suitableCrops: string[];
  ratePerMonthPerQuintal: number;
  contactNumber: string;
  verifiedGovtSubsidized: boolean;
  address: string;
}

export interface AgriNewsArticle {
  id: string;
  title: string;
  category: 'Scheme & Subsidies' | 'Market Trends' | 'Weather & Advisory' | 'Farming Technology';
  date: string;
  source: string;
  summary: string;
  impact: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'rfq' | 'price_alert' | 'weather' | 'system';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}
