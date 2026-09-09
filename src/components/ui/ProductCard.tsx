import React from 'react';
import { MapPin, Heart, Eye, ShoppingCart, Sparkles, ShieldCheck } from 'lucide-react';
import { CropListing } from '../../types';
import { PriceDisplay } from './PriceDisplay';

export interface ProductCardProps {
  crop: CropListing;
  isWishlisted?: boolean;
  onToggleWishlist?: (cropId: string) => void;
  onSelectCrop?: (crop: CropListing) => void;
  onAddToCart?: (crop: CropListing, quantity: number) => void;
  onDirectBuy?: (crop: CropListing, quantity: number) => void;
  className?: string;
  id?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  crop,
  isWishlisted = false,
  onToggleWishlist,
  onSelectCrop,
  onAddToCart,
  onDirectBuy,
  className = '',
  id
}) => {
  const cardId = id || `crop-card-${crop.id}`;

  return (
    <div
      id={cardId}
      className={`group bg-white rounded-xl border border-stone-200 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${className}`}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onSelectCrop && onSelectCrop(crop)}
      >
        <img
          src={crop.imageUrl}
          alt={crop.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges (Quality Grade + Organic) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs border border-stone-200">
            {crop.grade}
          </span>
          {crop.isOrganicCertified && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Organic Certified
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(crop.id);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors shadow-xs ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-rose-500'
            }`}
            id={`wishlist-btn-${crop.id}`}
            aria-label="Save crop to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        )}

        {/* Stock Status Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-stone-950/75 backdrop-blur-md text-white text-[11px] font-semibold">
          <span>Stock: <strong className="text-emerald-300">{crop.quantityAvailable} Qtl</strong></span>
          <span className="text-stone-300">Min Order: {crop.minOrderQuantity} Qtl</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{crop.location.district}, {crop.location.state}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600 font-semibold truncate">{crop.location.nearestMandi}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectCrop && onSelectCrop(crop)}
            className="font-bold text-stone-900 text-sm hover:text-emerald-700 cursor-pointer line-clamp-1 group-hover:underline"
          >
            {crop.title}
          </h3>
          <p className="text-xs text-stone-500 font-medium line-clamp-1">
            {crop.hindiTitle}
          </p>

          {/* Variety and Moisture Chips */}
          <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-1 flex-wrap">
            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 font-medium">
              Var: {crop.variety}
            </span>
            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 font-medium">
              Moisture: {crop.moisturePercentage}%
            </span>
          </div>
        </div>

        {/* Price & Mandi Benchmark comparison */}
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <PriceDisplay
            amount={crop.pricePerQuintal}
            unit="/ Quintal"
            mandiBenchmarkPrice={crop.mandiBenchmarkPrice}
            size="md"
          />

          {/* Seller / FPO details */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
            <span className="truncate max-w-[170px] font-medium text-stone-700">
              {crop.sellerName}
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold text-[10px] flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-2 flex items-center gap-2">
          {onSelectCrop && (
            <button
              type="button"
              onClick={() => onSelectCrop(crop)}
              className="flex-1 py-2 px-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 active:bg-stone-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              id={`view-detail-btn-${crop.id}`}
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>Details</span>
            </button>
          )}

          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(crop, crop.minOrderQuantity)}
              className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              id={`add-cart-btn-${crop.id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add ({crop.minOrderQuantity}Q)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
