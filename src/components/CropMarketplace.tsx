import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropCategory, CropListing } from '../types';
import { 
  SearchBar, 
  Select, 
  Button, 
  ProductCard, 
  EmptyState, 
  TrustBadge, 
  Tabs,
  WeatherCard 
} from './ui';

const CATEGORIES: CropCategory[] = [
  'Grains & Cereals',
  'Pulses (Dal)',
  'Vegetables',
  'Spices',
  'Oilseeds',
  'Fruits',
  'Cash Crops'
];

interface CropMarketplaceProps {
  onSelectCrop?: (crop: CropListing) => void;
  onDirectBuy?: (crop: CropListing, quantity: number) => void;
  onOpenQuickBuy?: (crop: CropListing) => void;
}

export const CropMarketplace: React.FC<CropMarketplaceProps> = ({ 
  onSelectCrop, 
  onDirectBuy,
  onOpenQuickBuy 
}) => {
  const { 
    crops, 
    addToCart, 
    wishlistIds, 
    toggleWishlist, 
    language, 
    currentRole, 
    setActiveView,
    setSelectedCrop 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'quantity_high' | 'mandi_spread'>('recommended');

  const states = useMemo(() => {
    const set = new Set<string>();
    crops.forEach(c => set.add(c.location.state));
    return Array.from(set);
  }, [crops]);

  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      // Search matches
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        crop.title.toLowerCase().includes(query) || 
        crop.hindiTitle.toLowerCase().includes(query) ||
        crop.variety.toLowerCase().includes(query) ||
        crop.location.district.toLowerCase().includes(query) ||
        crop.location.state.toLowerCase().includes(query) ||
        crop.sellerName.toLowerCase().includes(query);

      // Category filter
      const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;

      // State filter
      const matchesState = selectedState === 'all' || crop.location.state === selectedState;

      // Grade filter
      const matchesGrade = selectedGrade === 'all' || crop.grade.includes(selectedGrade);

      // Organic
      const matchesOrganic = !onlyOrganic || crop.isOrganicCertified;

      return matchesSearch && matchesCategory && matchesState && matchesGrade && matchesOrganic;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.pricePerQuintal - b.pricePerQuintal;
      if (sortBy === 'price_high') return b.pricePerQuintal - a.pricePerQuintal;
      if (sortBy === 'quantity_high') return b.quantityAvailable - a.quantityAvailable;
      if (sortBy === 'mandi_spread') {
        const spreadA = a.mandiBenchmarkPrice - a.pricePerQuintal;
        const spreadB = b.mandiBenchmarkPrice - b.pricePerQuintal;
        return spreadB - spreadA;
      }
      return 0; // Default recommended
    });
  }, [crops, searchQuery, selectedCategory, selectedState, selectedGrade, onlyOrganic, sortBy]);

  const handleCropSelect = (crop: CropListing) => {
    if (onSelectCrop) onSelectCrop(crop);
    else setSelectedCrop(crop);
  };

  const handleDirectBuyAction = (crop: CropListing, quantity: number) => {
    if (onDirectBuy) onDirectBuy(crop, quantity);
    else if (onOpenQuickBuy) onOpenQuickBuy(crop);
    else addToCart(crop, quantity);
  };

  const categoryTabs = [
    { id: 'all', label: `All Crops (${crops.length})` },
    ...CATEGORIES.map(cat => ({
      id: cat,
      label: cat,
      count: crops.filter(c => c.category === cat).length
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Hero Announcement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold tracking-wide uppercase border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>DIRECT FARMER-TO-BUSINESS MANDI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              {language === 'hi' ? 'सीधे किसान व FPO से थोक फ़सल खरीदें' : 'Direct Wholesale Farm Produce & FPO Aggregations'}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {language === 'hi' 
                ? 'बिना बिचौलियों के ताज़ा फ़सल, पारदर्शी मंडी बेंचमार्क मूल्य और सुरक्षित एस्क्रो भुगतान के साथ।' 
                : 'Zero middleman commission, verified moisture & quality grading, transparent APMC benchmark rates with RBI-compliant digital escrow contracts.'}
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-wrap items-center gap-2 text-xs">
            <TrustBadge type="agmark" />
            <TrustBadge type="escrow" />
            <TrustBadge type="enam" />
            <TrustBadge type="fpo" />
          </div>

          {/* Decorative graphic background */}
          <div className="absolute -right-8 -bottom-8 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Live Weather Card for Primary Mandi Hub */}
        <div className="lg:col-span-1">
          <WeatherCard
            district="Sehore"
            state="Madhya Pradesh"
            temperature={31}
            condition="Sunny"
            humidity={48}
            windSpeed={12}
            rainProbability={10}
            sprayAdvisory="Clear skies across Sehore & Bhopal mandis: Favorable window for farm-gate harvest loading."
          />
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Main search bar */}
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={language === 'hi' ? 'फ़सल, किस्म, मंडी, जिला या किसान खोजें...' : 'Search crop, variety, district, state or FPO seller...'}
              id="marketplace-search-input"
            />
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* State filter */}
            <Select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              id="state-filter-select"
              containerClassName="min-w-[140px]"
            >
              <option value="all">All States (सभी राज्य)</option>
              {states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </Select>

            {/* Grade Filter */}
            <Select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              id="grade-filter-select"
              containerClassName="min-w-[140px]"
            >
              <option value="all">All Grades (सभी ग्रेड)</option>
              <option value="Grade A+">Grade A+ (Export Quality)</option>
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
            </Select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden text-xs font-semibold text-stone-700 cursor-pointer"
                id="sort-crops-select"
              >
                <option value="recommended">Featured / Default</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="quantity_high">Largest Lot Available</option>
                <option value="mandi_spread">Best Price vs Mandi</option>
              </select>
            </div>

            {/* Organic Switcher */}
            <Button
              variant={onlyOrganic ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setOnlyOrganic(!onlyOrganic)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              id="organic-filter-toggle"
            >
              100% Organic Only
            </Button>
          </div>
        </div>

        {/* Category Horizontal Tab Scroller */}
        <div className="pt-1">
          <Tabs
            tabs={categoryTabs}
            activeTab={selectedCategory}
            onChange={setSelectedCategory}
            variant="pills"
          />
        </div>
      </div>

      {/* Results Count & Action Link */}
      <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
        <span>Showing <strong className="text-stone-800 font-bold">{filteredCrops.length}</strong> active crop listings ready for dispatch</span>
        {currentRole === 'farmer' && (
          <button 
            type="button"
            onClick={() => setActiveView('farmer_dashboard')}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
          >
            + Add New Crop Listing to Marketplace
          </button>
        )}
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          title="No crops matched your current filters"
          description="Try adjusting your search keyword, category, or clear filters to see all available agricultural produce."
          actionText="Reset All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedState('all');
            setSelectedGrade('all');
            setOnlyOrganic(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCrops.map(crop => (
            <ProductCard
              key={crop.id}
              crop={crop}
              isWishlisted={wishlistIds.includes(crop.id)}
              onToggleWishlist={toggleWishlist}
              onSelectCrop={handleCropSelect}
              onAddToCart={(item, qty) => addToCart(item, qty)}
              onDirectBuy={(item, qty) => handleDirectBuyAction(item, qty)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
