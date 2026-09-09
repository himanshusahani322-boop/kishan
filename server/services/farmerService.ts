import { db } from '../db/database';
import { FarmerProfile, BuyerProfile } from '../db/schema';

export const farmerService = {
  getProfile(userId: string): FarmerProfile | undefined {
    return db.getFarmerProfile(userId);
  },

  updateProfile(userId: string, updates: Partial<FarmerProfile>): FarmerProfile {
    return db.updateFarmerProfile(userId, updates);
  },

  getAllFPOs() {
    return db.getAllFPOs();
  },

  getFPOById(id: string) {
    return db.getFPOById(id);
  }
};

export const buyerService = {
  getProfile(userId: string): BuyerProfile | undefined {
    return db.getBuyerProfile(userId);
  },

  updateProfile(userId: string, updates: Partial<BuyerProfile>): BuyerProfile {
    return db.updateBuyerProfile(userId, updates);
  }
};
