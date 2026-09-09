import React from 'react';
import { RFQRequirement } from '../../types';
import { RequirementStatus } from './RequirementStatus';
import { MapPin, Calendar, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

export interface RequirementCardProps {
  rfq: RFQRequirement;
  role: 'farmer' | 'buyer' | 'admin';
  onViewDetails: () => void;
  onSubmitOffer?: () => void;
  className?: string;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  rfq,
  role,
  onViewDetails,
  onSubmitOffer,
  className = ''
}) => {
  const isFarmer = role === 'farmer';

  return (
    <div className={`p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {rfq.cropCategory}
          </span>
          <span className="text-xs text-stone-400">
            Deadline: {new Date(rfq.deadlineDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <RequirementStatus status={rfq.status} size="sm" />
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-bold text-stone-900 font-display">
          {rfq.cropName}
        </h4>
        <p className="text-xs text-stone-500 mt-0.5">Preferred Variety: <strong>{rfq.varietyPreferred}</strong></p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Target Quantity</span>
          <span className="text-stone-900 font-bold text-sm sm:text-base">{rfq.targetQuantityQuintals} Quintals</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Target Price</span>
          <span className="text-stone-900 font-bold text-sm sm:text-base">₹{rfq.targetPricePerQuintal.toLocaleString('en-IN')}/Q</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Total Procurement Value</span>
          <span className="text-emerald-800 font-extrabold text-sm sm:text-base">
            ₹{(rfq.targetQuantityQuintals * rfq.targetPricePerQuintal).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-stone-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Delivery Hub: <strong className="text-stone-800">{rfq.deliveryLocation}</strong></span>
        </div>
        {rfq.specifications && (
          <p className="text-[11px] text-stone-500 line-clamp-2 bg-stone-50/50 p-2 rounded-lg border border-stone-100">
            Specs: {rfq.specifications}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 font-medium">
          <Users className="w-3.5 h-3.5 text-stone-400" />
          <span>{rfq.offersCount} Farmer Bids Received</span>
        </div>

        <div className="flex items-center gap-2">
          {isFarmer && rfq.status === 'open' && onSubmitOffer && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmitOffer}
            >
              Submit Farmer Bid
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <span>{isFarmer ? 'View RFQ' : 'Manage Offers'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
