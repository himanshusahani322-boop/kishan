import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CropListing } from '../../types';
import { 
  PageContainer, 
  SectionHeader, 
  SearchInput, 
  ProductFilters, 
  ProductGrid, 
  FilterState, 
  Breadcrumbs, 
  Button,
  Pagination
} from '../../components/ui';
import { Filter, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

export const BuyerMarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { crops, addToCart, wishlistIds, toggleWishlist, cart, language } = useApp();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Initial state from URL
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    state: 'all',
    grade: 'all',
    onlyOrganic: false,
    minPrice: 0,
    maxPrice: 100000,
    sortBy: 'recommended'
  });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== filters.category) {
      setFilters(prev => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    crops.forEach(c => set.add(c.location.state));
    return Array.from(set).sort();
  }, [crops]);

  // Filter and sort logic
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = crop.title.toLowerCase().includes(q) || crop.hindiTitle.toLowerCase().includes(q);
        const matchesVariety = crop.variety.toLowerCase().includes(q);
        const matchesLocation = crop.location.district.toLowerCase().includes(q) || crop.location.state.toLowerCase().includes(q);
        if (!matchesTitle && !matchesVariety && !matchesLocation) return false;
      }

      // Category
      if (filters.category !== 'all' && crop.category !== filters.category) return false;

      // State
      if (filters.state !== 'all' && crop.location.state !== filters.state) return false;

      // Grade
      if (filters.grade !== 'all' && crop.grade !== filters.grade) return false;

      // Organic
      if (filters.onlyOrganic && !crop.isOrganicCertified) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.pricePerQuintal - b.pricePerQuintal;
        case 'price_high':
          return b.pricePerQuintal - a.pricePerQuintal;
        case 'quantity_high':
          return b.quantityAvailable - a.quantityAvailable;
        case 'mandi_spread':
          return (b.mandiBenchmarkPrice - b.pricePerQuintal) - (a.mandiBenchmarkPrice - a.pricePerQuintal);
        default:
          return 0;
      }
    });
  }, [crops, searchQuery, filters]);

  const totalPages = Math.ceil(filteredCrops.length / pageSize) || 1;
  const paginatedCrops = filteredCrops.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      state: 'all',
      grade: 'all',
      onlyOrganic: false,
      minPrice: 0,
      maxPrice: 100000,
      sortBy: 'recommended'
    });
    setSearchQuery('');
    setSearchParams({});
  };

  const handleAddToCart = (crop: CropListing) => {
    addToCart(crop, crop.minOrderQuantity);
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Marketplace' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="APMC Spot Agricultural Marketplace"
        subtitle="Live harvest lots direct from verified farmers with assay reports and mandi spread benchmarks"
        badge={`${filteredCrops.length} Active Lots`}
      />

      {/* Search and Mobile Filter Trigger Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search crop title, variety (e.g. Sharbati, Desi Chana), or mandi location..."
            className="w-full bg-white shadow-2xs"
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto lg:hidden">
          <Button
            variant="outline"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span>Filters & Standards</span>
            {(filters.category !== 'all' || filters.state !== 'all' || filters.onlyOrganic) && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-8">
        {/* Desktop Sidebar Filter */}
        <div className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
            availableStates={availableStates}
            totalResultsCount={filteredCrops.length}
          />
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 min-w-0 space-y-6">
          <ProductGrid
            products={paginatedCrops}
            onSelectProduct={(crop) => navigate(`/buyer/product/${crop.id}`)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={toggleWishlist}
            wishlistIds={wishlistIds}
            cartCropIds={cart.map(i => i.crop.id)}
          />

          {totalPages > 1 && (
            <div className="pt-6 border-t border-stone-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Sheet */}
      <ProductFilters
        isMobileDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        availableStates={availableStates}
        totalResultsCount={filteredCrops.length}
      />
    </PageContainer>
  );
};
