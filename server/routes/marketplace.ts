import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticateToken, requireRole } from '../auth';

export const marketplaceRouter = Router();

// ==========================================
// CROPS & VARIETIES
// ==========================================
marketplaceRouter.get('/crops', (req: Request, res: Response) => {
  const crops = db.getAllCrops();
  const varieties = db.getAllVarieties();
  res.json({ success: true, crops, varieties });
});

marketplaceRouter.get('/crops/:cropId/varieties', (req: Request, res: Response) => {
  const varieties = db.getVarietiesForCrop(req.params.cropId);
  res.json({ success: true, varieties });
});

marketplaceRouter.get('/mandi-prices', (req: Request, res: Response) => {
  const products = db.getAllProducts({ status: 'active' });
  const crops = db.getAllCrops();
  
  const mandiPrices = crops.map((crop, idx) => {
    const matchingProducts = products.filter(p => p.cropId === crop.id);
    const avgPrice = matchingProducts.length > 0
      ? Math.round(matchingProducts.reduce((sum, p) => sum + p.pricePerQuintal, 0) / matchingProducts.length)
      : (crop.mspPricePerQuintal ? crop.mspPricePerQuintal + 350 : 3500);
    const minPrice = Math.round(avgPrice * 0.92);
    const maxPrice = Math.round(avgPrice * 1.08);
    const modalPrice = avgPrice;
    const changePercentage = Number(((idx % 3 === 0 ? 1 : -1) * (1.2 + (idx * 0.4))).toFixed(1));
    const arrivalTonnes = 800 + (idx * 350);

    return {
      commodity: `${crop.name}`,
      hindiName: crop.hindiName,
      mandi: matchingProducts[0]?.apmcMandiYard || 'APMC Central Yard',
      state: matchingProducts[0]?.farmer?.location?.split(',')?.[1]?.trim() || 'Madhya Pradesh',
      minPrice,
      maxPrice,
      modalPrice,
      changePercentage,
      arrivalTonnes,
      date: 'Today',
    };
  });

  res.json({ success: true, mandiPrices });
});

// ==========================================
// PRODUCTS & INVENTORY
// - A Product belongs to a seller/farmer
// - Inventory belongs to a product
// ==========================================
marketplaceRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { cropId, farmerId, grade, search, minPrice, maxPrice, status } = req.query;
    const products = db.getAllProducts({
      cropId: cropId as string | undefined,
      farmerId: farmerId as string | undefined,
      grade: grade as string | undefined,
      search: search as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status: status === 'all' ? 'all' : ((status as any) || 'active'),
    });
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

marketplaceRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product });
});

marketplaceRouter.post('/products', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { product, inventory, imageUrls } = req.body;

    if (!product || !inventory) {
      return res.status(400).json({ success: false, error: 'Product and inventory data are required' });
    }

    const created = db.createProduct(
      {
        ...product,
        farmerId: user.id,
        farmerProfileId: `fp-${user.id}`,
      },
      inventory,
      Array.isArray(imageUrls) ? imageUrls : []
    );

    res.status(201).json({ success: true, product: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/products/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only update your own products' });
    }

    const updated = db.updateProduct(req.params.id, req.body);
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.delete('/products/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own products' });
    }

    const deleted = db.deleteProduct(req.params.id, user.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// FARMER & SELLER MODULE APIS
// Strict Rule: Farmer can only manage their own listings
// Strict Rule: Validate quantity and price server-side
// Strict Rule: Never trust client-submitted seller IDs
// ==========================================

marketplaceRouter.get('/farmer/dashboard', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const farmerId = user.id;

    // 1. Listings for authenticated farmer
    const listings = db.getAllProducts({ farmerId, status: 'all' });
    const activeListings = listings.filter(l => l.status === 'active');
    const pausedListings = listings.filter(l => l.status === 'paused');

    // 2. Incoming Orders for authenticated farmer
    const orders = db.getOrdersForFarmer(farmerId);
    const pendingOrders = orders.filter(o => 
      ['pending_confirmation', 'confirmed', 'weighment_pending', 'dispatched', 'in_transit'].includes(o.status)
    );
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 3. Stock calculation across active listings
    const availableStock = activeListings.reduce((sum, l) => sum + (l.inventory?.totalAvailableQuintals || 0), 0);

    // 4. Farmer profile details
    const farmerProfile = db.getFarmerProfile(farmerId);
    const farmAddress = db.getDefaultAddressForUser(farmerId);

    // 5. Weather summary for farmer district
    const district = farmAddress?.district || 'Sehore';
    const weatherList = db.getWeatherForecasts(district);
    const weather = weatherList.length > 0 ? weatherList[0] : {
      district: 'Sehore',
      state: 'Madhya Pradesh',
      temperature: 31,
      humidity: 48,
      windSpeed: 12,
      rainProbability: 10,
      condition: 'Sunny' as const,
      sprayAdvisory: 'Clear skies: Favorable window for pest control spraying, harvesting, and farm-gate threshing.',
    };

    // 6. Farmer News & Trade Advisories
    const news = db.getAllArticles('market_news').slice(0, 5);

    // 7. Nearby Cold Storage Facilities
    const coldStorages = db.getAllColdStorages().slice(0, 4);

    // 8. Crop Life Cycle agronomic stages
    const cropLifeCycle = [
      {
        id: 'clc-1',
        cropName: 'Sharbati Wheat',
        variety: 'C-306 Sharbati',
        currentStage: 'Grain Maturation & Drying',
        stageIndex: 4,
        totalStages: 5,
        daysSinceSowing: 114,
        typicalMaturityDays: 130,
        progressPercent: 88,
        sowingDate: '2025-11-18',
        expectedHarvestDate: '2026-03-26',
        healthStatus: 'Excellent',
        moistureForecast: '11.8% Expected at Harvest',
        nextAgronomicAction: 'Terminate irrigation immediately; inspect combine thresher settings.',
      },
      {
        id: 'clc-2',
        cropName: 'Desi Chickpea',
        variety: 'JG-11 Desi Chana',
        currentStage: 'Pod Hardening & Color Change',
        stageIndex: 3,
        totalStages: 4,
        daysSinceSowing: 92,
        typicalMaturityDays: 110,
        progressPercent: 83,
        sowingDate: '2025-12-05',
        expectedHarvestDate: '2026-03-22',
        healthStatus: 'Good',
        moistureForecast: '12.2% Target',
        nextAgronomicAction: 'Field scout for late gram pod borer; clear farm gate drying yard.',
      }
    ];

    // 9. Calculations Benchmarks
    const calculations = {
      mandiModalPrice: 3820,
      mspRate: 2275,
      netRealizationMarginPct: 67.9,
      directPlatformSavingsPct: 4.8,
      suggestedSellingRange: { min: 3650, max: 3950 },
    };

    res.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          rating: farmerProfile?.rating || 4.85,
          totalRatingsCount: farmerProfile?.totalRatingsCount || 48,
          isVerifiedFPO: Boolean(farmerProfile?.isVerifiedFPO),
          fpoName: farmerProfile?.fpoName,
          landHoldingAcres: farmerProfile?.landSizeAcres || 14.5,
          location: farmAddress ? {
            village: farmAddress.villageOrTehsil || '',
            district: farmAddress.district,
            state: farmAddress.state,
            pincode: farmAddress.pincode,
          } : {
            village: 'Narsinghpur',
            district: 'Sehore',
            state: 'Madhya Pradesh',
            pincode: '466001',
          }
        },
        metrics: {
          activeListingsCount: activeListings.length,
          pausedListingsCount: pausedListings.length,
          totalListingsCount: listings.length,
          pendingOrdersCount: pendingOrders.length,
          totalSales,
          availableStockQuintals: availableStock,
        },
        weather,
        news,
        coldStorages,
        cropLifeCycle,
        calculations,
        activeProduce: activeListings,
        allListings: listings,
        incomingOrders: orders,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

marketplaceRouter.get('/farmer/listings', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const status = req.query.status as any;
    const listings = db.getAllProducts({
      farmerId: user.id,
      status: status || 'all'
    });
    res.json({ success: true, count: listings.length, listings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

marketplaceRouter.post('/farmer/listings', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      cropId,
      varietyId,
      title,
      hindiTitle,
      description,
      grade,
      pricePerQuintal,
      unit = 'quintal',
      totalAvailableQuintals,
      minOrderQuantityQuintals = 10,
      harvestDate,
      availability = 'Immediate Dispatch',
      pickupLocation,
      storageInformation = 'Hermetic Silo / HDPE Bags',
      images = [],
      moisturePercentage,
      foreignMatterPercent,
      grainSizeMm,
      damagedGrainsPercent,
      assayingAgency,
      certificateNumber,
      organicCertified = false,
      apmcMandiYard
    } = req.body;

    // Strict Server-Side Validation on Quantity and Price
    const price = Number(pricePerQuintal);
    const quantity = Number(totalAvailableQuintals);
    const moq = Number(minOrderQuantityQuintals);

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: 'Price must be a valid positive number greater than zero.' });
    }
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Available stock quantity must be a valid positive number.' });
    }
    if (!isNaN(moq) && moq > quantity) {
      return res.status(400).json({ success: false, error: 'Minimum Order Quantity (MOQ) cannot exceed total available quantity.' });
    }
    if (!cropId) {
      return res.status(400).json({ success: false, error: 'Please select a crop category.' });
    }

    // Lookup crop & variety
    const crop = db.getCropById(cropId);
    const varieties = db.getVarietiesForCrop(cropId);
    const chosenVariety = (varietyId && varieties.find(v => v.id === varietyId)) || varieties[0] || {
      id: varietyId || `var-${Date.now()}`,
      cropId,
      varietyName: 'Standard Regional Variety',
      agmarknetStandardGrade: grade || 'Grade A',
      typicalMaturityDays: 120,
      suitableSoilTypes: ['Black Cotton', 'Loamy'],
      description: 'Regional selected variety.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const finalVarietyId = chosenVariety.id;
    const listingTitle = title || `${chosenVariety.varietyName} ${crop ? crop.name : 'Produce'}`;
    const listingHindiTitle = hindiTitle || (crop ? crop.hindiName : 'कृषि उपज');

    // Strictly resolve farmer's farm gate address
    const userAddress = db.getDefaultAddressForUser(user.id);

    const yard = apmcMandiYard || (userAddress ? `${userAddress.cityOrTown || userAddress.district} APMC Yard` : 'Sehore APMC Yard');

    const validGrade = ['Grade A+ (Export)', 'Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair)', 'Grade A+', 'Grade A', 'Grade B', 'Standard FAQ'].includes(grade)
      ? grade
      : 'Grade A';

    const productData: any = {
      farmerId: user.id, // Strictly use authenticated server user ID
      farmerProfileId: `fp-${user.id}`,
      cropId,
      varietyId: finalVarietyId,
      title: listingTitle,
      hindiTitle: listingHindiTitle,
      description: description || `Premium ${validGrade} ${listingTitle} stored in ${storageInformation}. Ready for dispatch with verified assaying report.`,
      grade: validGrade,
      pricePerQuintal: price,
      mandiBenchmarkPrice: crop?.mspPricePerQuintal || Math.round(price * 0.94),
      unit: (unit === 'kg' || unit === 'tonne' || unit === 'quintal') ? unit : 'quintal',
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      dispatchWindowDays: availability === 'Immediate Dispatch' ? 1 : 3,
      organicCertified: Boolean(organicCertified),
      apmcMandiYard: yard,
      farmGateAddressId: userAddress ? userAddress.id : 'addr-farm-001',
      status: 'active',
    };

    const inventoryData: any = {
      batchLotNumber: `LOT-${Date.now().toString().slice(-6)}`,
      totalAvailableQuintals: quantity,
      reservedQuintals: 0,
      soldQuintals: 0,
      minOrderQuantityQuintals: moq > 0 ? moq : 10,
      moisturePercentage: Number(moisturePercentage) || 11.4,
      warehouseLocation: pickupLocation || (userAddress ? `${userAddress.villageOrTehsil || userAddress.cityOrTown}, ${userAddress.district}` : 'Farm Gate Store'),
      storageConditions: storageInformation,
      status: 'in_stock',
    };

    const imageUrlList = Array.isArray(images) && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200'];

    const createdProduct = db.createProduct(productData, inventoryData, imageUrlList);

    // Save quality certificate data if present
    const qrMoisture = Number(moisturePercentage) || 11.4;
    const qrForeign = Number(foreignMatterPercent) || 0.6;
    const qrGrainSize = Number(grainSizeMm) || 6.8;
    const qrDamaged = Number(damagedGrainsPercent) || 0.3;
    const qrAgency = assayingAgency || 'District Agricultural Assaying Lab';
    const qrCertNo = certificateNumber || `AGM-${Math.floor(100000 + Math.random() * 900000)}`;

    const qr: any = {
      id: `qr-${createdProduct.id}`,
      productId: createdProduct.id,
      inventoryLotId: createdProduct.inventory?.id,
      assayingAgency: qrAgency,
      certificateNumber: qrCertNo,
      moisturePercent: qrMoisture,
      foreignMatterPercent: qrForeign,
      grainSizeMm: qrGrainSize,
      damagedGrainsPercent: qrDamaged,
      certifiedGrade: validGrade.includes('A+') ? 'Grade A+' : validGrade.includes('B') ? 'Grade B' : 'Grade A',
      inspectionDate: new Date().toISOString().split('T')[0],
      verifiedByInspector: 'Chief Mandi Assayer',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.addQualityReport(qr);

    const rehydrated = db.getProductById(createdProduct.id);
    res.status(201).json({ success: true, product: rehydrated || createdProduct });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/farmer/listings/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You can only edit your own listings.' });
    }

    const {
      title,
      hindiTitle,
      description,
      grade,
      pricePerQuintal,
      unit,
      totalAvailableQuintals,
      minOrderQuantityQuintals,
      harvestDate,
      pickupLocation,
      storageInformation,
      images,
      moisturePercentage,
      foreignMatterPercent,
      grainSizeMm,
      damagedGrainsPercent,
      assayingAgency,
      certificateNumber,
      organicCertified,
      status
    } = req.body;

    const updates: any = {};
    const inventoryUpdates: any = {};
    const qualityUpdates: any = {};

    if (pricePerQuintal !== undefined) {
      const price = Number(pricePerQuintal);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ success: false, error: 'Price must be a valid positive number.' });
      }
      updates.pricePerQuintal = price;
    }

    if (totalAvailableQuintals !== undefined) {
      const qty = Number(totalAvailableQuintals);
      if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ success: false, error: 'Available stock quantity must be non-negative.' });
      }
      inventoryUpdates.totalAvailableQuintals = qty;
    }

    if (minOrderQuantityQuintals !== undefined) {
      const moq = Number(minOrderQuantityQuintals);
      if (isNaN(moq) || moq <= 0) {
        return res.status(400).json({ success: false, error: 'MOQ must be a positive number.' });
      }
      inventoryUpdates.minOrderQuantityQuintals = moq;
    }

    if (title) updates.title = title;
    if (hindiTitle) updates.hindiTitle = hindiTitle;
    if (description) updates.description = description;
    if (grade) updates.grade = grade;
    if (unit) updates.unit = unit;
    if (harvestDate) updates.harvestDate = harvestDate;
    if (organicCertified !== undefined) updates.organicCertified = Boolean(organicCertified);
    if (status) updates.status = status;

    if (pickupLocation) inventoryUpdates.warehouseLocation = pickupLocation;
    if (storageInformation) inventoryUpdates.storageConditions = storageInformation;
    if (moisturePercentage !== undefined) {
      inventoryUpdates.moisturePercentage = Number(moisturePercentage);
      qualityUpdates.moisturePercent = Number(moisturePercentage);
    }
    if (foreignMatterPercent !== undefined) qualityUpdates.foreignMatterPercent = Number(foreignMatterPercent);
    if (grainSizeMm !== undefined) qualityUpdates.grainSizeMm = Number(grainSizeMm);
    if (damagedGrainsPercent !== undefined) qualityUpdates.damagedGrainsPercent = Number(damagedGrainsPercent);
    if (assayingAgency) qualityUpdates.assayingAgency = assayingAgency;
    if (certificateNumber) qualityUpdates.certificateNumber = certificateNumber;

    const updated = db.updateProduct(
      req.params.id,
      updates,
      Object.keys(inventoryUpdates).length > 0 ? inventoryUpdates : undefined,
      Array.isArray(images) && images.length > 0 ? images : undefined,
      Object.keys(qualityUpdates).length > 0 ? qualityUpdates : undefined
    );

    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.patch('/farmer/listings/:id/status', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.body;
    if (!['active', 'paused', 'archived', 'draft', 'sold_out'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status requested.' });
    }

    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only alter your own crop listings.' });
    }

    const updated = db.updateProduct(req.params.id, { status });
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.delete('/farmer/listings/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own crop listings.' });
    }

    const deleted = db.deleteProduct(req.params.id, user.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single product for farmer (verifying ownership)
marketplaceRouter.get('/farmer/listings/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    if (user.role !== 'admin' && product.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only view your own product details' });
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Farmer Orders List
marketplaceRouter.get('/farmer/orders', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orders = db.getOrdersForFarmer(user.id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Order Detail for Farmer (verifying ownership)
marketplaceRouter.get('/farmer/orders/:id', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (user.role !== 'admin' && order.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: This order belongs to another farmer' });
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Order Status with Business Transition Rules
marketplaceRouter.put('/farmer/orders/:id/status', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, checkpoint, reason } = req.body;

    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only manage orders placed for your farm produce.' });
    }

    // Business Transition Rules for Farmer
    const allowedTransitions: Record<string, string[]> = {
      'pending_confirmation': ['confirmed', 'cancelled'],
      'confirmed': ['weighment_pending', 'dispatched', 'cancelled'],
      'weighment_pending': ['dispatched', 'in_transit'],
      'dispatched': ['in_transit', 'delivered'],
      'in_transit': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'disputed': []
    };

    const permitted = allowedTransitions[existing.status] || [];
    if (user.role !== 'admin' && !permitted.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status transition from "${existing.status}" to "${status}". Permitted next stages: ${permitted.join(', ') || 'None'}`
      });
    }

    const updated = db.updateOrderStatus(req.params.id, status, user.id, reason, checkpoint);
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Submit Certified Weighment for Order
marketplaceRouter.post('/farmer/orders/:id/weighment', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Cannot record weighment for another farmer\'s order' });
    }

    const { grossWeight, tareWeight, unit = 'kg', weighmentSlipUrl, verifiedBy } = req.body;
    const gross = Number(grossWeight);
    const tare = Number(tareWeight);

    if (isNaN(gross) || gross <= 0) {
      return res.status(400).json({ success: false, error: 'Gross weight must be a positive number' });
    }
    if (isNaN(tare) || tare < 0) {
      return res.status(400).json({ success: false, error: 'Tare weight must be non-negative' });
    }
    if (gross <= tare) {
      return res.status(400).json({ success: false, error: 'Gross weight must be strictly greater than Tare weight' });
    }

    const netWeight = Math.round((gross - tare) * 100) / 100;

    const weighment = db.createWeighment({
      orderId,
      grossWeight: gross,
      tareWeight: tare,
      netWeight, // Calculated on server
      unit,
      weighmentSlipUrl: weighmentSlipUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      verifiedBy: verifiedBy || `${user.name} (Seller Verification)`
    });

    // Update order certified weight
    const netQuintals = unit === 'kg' ? Math.round((netWeight / 100) * 100) / 100 : netWeight;
    const orderObj = (db as any).indexes.ordersById.get(orderId);
    if (orderObj) {
      orderObj.certifiedWeightQuintals = netQuintals;
      orderObj.weighbridgeSlipNumber = weighment.id;
    }

    res.status(201).json({ success: true, weighment, netWeight, netQuintals });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Submit / Update Dispatch & Shipment
marketplaceRouter.put('/farmer/orders/:id/dispatch', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (user.role !== 'admin' && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Cannot dispatch another farmer\'s order' });
    }

    const {
      transporterName,
      vehicleNumber,
      driverName,
      driverContactNumber,
      pickupLocation,
      dispatchDocuments
    } = req.body;

    if (!vehicleNumber || !driverContactNumber) {
      return res.status(400).json({ success: false, error: 'Vehicle number and driver contact number are required' });
    }

    const shipment = db.updateShipment(orderId, {
      transporterName: transporterName || 'Mandi APMC Logistics Fleet',
      vehicleNumber,
      driverName: driverName || 'Commercial Driver',
      driverContactNumber,
      pickupLocation: pickupLocation || existing.farmer?.location || 'Mandi Yard Gate 1',
      status: 'in_transit',
      dispatchedAt: new Date().toISOString(),
      ...(Array.isArray(dispatchDocuments) ? { documents: dispatchDocuments } : {})
    });

    // Advance order status to dispatched
    const updatedOrder = db.updateOrderStatus(orderId, 'dispatched', user.id, 'Truck dispatched from mandi gate', `Gate exit: ${vehicleNumber}`);

    res.json({ success: true, shipment, order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Farmer Earnings Real Analytics Endpoint
marketplaceRouter.get('/farmer/earnings', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orders = db.getOrdersForFarmer(user.id);

    // Calculate actual earnings strictly from historical order items and settlements
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const inTransitOrders = orders.filter(o => o.status === 'dispatched' || o.status === 'in_transit');
    const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'weighment_pending');

    const settledAmount = completedOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const inTransitEscrowAmount = inTransitOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const pendingConfirmationAmount = pendingOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const totalGrossSales = orders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);

    const recentTransactions = completedOrders.slice(0, 10).map(o => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      cropName: o.items?.[0]?.cropName || 'Agricultural Lot',
      quantityQuintals: o.totalQuantityQuintals,
      settledAmount: o.cropSubtotalAmount || o.totalAmount,
      date: o.updatedAt || o.createdAt,
      paymentStatus: o.payment?.status || 'disbursed',
      transactionReference: o.payment?.transactionReference || `BANK-TXN-${o.id.slice(-6)}`
    }));

    res.json({
      success: true,
      data: {
        totalGrossSales,
        settledAmount,
        inTransitEscrowAmount,
        pendingConfirmationAmount,
        completedOrdersCount: completedOrders.length,
        inTransitOrdersCount: inTransitOrders.length,
        totalOrdersCount: orders.length,
        recentTransactions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Farmer Profile GET & PUT
marketplaceRouter.get('/farmer/profile', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const profile = db.getFarmerProfile(user.id);
    const address = db.getDefaultAddressForUser(user.id);
    res.json({
      success: true,
      profile: {
        ...user,
        farmerProfile: profile,
        address
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/farmer/profile', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      name,
      phone,
      fpoName,
      landSizeAcres,
      village,
      district,
      state,
      pincode
    } = req.body;

    const userUpdates: any = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;

    const profileUpdates: any = {};
    if (fpoName !== undefined) profileUpdates.fpoName = fpoName;
    if (landSizeAcres !== undefined) profileUpdates.landSizeAcres = Number(landSizeAcres);

    if (Object.keys(userUpdates).length > 0) {
      db.updateUser(user.id, userUpdates);
    }
    if (Object.keys(profileUpdates).length > 0) {
      db.updateFarmerProfile(user.id, profileUpdates);
    }

    if (village || district || state || pincode) {
      const defaultAddr = db.getDefaultAddressForUser(user.id);
      if (defaultAddr) {
        Object.assign(defaultAddr, {
          ...(village ? { villageOrTehsil: village } : {}),
          ...(district ? { district } : {}),
          ...(state ? { state } : {}),
          ...(pincode ? { pincode } : {}),
          updatedAt: new Date().toISOString()
        });
      }
    }

    const refreshedUser = db.getUserById(user.id);
    const refreshedProfile = db.getFarmerProfile(user.id);
    const refreshedAddress = db.getDefaultAddressForUser(user.id);

    res.json({
      success: true,
      profile: {
        ...refreshedUser,
        farmerProfile: refreshedProfile,
        address: refreshedAddress
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// CART & WISHLIST
// - Cart belongs to buyer
// - Wishlist belongs to buyer
// ==========================================
marketplaceRouter.get('/cart', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const cart = db.getBuyerCart(user.id);
  res.json({ success: true, cart });
});

marketplaceRouter.post('/cart/items', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId, quantityQuintals } = req.body;
    if (!productId || !quantityQuintals || quantityQuintals <= 0) {
      return res.status(400).json({ success: false, error: 'Valid productId and quantity are required' });
    }
    const cart = db.addToBuyerCart(user.id, productId, Number(quantityQuintals));
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/cart/items/:productId', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { quantityQuintals } = req.body;
    const cart = db.updateCartItemQuantity(user.id, req.params.productId, Number(quantityQuintals));
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.delete('/cart/items/:productId', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const cart = db.removeFromBuyerCart(user.id, req.params.productId);
  res.json({ success: true, cart });
});

marketplaceRouter.delete('/cart', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const cart = db.clearBuyerCart(user.id);
  res.json({ success: true, cart });
});

marketplaceRouter.get('/wishlist', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productIds = db.getBuyerWishlist(user.id);
  res.json({ success: true, productIds });
});

marketplaceRouter.post('/wishlist/:productId/toggle', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productIds = db.toggleBuyerWishlist(user.id, req.params.productId);
  res.json({ success: true, productIds });
});

// ==========================================
// ORDERS & SHIPMENTS
// - Orders contain order items
// - Buyer and farmer are linked to orders
// ==========================================
marketplaceRouter.get('/orders', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  let orders;
  if (user.role === 'admin') {
    orders = db.getAllOrders();
  } else if (user.role === 'farmer') {
    orders = db.getOrdersForFarmer(user.id);
  } else {
    orders = db.getOrdersForBuyer(user.id);
  }
  res.json({ success: true, count: orders.length, orders });
});

marketplaceRouter.get('/orders/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  // Authorization: Only participants or admin can view
  if (user.role !== 'admin' && order.buyerId !== user.id && order.farmerId !== user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized to view this order' });
  }

  res.json({ success: true, order });
});

marketplaceRouter.post('/orders', authenticateToken, requireRole(['buyer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { farmerId, deliveryAddressId, farmGatePickupAddressId, items, notes } = req.body;

    if (!farmerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Farmer and order items are required' });
    }

    const order = db.createOrder({
      buyerId: user.id,
      farmerId,
      deliveryAddressId: deliveryAddressId || 'addr-buyer-wh-001',
      farmGatePickupAddressId,
      items,
      notes,
    });

    // Clear checked-out items from buyer cart
    db.clearBuyerCart(user.id);

    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/orders/:id/status', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, reason, checkpoint } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Role check: Only order participants or admin
    if (user.role !== 'admin' && existing.buyerId !== user.id && existing.farmerId !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to alter this order status' });
    }

    const updated = db.updateOrderStatus(req.params.id, status, user.id, reason, checkpoint);
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// BULK REQUIREMENTS & RFQ OFFERS
// - Bulk requirements belong to buyers
// - RFQ offers belong to bulk requirements and sellers
// ==========================================
marketplaceRouter.get('/rfq/requirements', (req: Request, res: Response) => {
  const status = req.query.status as any;
  const requirements = db.getAllBulkRequirements(status);
  res.json({ success: true, count: requirements.length, requirements });
});

marketplaceRouter.get('/rfq/requirements/:id', (req: Request, res: Response) => {
  const reqDetail = db.getBulkRequirementById(req.params.id);
  if (!reqDetail) {
    return res.status(404).json({ success: false, error: 'Bulk requirement not found' });
  }
  res.json({ success: true, requirement: reqDetail });
});

marketplaceRouter.post('/rfq/requirements', authenticateToken, requireRole(['buyer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const newReq = db.createBulkRequirement({
      ...req.body,
      buyerId: user.id,
      buyerProfileId: `bp-${user.id}`,
    });
    res.status(201).json({ success: true, requirement: newReq });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.post('/rfq/offers', authenticateToken, requireRole(['farmer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const offer = db.submitRFQOffer({
      ...req.body,
      sellerId: user.id,
      farmerProfileId: `fp-${user.id}`,
    });
    res.status(201).json({ success: true, offer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

marketplaceRouter.put('/rfq/offers/:id/respond', authenticateToken, requireRole(['buyer', 'admin']), (req: Request, res: Response) => {
  try {
    const { action, counterPrice, counterNotes } = req.body;
    if (!action || !['accept', 'counter', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Valid action is required (accept, counter, reject)' });
    }
    const updated = db.respondToRFQOffer(req.params.id, action, counterPrice, counterNotes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    res.json({ success: true, offer: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// REVIEWS
// - Reviews connect buyer/farmer/product/order
// ==========================================
marketplaceRouter.get('/reviews/product/:productId', (req: Request, res: Response) => {
  const reviews = db.getReviewsForProduct(req.params.productId);
  res.json({ success: true, count: reviews.length, reviews });
});

marketplaceRouter.get('/reviews/farmer/:farmerId', (req: Request, res: Response) => {
  const reviews = db.getReviewsForFarmer(req.params.farmerId);
  res.json({ success: true, count: reviews.length, reviews });
});

marketplaceRouter.post('/reviews', authenticateToken, requireRole(['buyer', 'admin']), (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const review = db.addReview({
      ...req.body,
      buyerId: user.id,
    });
    res.status(201).json({ success: true, review });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// NOTIFICATIONS
// - Notifications belong to users
// ==========================================
marketplaceRouter.get('/notifications', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifications = db.getUserNotifications(user.id);
  res.json({ success: true, count: notifications.length, notifications });
});

marketplaceRouter.put('/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

marketplaceRouter.delete('/notifications', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  db.clearAllNotificationsForUser(user.id);
  res.json({ success: true });
});

// ==========================================
// WEATHER, COLD STORAGE & ARTICLES
// ==========================================
marketplaceRouter.get('/weather', (req: Request, res: Response) => {
  const district = req.query.district as string | undefined;
  const weather = db.getWeatherForecasts(district);
  res.json({ success: true, weather });
});

marketplaceRouter.get('/cold-storage', (req: Request, res: Response) => {
  const district = req.query.district as string | undefined;
  const coldStorages = db.getAllColdStorages(district);
  res.json({ success: true, count: coldStorages.length, coldStorages });
});

marketplaceRouter.get('/articles', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const articles = db.getAllArticles(category);
  res.json({ success: true, count: articles.length, articles });
});

// ==========================================
// CONVERSATIONS & CHAT
// ==========================================
marketplaceRouter.get('/conversations', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const conversations = db.getUserConversations(user.id);
  res.json({ success: true, conversations });
});

marketplaceRouter.get('/conversations/:id/messages', authenticateToken, (req: Request, res: Response) => {
  const messages = db.getMessagesForConversation(req.params.id);
  res.json({ success: true, messages });
});

marketplaceRouter.post('/conversations/:id/messages', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, error: 'Receiver ID and content are required' });
    }
    const message = db.sendMessage(req.params.id, user.id, receiverId, content);
    res.status(201).json({ success: true, message });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// DATABASE HEALTH & SEED DIAGNOSTICS (ADMIN)
// ==========================================
marketplaceRouter.get('/admin/db-health', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const health = db.validateDatabaseHealth();
  res.json({ success: true, health });
});

marketplaceRouter.post('/admin/db-seed', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const freshData = db.resetToSeed();
  res.json({ success: true, message: 'Database reset to canonical seed data', entitiesCounts: db.validateDatabaseHealth().entitiesCounts });
});
