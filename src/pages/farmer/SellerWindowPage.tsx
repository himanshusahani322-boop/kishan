import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  CropListingCard,
  CropListingTable,
  Button,
  EmptyState,
  Alert
} from '../../components/ui';
import { PlusCircle, LayoutGrid, Table, Sprout, RefreshCw, Pause, Play, Archive } from 'lucide-react';

// Status filter definitions
const STATUS_TABS = [
  { id: 'all', label: 'All Lots' },
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'paused', label: 'Paused' },
  { id: 'sold_out', label: 'Sold Out' },
  { id: 'archived', label: 'Archived' },
] as const;

// Map DB product to frontend CropListing shape
function mapProduct(p: any) {
  return {
    id: p.id,
    title: p.cropName || p.title || 'Unnamed Crop',
    hindiTitle: p.hindiTitle || '',
    category: p.category || 'Grains & Cereals',
    variety: p.variety || '',
    grade: p.qualityGrade || p.grade || 'Grade A (Premium)',
    pricePerQuintal: p.pricePerQuintal ?? 0,
    mandiBenchmarkPrice: p.mandiBenchmarkPrice ?? 0,
    quantityAvailable: p.availableQuantityQuintals ?? p.quantityAvailable ?? 0,
    minOrderQuantity: p.minimumOrderQuantityQuintals ?? p.minOrderQuantity ?? 1,
    moisturePercentage: p.moisturePercentage ?? 0,
    isOrganicCertified: p.isOrganicCertified ?? false,
    packagingType: p.packagingType || '',
    harvestDate: p.harvestDate || '',
    location: { district: p.districtOfOrigin || '', state: p.stateOfOrigin || '', nearestMandi: p.nearestMandiYard || '' },
    description: p.cropDescription || p.description || '',
    imageUrl: p.imageUrl || p.images?.[0]?.url || '',
    images: p.images?.map((i: any) => i.url) || [],
    sellerId: p.sellerId || '',
    sellerName: p.sellerName || '',
    sellerType: 'Individual Farmer',
    shelfLifeDays: p.shelfLifeDays ?? 180,
    status: p.listingStatus || p.status || 'active',
  };
}

export const SellerWindowPage: React.FC = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // listing id being actioned
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerListings();
      const items = res.data || res.listings || res || [];
      setListings(Array.isArray(items) ? items.map(mapProduct) : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await marketplaceService.updateFarmerListingStatus(id, newStatus);
      await loadListings();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setActionLoading(id);
    try {
      await marketplaceService.deleteFarmerListing(id);
      await loadListings();
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredListings = listings.filter(c => {
    if (filterStatus === 'all') return true;
    return (c.status || '').toLowerCase() === filterStatus;
  });

  const countFor = (status: string) => status === 'all'
    ? listings.length
    : listings.filter(c => (c.status || '').toLowerCase() === status).length;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Seller Window (My Harvest Lots)' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Seller Window — Harvest Inventory Management"
        subtitle="Control your active mandi lots, adjust pricing per quintal, and manage harvest availability"
        badge={`${listings.length} Total Lots`}
        action={
          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={loadListings}
              disabled={loading}
              className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              variant="primary"
              onClick={() => navigate('/farmer/seller-window/add')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Harvest Lot</span>
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="error" title="Error" description={error} className="mb-4" />
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
              filterStatus === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{tab.label}</span>
            {countFor(tab.id) > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                filterStatus === tab.id ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-600'
              }`}>
                {countFor(tab.id)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-48">
              <div className="h-3 bg-stone-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-stone-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyState
            title="No Harvest Lots Found"
            description={filterStatus === 'all'
              ? "Start listing your harvested crops to receive spot inquiries and bulk buyer bids."
              : `No ${filterStatus} listings found. Try a different filter.`}
            icon={Sprout}
            action={
              filterStatus === 'all' ? (
                <Button
                  variant="primary"
                  onClick={() => navigate('/farmer/seller-window/add')}
                  className="mt-4"
                >
                  List Your First Crop
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : viewMode === 'table' ? (
        <CropListingTable
          crops={filteredListings}
          onEdit={(c) => navigate(`/farmer/seller-window/add?edit=${c.id}`)}
          onDelete={(id) => handleDelete(id)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((crop) => (
            <div key={crop.id} className="relative group">
              <CropListingCard
                crop={crop}
                onEdit={() => navigate(`/farmer/seller-window/add?edit=${crop.id}`)}
                onDelete={() => handleDelete(crop.id)}
              />
              {/* Status action overlay buttons */}
              <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {crop.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(crop.id, 'paused')}
                    disabled={actionLoading === crop.id}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow cursor-pointer disabled:opacity-50"
                    title="Pause listing"
                  >
                    <Pause className="w-3 h-3" />Pause
                  </button>
                )}
                {crop.status === 'paused' && (
                  <button
                    onClick={() => handleStatusChange(crop.id, 'active')}
                    disabled={actionLoading === crop.id}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow cursor-pointer disabled:opacity-50"
                    title="Resume listing"
                  >
                    <Play className="w-3 h-3" />Resume
                  </button>
                )}
                {(crop.status === 'active' || crop.status === 'paused') && (
                  <button
                    onClick={() => handleStatusChange(crop.id, 'archived')}
                    disabled={actionLoading === crop.id}
                    className="flex items-center gap-1 px-2 py-1 bg-stone-500 hover:bg-stone-600 text-white text-[10px] font-bold rounded-lg shadow cursor-pointer disabled:opacity-50"
                    title="Archive listing"
                  >
                    <Archive className="w-3 h-3" />Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};




export const SellerWindowPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUser, crops, deleteCrop, language } = useApp();

  const farmerUser = user || currentUser;
  const myCrops = crops.filter(c => c.sellerId === farmerUser.id || c.sellerName.includes(farmerUser.name) || c.sellerId === 'user_farmer_1');

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredCrops = myCrops.filter(c => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  const categories = Array.from(new Set(myCrops.map(c => c.category)));

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Seller Window (My Harvest Lots)' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Seller Window — Harvest Inventory Management"
        subtitle="Control your active mandi lots, adjust pricing per quintal, and manage harvest availability"
        badge={`${myCrops.length} Active Lots`}
        action={
          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/farmer/seller-window/add')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Harvest Lot</span>
            </Button>
          </div>
        }
      />

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              filterCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories ({myCrops.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content Rendering */}
      {filteredCrops.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyState
            title="No Harvest Lots Listed"
            description="Start listing your harvested crops to receive spot inquiries and bulk buyer bids."
            icon={Sprout}
            action={
              <Button
                variant="primary"
                onClick={() => navigate('/farmer/seller-window/add')}
                className="mt-4"
              >
                List Your First Crop
              </Button>
            }
          />
        </div>
      ) : viewMode === 'table' ? (
        <CropListingTable
          crops={filteredCrops}
          onEdit={(c) => navigate(`/farmer/seller-window/add?edit=${c.id}`)}
          onDelete={(id) => deleteCrop(id)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropListingCard
              key={crop.id}
              crop={crop}
              onEdit={() => navigate(`/farmer/seller-window/add?edit=${crop.id}`)}
              onDelete={() => deleteCrop(crop.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
