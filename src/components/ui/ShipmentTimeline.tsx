import React from 'react';
import { Truck, Scale, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';

export interface ShipmentTimelineProps {
  trackingId: string;
  vehicleNumber?: string;
  driverContact?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  weighbridgeWeightQuintals?: number;
  className?: string;
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({
  trackingId,
  vehicleNumber = 'MP-09-GH-4921 (16-Wheeler Tata Signa)',
  driverContact = '+91 97552 11984 (Balwinder Singh)',
  currentLocation = 'Agra-Lucknow Expressway Toll Plaza 4',
  estimatedDelivery = 'Tomorrow, 4:00 PM',
  weighbridgeWeightQuintals = 200,
  className = ''
}) => {
  return (
    <div className={`p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-stone-900 text-sm font-display">Live Freight Logistics & GPS</h4>
          </div>
          <span className="text-xs text-stone-500 mt-0.5 block">LR/Tracking No: {trackingId}</span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 w-fit">
          GPS Live Tracking
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
          <span className="text-stone-400 text-[10px] uppercase font-bold block">Assigned Freight Vehicle</span>
          <span className="font-bold text-stone-900">{vehicleNumber}</span>
          <p className="text-stone-500 text-[11px] mt-0.5">Driver: {driverContact}</p>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
          <span className="text-stone-400 text-[10px] uppercase font-bold block">Certified Weighbridge Slip</span>
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <Scale className="w-3.5 h-3.5 text-emerald-700" />
            <span>{weighbridgeWeightQuintals} Q Gross Mandi Tare</span>
          </div>
          <p className="text-emerald-700 text-[11px] font-semibold">Digitally Signed by APMC Inspector</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Current Transit Milestone:</span>
          <span>{currentLocation}</span>
          <span className="block text-emerald-700 font-semibold mt-0.5">Estimated Arrival: {estimatedDelivery}</span>
        </div>
      </div>
    </div>
  );
};
