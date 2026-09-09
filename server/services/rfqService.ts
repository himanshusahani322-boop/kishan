import { db } from '../db/database';
import { BulkRequirement, RFQOffer } from '../db/schema';

export const rfqService = {
  getAllRequirements() {
    return db.getAllBulkRequirements();
  },

  getRequirementById(id: string) {
    return db.getBulkRequirementById(id);
  },

  createRequirement(data: Omit<BulkRequirement, 'id' | 'createdAt' | 'updatedAt' | 'offersCount' | 'status'>) {
    return db.createBulkRequirement(data);
  },

  submitOffer(offerData: Omit<RFQOffer, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    return db.submitRFQOffer(offerData);
  },

  respondToOffer(offerId: string, action: 'accept' | 'counter' | 'reject', counterPrice?: number, counterNotes?: string) {
    return db.respondToRFQOffer(offerId, action, counterPrice, counterNotes);
  }
};
