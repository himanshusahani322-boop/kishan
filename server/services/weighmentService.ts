import { db } from '../db/database';
import { Weighment } from '../db/schema';

export const weighmentService = {
  getByOrderId(orderId: string): Weighment | undefined {
    return db.getWeighmentByOrderId(orderId);
  },

  createWeighment(params: {
    orderId: string;
    grossWeight: number;
    tareWeight: number;
    unit?: string;
    weighmentSlipUrl?: string;
    verifiedBy: string;
  }): { weighment: Weighment; netWeight: number; netQuintals: number } {
    const gross = Number(params.grossWeight);
    const tare = Number(params.tareWeight);
    const unit = params.unit || 'kg';

    if (isNaN(gross) || gross <= 0) {
      throw new Error('Gross weight must be a positive number');
    }
    if (isNaN(tare) || tare < 0) {
      throw new Error('Tare weight must be non-negative');
    }
    if (gross <= tare) {
      throw new Error('Gross weight must be strictly greater than Tare weight');
    }

    // Server-side calculation
    const netWeight = Math.round((gross - tare) * 100) / 100;
    const netQuintals = unit === 'kg' ? Math.round((netWeight / 100) * 100) / 100 : netWeight;

    const weighment = db.createWeighment({
      orderId: params.orderId,
      grossWeight: gross,
      tareWeight: tare,
      netWeight,
      unit,
      weighmentSlipUrl: params.weighmentSlipUrl || '',
      verifiedBy: params.verifiedBy,
    });

    // Update order with certified weight
    const orderObj = (db as any).indexes?.ordersById?.get(params.orderId);
    if (orderObj) {
      orderObj.certifiedWeightQuintals = netQuintals;
      orderObj.weighbridgeSlipNumber = weighment.id;
    }

    return { weighment, netWeight, netQuintals };
  }
};
