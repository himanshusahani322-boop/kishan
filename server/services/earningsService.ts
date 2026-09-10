import { db } from '../db/database';

export const earningsService = {
  getFarmerEarnings(farmerId: string) {
    const orders = db.getOrdersForFarmer(farmerId);

    const completedOrders = orders.filter(o => o.status === 'delivered');
    const inTransitOrders = orders.filter(o => o.status === 'dispatched' || o.status === 'in_transit');
    const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'weighment_pending' || o.status === 'pending_confirmation');

    const settledAmount = completedOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const inTransitEscrowAmount = inTransitOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const pendingConfirmationAmount = pendingOrders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);
    const totalGrossSales = orders.reduce((sum, o) => sum + (o.cropSubtotalAmount || o.totalAmount), 0);

    const recentTransactions = completedOrders.slice(0, 10).map(o => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      cropName: o.items?.[0]?.cropName || 'Agricultural Produce',
      quantityQuintals: o.totalQuantityQuintals,
      settledAmount: o.cropSubtotalAmount || o.totalAmount,
      date: o.updatedAt || o.createdAt,
      paymentStatus: o.payment?.status || 'disbursed',
      transactionReference: o.payment?.transactionReference || `BANK-TXN-${o.id.slice(-6)}`
    }));

    return {
      totalGrossSales,
      settledAmount,
      inTransitEscrowAmount,
      pendingConfirmationAmount,
      completedOrdersCount: completedOrders.length,
      inTransitOrdersCount: inTransitOrders.length,
      totalOrdersCount: orders.length,
      recentTransactions
    };
  }
};
