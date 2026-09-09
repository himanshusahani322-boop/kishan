import { db, OrderDetailView } from '../db/database';
import { Order, Shipment, Weighment } from '../db/schema';

export const orderService = {
  getAll() {
    return db.getAllOrders();
  },

  getById(orderId: string) {
    return db.getOrderById(orderId);
  },

  getForBuyer(buyerId: string) {
    return db.getOrdersForBuyer(buyerId);
  },

  getForFarmer(farmerId: string) {
    return db.getOrdersForFarmer(farmerId);
  },

  create(params: {
    buyerId: string;
    farmerId: string;
    deliveryAddressId: string;
    farmGatePickupAddressId?: string;
    items: Array<{
      productId: string;
      quantityQuintals: number;
    }>;
    notes?: string;
  }) {
    return db.createOrder(params);
  },

  updateStatus(orderId: string, newStatus: Order['status'], changedByUserId: string, reason?: string, location?: string) {
    return db.updateOrderStatus(orderId, newStatus, changedByUserId, reason, location);
  },

  updateShipment(orderId: string, updates: Partial<Shipment>) {
    return db.updateShipment(orderId, updates);
  },

  getWeighment(orderId: string) {
    return db.getWeighmentByOrderId(orderId);
  },

  createWeighment(data: Omit<Weighment, 'id' | 'createdAt' | 'updatedAt'>) {
    return db.createWeighment(data);
  }
};
