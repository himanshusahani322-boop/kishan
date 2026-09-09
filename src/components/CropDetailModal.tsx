import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Calendar, 
  Package, 
  Truck, 
  Phone, 
  CheckCircle2, 
  ShoppingCart, 
  Heart, 
  FileText,
  AlertCircle,
  Building2,
  Lock
} from 'lucide-react';
import { CropListing } from '../types';
import { useApp } from '../context/AppContext';

interface CropDetailModalProps {
  crop: CropListing | null;
  onClose: () => void;
  onQuickBuy: (crop: CropListing, quantity: number) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({ crop, onClose, onQuickBuy }) => {
  const { addToCart, wishlistIds, toggleWishlist, language } = useApp();

  if (!crop) return null;

  const [orderQuantity, setOrderQuantity] = useState<number>(crop.minOrderQuantity);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [buyerPincode, setBuyerPincode] = useState<string>('110033');

  const isWishlisted = wishlistIds.includes(crop.id);
  const subtotal = orderQuantity * crop.pricePerQuintal;
  const mandiCess = Math.round(subtotal * 0.01);
  const estimatedLogistics = Math.round(Math.max(3500, orderQuantity * 150));
  const total = subtotal + mandiCess + estimatedLogistics;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-600 shadow-md border border-stone-200 transition-colors"
          id="close-crop-modal-btn"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Media & Visuals (5 cols) */}
          <div className="md:col-span-5 bg-stone-50 p-6 border-b md:border-b-0 md:border-r border-stone-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-200 border border-stone-200 shadow-xs">
                <img
                  src={crop.images[activeImageIdx] || crop.imageUrl}
                  alt={crop.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                  {crop.grade}
                </span>
                {crop.isOrganicCertified && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    Organic Certified
                  </span>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {crop.images.length > 1 && (
                <div className="flex gap-2">
                  {crop.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-emerald-600 shadow-xs' : 'border-stone-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Seller & Verification Details */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-stone-900">Seller / Aggregator</span>
              </div>
              <p className="text-sm font-bold text-stone-800">{crop.sellerName}</p>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{crop.sellerType}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {crop.location.nearestMandi}, {crop.location.district}, {crop.location.state}
              </p>
            </div>

            {/* Trust Assurances */}
            <div className="space-y-2 text-[11px] text-stone-600 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Govt-certified weighbridge tare & gross slips</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Secure Escrow: Funds released upon arrival QC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Specification & Order Engine (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {crop.category} • {crop.variety}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display mt-0.5">
                  {crop.title}
                </h2>
                <p className="text-sm text-stone-500 font-medium">{crop.hindiTitle}</p>
              </div>

              {/* Price Row */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-stone-500">Direct Farm Gate Rate:</div>
                  <div className="text-2xl font-black text-emerald-950 font-display">
                    ₹{crop.pricePerQuintal.toLocaleString('en-IN')}
                    <span className="text-xs font-medium text-stone-600"> / Quintal (100 Kg)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-500 font-medium">APMC Benchmark Rate:</div>
                  <div className="text-sm font-bold text-stone-700">
                    ₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-200/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Competitive Mandi Rate
                  </div>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Moisture Content</span>
                  <span className="font-bold text-stone-800">{crop.moisturePercentage}% (Safe Storage)</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Available Lot</span>
                  <span className="font-bold text-emerald-700">{crop.quantityAvailable} Quintals</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Minimum Lot Order</span>
                  <span className="font-bold text-stone-800">{crop.minOrderQuantity} Quintals</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Harvest Date</span>
                  <span className="font-bold text-stone-800">{crop.harvestDate}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Shelf Life</span>
                  <span className="font-bold text-stone-800">{crop.shelfLifeDays} Days</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Packaging</span>
                  <span className="font-bold text-stone-800 truncate block">{crop.packagingType}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Produce Description & Assay:</h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50/50 p-3 rounded-lg border border-stone-100">
                  {crop.description}
                </p>
              </div>

              {/* Quantity Selector & Live Cost Calculation */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">
                    Order Quantity (Quintals / क्विंटल):
                  </label>
                  <span className="text-xs text-stone-500 font-medium">
                    Min: {crop.minOrderQuantity} | Max: {crop.quantityAvailable}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={crop.minOrderQuantity}
                    max={crop.quantityAvailable}
                    step={5}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="flex-1 accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <input
                      type="number"
                      min={crop.minOrderQuantity}
                      max={crop.quantityAvailable}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(crop.minOrderQuantity, Math.min(crop.quantityAvailable, Number(e.target.value))))}
                      className="w-20 px-2 py-1.5 text-center text-sm font-bold text-stone-800 focus:outline-hidden"
                    />
                    <span className="px-2 text-xs font-semibold text-stone-500 bg-stone-100 border-l border-stone-300">
                      Qtl
                    </span>
                  </div>
                </div>

                {/* Live Invoice Breakdown */}
                <div className="pt-2 border-t border-stone-200 space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Produce Base ({orderQuantity} Qtl × ₹{crop.pricePerQuintal}):</span>
                    <span className="font-semibold text-stone-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory Mandi Cess (1% e-NAM/APMC):</span>
                    <span className="font-semibold text-stone-800">₹{mandiCess.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated GPS Freight & Assaying:</span>
                    <span className="font-semibold text-stone-800">₹{estimatedLogistics.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-stone-300 text-sm font-extrabold text-emerald-950 font-display">
                    <span>Total Landed Escrow Price:</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA buttons */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => toggleWishlist(crop.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted 
                    ? 'border-rose-300 bg-rose-50 text-rose-600' 
                    : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
                title="Save crop to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                onClick={() => {
                  addToCart(crop, orderQuantity);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                id="modal-add-to-cart-btn"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {orderQuantity} Qtl to Cart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onQuickBuy(crop, orderQuantity);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                id="modal-instant-checkout-btn"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>Instant Escrow Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
