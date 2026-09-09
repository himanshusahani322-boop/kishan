import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export interface OrderSummaryProps {
  quantityQuintals: number;
  subtotal: number;
  mandiCess: number;
  logisticsFee: number;
  totalAmount: number;
  cropName?: string;
  isEscrowProtected?: boolean;
  actionButton?: React.ReactNode;
  className?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  quantityQuintals,
  subtotal,
  mandiCess,
  logisticsFee,
  totalAmount,
  cropName,
  isEscrowProtected = true,
  actionButton,
  className = ''
}) => {
  return (
    <div className={`p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 ${className}`}>
      <div className="border-b border-stone-100 pb-3">
        <h3 className="text-base font-bold text-stone-900 font-display">Wholesale Procurement Summary</h3>
        {cropName && <p className="text-xs text-stone-500 mt-0.5">{cropName} • {quantityQuintals} Quintals</p>}
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>Crop Subtotal ({quantityQuintals} Quintals)</span>
          <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span className="flex items-center gap-1">
            <span>APMC Mandi Cess (1.5%)</span>
            <span title="Statutory state market committee cess" className="text-stone-400 cursor-help">•</span>
          </span>
          <span className="font-semibold text-stone-900">₹{mandiCess.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span>Dedicated GPS Freight Logistics</span>
          <span className="font-semibold text-stone-900">
            {logisticsFee > 0 ? `₹${logisticsFee.toLocaleString('en-IN')}` : 'Included'}
          </span>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-stone-900 block">Total Amount</span>
            <span className="text-[10px] text-stone-400">All Taxes & Mandi Levies Included</span>
          </div>
          <span className="text-xl font-extrabold text-emerald-800 font-display">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {isEscrowProtected && (
        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold">100% RBI Escrow Protected:</span> Funds held safely in scheduled bank custody until physical inspection & weighbridge confirmation at delivery.
          </p>
        </div>
      )}

      {actionButton && (
        <div className="pt-2">
          {actionButton}
        </div>
      )}
    </div>
  );
};
