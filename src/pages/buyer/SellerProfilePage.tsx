import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  ProductCard, 
  SellerBadge, 
  RatingStars, 
  Button 
} from '../../components/ui';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Award, 
  Calendar, 
  Sprout, 
  Building2, 
  Star,
  CheckCircle2 
} from 'lucide-react';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { crops, addToCart, wishlistIds, toggleWishlist, language } = useApp();

  // Find farmer's crops
  const sellerCrops = crops.filter(c => c.sellerId === id || c.id === id);
  const sampleCrop = sellerCrops[0] || crops[0];

  const sellerName = sampleCrop ? sampleCrop.sellerName : 'Rameshwar Patel';
  const sellerType = sampleCrop ? sampleCrop.sellerType : 'FPO (Farmer Producer Org)';
  const location = sampleCrop ? sampleCrop.location : { district: 'Sehore', state: 'Madhya Pradesh', nearestMandi: 'Sehore APMC Yard' };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Marketplace', href: '/buyer/marketplace' },
          { label: `Seller Profile (${sellerName})` }
        ]}
        className="mb-4"
      />

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-700 text-amber-300 font-extrabold text-2xl flex items-center justify-center font-display shrink-0 shadow-md">
              {sellerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                  {sellerName}
                </h1>
                <SellerBadge type={sellerType} />
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{location.district}, {location.state} • Mandi: {location.nearestMandi}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm text-stone-900">4.85</span>
                <span className="text-xs text-stone-400">(142 Assayed Trades)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                100% On-Time Mandi Gate Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Accreditation and Landholding Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">APMC License</span>
            <span className="font-bold text-stone-900">MP-SEH-FPO-8821</span>
            <span className="text-[9px] text-emerald-700 font-semibold block">Active & Audited</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Member Landholding</span>
            <span className="font-bold text-stone-900">450 Acres Cultivated</span>
            <span className="text-[9px] text-stone-500 block">38 Farmer Households</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Total Volume Traded</span>
            <span className="font-bold text-stone-900">18,500 Quintals</span>
            <span className="text-[9px] text-stone-500 block">Since March 2023</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Dispute Track Record</span>
            <span className="font-bold text-emerald-800">0 Open Disputes</span>
            <span className="text-[9px] text-emerald-700 font-semibold block">Arbitration Cleared</span>
          </div>
        </div>
      </div>

      {/* Active Listings by this seller */}
      <div className="space-y-6">
        <SectionHeader
          title={`Active Mandi Lots by ${sellerName}`}
          subtitle="All crops available for immediate spot procurement or scheduled truck dispatch"
          badge={`${sellerCrops.length} Active Lots`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellerCrops.map((crop) => (
            <ProductCard
              key={crop.id}
              crop={crop}
              onClick={() => navigate(`/buyer/product/${crop.id}`)}
              onAddToCart={() => addToCart(crop, crop.minOrderQuantity)}
              onToggleWishlist={() => toggleWishlist(crop.id)}
              isWishlisted={wishlistIds.includes(crop.id)}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
