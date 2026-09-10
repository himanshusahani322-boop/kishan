import { db } from '../db/database';
import { Shipment } from '../db/schema';

export const shipmentService = {
  getByOrderId(orderId: string): Shipment | undefined {
    return (db as any).indexes?.shipmentByOrderId?.get(orderId);
  },

  update(orderId: string, updates: Partial<Shipment>): Shipment {
    return db.updateShipment(orderId, updates);
  },

  dispatchOrder(orderId: string, params: {
    transporterName?: string;
    vehicleNumber: string;
    driverName?: string;
    driverContactNumber: string;
    pickupLocation?: string;
    dispatchDocuments?: string[];
  }): Shipment {
    if (!params.vehicleNumber || !params.driverContactNumber) {
      throw new Error('Vehicle number and driver contact number are required for dispatch');
    }

    return db.updateShipment(orderId, {
      transporterName: params.transporterName || 'APMC Mandi Logistics Fleet',
      vehicleNumber: params.vehicleNumber,
      driverName: params.driverName || 'Commercial Driver',
      driverContactNumber: params.driverContactNumber,
      pickupLocation: params.pickupLocation || 'Mandi Yard Gate 1',
      status: 'in_transit',
      dispatchedAt: new Date().toISOString(),
      ...(Array.isArray(params.dispatchDocuments) ? { documents: params.dispatchDocuments } : {})
    });
  }
};
