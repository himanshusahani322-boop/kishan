import { db } from '../db/database';
import { Product, Inventory, ProductImage, QualityReport } from '../db/schema';

export const productService = {
  getAll(filters?: {
    cropId?: string;
    farmerId?: string;
    grade?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: 'active' | 'draft' | 'paused' | 'sold_out' | 'archived' | 'all';
  }) {
    return db.getAllProducts(filters);
  },

  getById(id: string) {
    return db.getProductById(id);
  },

  create(
    farmerId: string,
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'farmerId'>,
    inventoryData: Omit<Inventory, 'id' | 'productId' | 'createdAt' | 'updatedAt'>,
    imageUrls: string[] = []
  ) {
    return db.createProduct(
      {
        ...productData,
        farmerId,
        farmerProfileId: `fp-${farmerId}`,
      },
      inventoryData,
      imageUrls
    );
  },

  update(id: string, updates: Partial<Product>, requesterUserId: string, requesterRole: string) {
    const existing = db.getProductById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    if (requesterRole !== 'admin' && existing.farmerId !== requesterUserId) {
      throw new Error('Forbidden: You can only update your own product listings');
    }
    return db.updateProduct(id, updates);
  },

  delete(id: string, requesterUserId: string, requesterRole: string) {
    const existing = db.getProductById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    if (requesterRole !== 'admin' && existing.farmerId !== requesterUserId) {
      throw new Error('Forbidden: You can only delete your own product listings');
    }
    return db.deleteProduct(id, requesterUserId);
  },

  getInventory(productId: string) {
    return db.getInventoryForProduct(productId);
  },

  updateInventory(productId: string, updates: Partial<Inventory>) {
    return db.updateInventory(productId, updates);
  }
};
