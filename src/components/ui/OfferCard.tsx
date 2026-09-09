import React from 'react';
import { RFQOffer } from '../../types';
import { CheckCircle2, XCircle, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { Button } from './Button';

export interface OfferCardProps {
  offer: RFQOffer;
  targetPrice: number;
  onAccept: () => void;
  onCounter: (counterPrice: number, counterNotes: string) => void;
  onReject: () => void;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  targetPrice,
  onAccept,
  onCounter,
  onReject,
  className = ''
}) => {
  const priceDiff = offer.offeredPricePerQuintal - targetPrice;

  return (
    <div className={`p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h4 className="font-bold text-stone-900 text-sm sm:text-base font-display">
            {offer.farmerName}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-400" />
            <span>{offer.farmerLocation}</span>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${
          offer.status === 'accepted'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : offer.status === 'rejected'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {offer.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Bid Rate</span>
          <span className="font-bold text-stone-900 text-sm">₹{offer.offeredPricePerQuintal.toLocaleString('en-IN')}/Q</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Offered Volume</span>
          <span className="font-bold text-stone-900 text-sm">{offer.offeredQuantityQuintals} Quintals</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Delivery Time</span>
          <span className="font-semibold text-stone-700">{offer.deliveryTimelineDays} Days</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block uppercase font-bold">Assay Sample</span>
          <span className="font-semibold text-emerald-700">{offer.sampleAvailable ? 'Ready for Dispatch' : 'Not Required'}</span>
        </div>
      </div>

      {offer.notes && (
        <p className="text-xs text-stone-600 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
          Farmer Note: {offer.notes}
        </p>
      )}

      {offer.status === 'pending' && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="text-stone-600"
          >
            Reject Bid
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCounter(offer.offeredPricePerQuintal - 50, 'Counter offer based on mandi rate')}
            className="text-amber-800 bg-amber-50 hover:bg-amber-100"
          >
            Counter Offer
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAccept}
          >
            Accept Bid & Escrow
          </Button>
        </div>
      )}
    </div>
  );
};
