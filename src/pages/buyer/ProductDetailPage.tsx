import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  PriceDisplay, 
  QualityBadge, 
  SellerBadge, 
  QuantitySelector, 
  Button, 
  WishlistButton, 
  Alert,
  RatingStars
} from '../../components/ui';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Package, 
  Clock, 
  Award, 
  Truck, 
  Phone, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  Sprout,
  Scale
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { crops, addToCart, wishlistIds, toggleWishlist, language } = useApp();

  const crop = crops.find(c => c.id === id);

  if (!crop) {
    return (
      <PageContainer>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-stone-900 font-display">Crop Lot Not Found</h2>
          <p className="text-xs text-stone-500">The agricultural lot you requested might have been sold or unlisted.</p>
          <Button variant="primary" onClick={() => navigate('/buyer/marketplace')}>
            Return to Marketplace
          </Button>
        </div>
      </PageContainer>
    );
  }

  const [selectedImage, setSelectedImage] = useState(crop.imageUrl);
  const [quantity, setQuantity] = useState(crop.minOrderQuantity);

  const isWishlisted = wishlistIds.includes(crop.id);
  const totalPrice = quantity * crop.pricePerQuintal;
  const mandiSaving = (crop.mandiBenchmarkPrice - crop.pricePerQuintal) * quantity;

  const handleAddToCart = () => {
    addToCart(crop, quantity);
    navigate('/buyer/cart');
  };

  const handleDirectBuy = () => {
    addToCart(crop, quantity);
    navigate('/buyer/checkout');
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Marketplace', href: '/buyer/marketplace' },
          { label: crop.category, href: `/buyer/marketplace?category=${encodeURIComponent(crop.category)}` },
          { label: crop.title }
        ]}
        className="mb-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Column: Photo Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/90 aspect-4/3 shadow-xs">
            <img
              src={selectedImage}
              alt={crop.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <WishlistButton
                isWishlisted={isWishlisted}
                onToggle={() => toggleWishlist(crop.id)}
                size="lg"
              />
            </div>
            <div className="absolute bottom-4 left-4">
              <QualityBadge grade={crop.grade} isOrganic={crop.isOrganicCertified} />
            </div>
          </div>

          {/* Thumbnail strip if multiple images */}
          {crop.images && crop.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {crop.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Government Assaying Mandi Certificate Pill */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>APMC Assaying Quality Metrics</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Moisture</span>
                <span className="font-bold text-stone-900">{crop.moisturePercentage}%</span>
                <span className="text-[9px] text-emerald-700 block">Within standard</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Foreign Matter</span>
                <span className="font-bold text-stone-900">&lt; 0.8%</span>
                <span className="text-[9px] text-emerald-700 block">Machine Cleaned</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Shelf Life</span>
                <span className="font-bold text-stone-900">{crop.shelfLifeDays} Days</span>
                <span className="text-[9px] text-stone-400 block">Dry Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Procurement Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {crop.category}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-semibold text-stone-500">
                Variety: {crop.variety}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
              {crop.title}
            </h1>
            <p className="text-sm font-medium text-stone-500 mt-1">
              {crop.hindiTitle}
            </p>

            {/* Location & Mandi */}
            <div className="flex items-center gap-2 text-xs text-stone-600 mt-3">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Origin: <strong>{crop.location.district}, {crop.location.state}</strong></span>
              <span className="text-stone-300">•</span>
              <span>Mandi Yard: <strong>{crop.location.nearestMandi}</strong></span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
            <PriceDisplay
              pricePerQuintal={crop.pricePerQuintal}
              mandiBenchmarkPrice={crop.mandiBenchmarkPrice}
              size="lg"
            />

            {mandiSaving > 0 && (
              <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Procurement saving of ₹{mandiSaving.toLocaleString('en-IN')} vs local APMC spot rate</span>
              </p>
            )}
          </div>

          {/* Quantity Stepper & Procurement Calculation */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Procurement Volume
                </span>
                <span className="text-xs text-stone-500">
                  Available: <strong>{crop.quantityAvailable} Quintals</strong> • MOQ: <strong>{crop.minOrderQuantity} Q</strong>
                </span>
              </div>

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={crop.minOrderQuantity}
                max={crop.quantityAvailable}
                step={5}
                unit="Quintals"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-500 block">Calculated Batch Subtotal</span>
                <span className="text-[10px] text-stone-400">Excludes Mandi Cess (1.5%) & Freight</span>
              </div>
              <span className="text-2xl font-extrabold text-stone-900 font-display">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                className="w-full bg-white hover:bg-stone-50"
              >
                Add to Cart
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleDirectBuy}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Instant Procurement
              </Button>
            </div>
          </div>

          {/* Seller / Farmer Profile Widget */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm font-display shrink-0">
                  {crop.sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-stone-900 text-sm truncate font-display">
                    {crop.sellerName}
                  </h4>
                  <SellerBadge type={crop.sellerType} />
                </div>
              </div>

              <Link
                to={`/buyer/seller/${crop.sellerId}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Harvested: {new Date(crop.harvestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Packaging: {crop.packagingType}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
              {crop.description}
            </p>
          </div>

          {/* Escrow Disclaimer */}
          <Alert
            variant="escrow"
            title="100% Pre-Funded RBI Escrow Custody"
          >
            Your funds remain safely deposited in the scheduled bank escrow vault. Payment is automatically transferred to the farmer only after certified weighbridge tare slip upload upon gate arrival.
          </Alert>
        </div>
      </div>
    </PageContainer>
  );
};
