import { db } from '../db/database';
import { FarmerProfile, BuyerProfile, Address, User } from '../db/schema';

export const profileService = {
  getFarmerProfile(userId: string): { user?: User; farmerProfile?: FarmerProfile; address?: Address } {
    const user = db.getUserById(userId);
    const farmerProfile = db.getFarmerProfile(userId);
    const address = db.getDefaultAddressForUser(userId);
    return { user, farmerProfile, address };
  },

  updateFarmerProfile(userId: string, payload: {
    name?: string;
    phone?: string;
    fpoName?: string;
    landSizeAcres?: number;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  }): { user?: User; farmerProfile?: FarmerProfile; address?: Address } {
    const userUpdates: Partial<User> = {};
    if (payload.name) userUpdates.name = payload.name;
    if (payload.phone) userUpdates.phone = payload.phone;

    if (Object.keys(userUpdates).length > 0) {
      try {
        db.updateUser(userId, userUpdates);
      } catch {}
    }

    const profileUpdates: Partial<FarmerProfile> = {};
    if (payload.fpoName !== undefined) profileUpdates.fpoName = payload.fpoName;
    if (payload.landSizeAcres !== undefined) profileUpdates.landSizeAcres = Number(payload.landSizeAcres);
    if (payload.village !== undefined) profileUpdates.village = payload.village;
    if (payload.district !== undefined) profileUpdates.district = payload.district;
    if (payload.state !== undefined) profileUpdates.state = payload.state;
    if (payload.pincode !== undefined) profileUpdates.pincode = payload.pincode;

    db.updateFarmerProfile(userId, profileUpdates);

    if (payload.village || payload.district || payload.state || payload.pincode) {
      const defaultAddr = db.getDefaultAddressForUser(userId);
      if (defaultAddr) {
        Object.assign(defaultAddr, {
          ...(payload.village ? { villageOrTehsil: payload.village } : {}),
          ...(payload.district ? { district: payload.district } : {}),
          ...(payload.state ? { state: payload.state } : {}),
          ...(payload.pincode ? { pincode: payload.pincode } : {}),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return this.getFarmerProfile(userId);
  }
};
