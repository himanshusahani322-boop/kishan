import { db } from '../db/database';
import { Inventory } from '../db/schema';

export const inventoryService = {
  getByProductId(productId: string): Inventory | undefined {
    return db.getInventoryForProduct(productId);
  },

  update(productId: string, updates: Partial<Inventory>): Inventory {
    // Business rule: available inventory must never become negative
    if (updates.totalAvailableQuintals !== undefined && updates.totalAvailableQuintals < 0) {
      throw new Error('Available inventory quantity cannot be negative');
    }
    return db.updateInventory(productId, updates);
  },

  adjustStock(productId: string, deltaQuintals: number): Inventory {
    const current = db.getInventoryForProduct(productId);
    if (!current) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    const newAvailable = current.totalAvailableQuintals + deltaQuintals;
    if (newAvailable < 0) {
      throw new Error(`Insufficient inventory: Current available is ${current.totalAvailableQuintals} Qtl, requested reduction is ${Math.abs(deltaQuintals)} Qtl`);
    }
    return db.updateInventory(productId, {
      totalAvailableQuintals: newAvailable,
    });
  }
};
