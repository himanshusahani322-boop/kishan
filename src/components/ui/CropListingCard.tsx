import React from 'react';
import { CropListing } from '../../types';
import { Edit3, Trash2, Eye, MapPin, IndianRupee, Layers, Sparkles } from 'lucide-react';
import { QualityBadge } from './QualityBadge';

export interface CropListingCardProps {
  crop: CropListing;
  onEdit: () => void;
  onDelete: () => void;
  onViewOffers?: () => void;
  className?: string;
}

export const CropListingCard: React.FC<CropListingCardProps> = ({
  crop,
  onEdit,
  onDelete,
  onViewOffers,
  className = ''
}) => {
  return (
    <div className={`p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3.5 ${className}`}>
      <div className="flex gap-3.5 items-start">
        <img
          src={crop.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop&q=80'}
          alt={crop.title}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-stone-100"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {crop.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              crop.status === 'active' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {crop.status === 'active' ? 'Active Lot' : 'Negotiating'}
            </span>
          </div>

          <h4 className="font-bold text-sm sm:text-base text-stone-900 truncate mt-0.5 font-display">
            {crop.title}
          </h4>
          <p className="text-xs text-stone-500 truncate">{crop.hindiTitle}</p>

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <QualityBadge grade={crop.grade} isOrganic={crop.isOrganicCertified} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
        <div>
          <span className="text-stone-400 text-[10px] block">Listed Price</span>
          <span className="font-bold text-stone-900">₹{crop.pricePerQuintal.toLocaleString('en-IN')}/Q</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block">Mandi Benchmark</span>
          <span className="font-semibold text-emerald-700">₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')}/Q</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block">Stock Available</span>
          <span className="font-bold text-stone-900">{crop.quantityAvailable} Q</span>
        </div>
        <div>
          <span className="text-stone-400 text-[10px] block">Moisture</span>
          <span className="font-semibold text-stone-700">{crop.moisturePercentage}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1 text-[11px] text-stone-500">
          <MapPin className="w-3 h-3 text-stone-400" />
          <span className="truncate">{crop.location.district}, {crop.location.state}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Edit Lot"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-stone-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete Lot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
