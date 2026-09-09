import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CropCategory, CropListing } from '../../types';
import { 
  PageContainer, 
  SectionHeader, 
  CategoryCard, 
  ProductCard, 
  SearchInput, 
  Button,
  Alert
} from '../../components/ui';
import { 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Sprout, 
  Sparkles, 
  ArrowRight,
  Award,
  Clock
} from 'lucide-react';

const CATEGORIES: CropCategory[] = [
  'Grains & Cereals',
  'Pulses (Dal)',
  'Vegetables',
  'Spices',
  'Oilseeds',
  'Fruits',
  'Cash Crops'
];

export const BuyerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { crops, addToCart, wishlistIds, toggleWishlist, language } = useApp();
  const [search, setSearch] = useState('');

  const featuredCrops = crops.slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/buyer/marketplace?q=${encodeURIComponent(search)}`);
  };

  return (
    <PageContainer>
      {/* Hero Banner with APMC Procurement Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-10 lg:p-12 mb-8 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>National Agriculture Market (e-NAM) Verified Exchange</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-[1.15]">
            India's Certified Spot & Institutional Agricultural Marketplace
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            Procure directly from verified farmers and FPOs with certified AGMARK assaying, 100% pre-funded RBI escrow custody, and GPS-tracked mandi freight dispatch.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search Sharbati Wheat, Mustard, Basmati Rice, Cumin..."
                className="w-full bg-white text-stone-900 shadow-lg"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-6"
            >
              Find Harvest
            </Button>
          </form>

          {/* Quick Stats Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-emerald-300 text-[10px] block uppercase font-bold">Verified Lots</span>
              <span className="text-lg font-bold">12,400+ Q Available</span>
            </div>
            <div>
              <span className="text-emerald-300 text-[10px] block uppercase font-bold">Registered Mandis</span>
              <span className="text-lg font-bold">180+ APMC Yards</span>
            </div>
            <div>
              <span className="text-emerald-300 text-[10px] block uppercase font-bold">Escrow Guarantee</span>
              <span className="text-lg font-bold">100% Pre-Funded</span>
            </div>
            <div>
              <span className="text-emerald-300 text-[10px] block uppercase font-bold">Brokerage Fee</span>
              <span className="text-lg font-bold">Zero for Farmers</span>
            </div>
          </div>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Institutional Notice */}
      <Alert
        variant="escrow"
        title="Direct Institutional Procurement Desk Active"
        className="mb-8"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/buyer/bulk-requirements/create')}
            className="whitespace-nowrap bg-white text-stone-900 border-indigo-200"
          >
            Post Bulk RFQ
          </Button>
        }
      >
        Enterprise buyers and food processors can submit custom grade & moisture specifications with scheduled truck delivery across all major agro-climatic zones.
      </Alert>

      {/* Commodity Categories Section */}
      <div className="mb-10">
        <SectionHeader
          title="Browse Commodity Categories"
          subtitle="Direct mandi trade lots indexed across 7 certified agricultural classifications"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/buyer/categories')}
              className="text-emerald-700"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              onClick={() => navigate(`/buyer/marketplace?category=${encodeURIComponent(cat)}`)}
            />
          ))}
        </div>
      </div>

      {/* Featured Quality Assayed Harvest Lots */}
      <div className="mb-10">
        <SectionHeader
          title="Spot Mandi Harvest Lots"
          subtitle="Inspected with AGMARK assay reports, transparent mandi spread, and instant dispatch booking"
          badge="Live Listings"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/buyer/marketplace')}
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCrops.map((crop) => (
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

      {/* Institutional Guarantees Strip */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
        <h3 className="text-lg font-bold text-stone-900 font-display">
          Kisan Saathi Institutional Procurement Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900">RBI Pre-Funded Escrow</h4>
              <p className="text-stone-500 mt-1 leading-relaxed">
                Wholesale payments are held securely in a scheduled bank escrow account. Funds are released to the farmer only after gate weighbridge slip verification.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900">AGMARK Quality Assayed</h4>
              <p className="text-stone-500 mt-1 leading-relaxed">
                Every listed lot specifies moisture content percentage, foreign matter limit, and grain grading verified at the local APMC yard gate.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900">Door-to-Door GPS Freight</h4>
              <p className="text-stone-500 mt-1 leading-relaxed">
                Dedicated commercial agricultural trucks allocated instantly upon order acceptance with real-time GPS telemetry from farmgate to warehouse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
