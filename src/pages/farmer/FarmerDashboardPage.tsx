import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  SectionHeader,
  WeatherForecast,
  FarmerStatCard,
  ServiceCard,
  CropListingCard,
  OrderCard,
  Button,
  Alert
} from '../../components/ui';
import {
  Sprout,
  Layers,
  TrendingUp,
  Truck,
  PlusCircle,
  Warehouse,
  Calculator,
  Bot,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// ─── Skeleton loaders ──────────────────────────────────────────────────────────
const StatSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse">
    <div className="h-3 bg-stone-200 rounded w-2/3 mb-3" />
    <div className="h-7 bg-stone-200 rounded w-1/2 mb-2" />
    <div className="h-2 bg-stone-100 rounded w-3/4" />
  </div>
);
const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-40">
    <div className="h-3 bg-stone-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-stone-100 rounded w-1/2 mb-2" />
    <div className="h-3 bg-stone-100 rounded w-full" />
  </div>
);

// ─── DB → card shape mappers ───────────────────────────────────────────────────
function mapDbProductToCard(p: any) {
  return {
    id: p.id,
    title: p.cropName || p.title || 'Unnamed Crop',
    hindiTitle: p.hindiTitle || '',
    category: p.category || 'Grains & Cereals',
    variety: p.variety || '',
    grade: p.qualityGrade || p.grade || 'Grade A (Premium)',
    pricePerQuintal: p.pricePerQuintal ?? p.price ?? 0,
    mandiBenchmarkPrice: p.mandiBenchmarkPrice ?? 0,
    quantityAvailable: p.availableQuantityQuintals ?? p.quantityAvailable ?? 0,
    minOrderQuantity: p.minimumOrderQuantityQuintals ?? p.minOrderQuantity ?? 1,
    moisturePercentage: p.moisturePercentage ?? 0,
    isOrganicCertified: p.isOrganicCertified ?? false,
    packagingType: p.packagingType || '',
    harvestDate: p.harvestDate || '',
    location: { district: p.districtOfOrigin || '', state: p.stateOfOrigin || '', nearestMandi: p.nearestMandiYard || '' },
    description: p.cropDescription || p.description || '',
    imageUrl: p.imageUrl || (p.images?.[0]?.url) || '',
    images: p.images?.map((i: any) => i.url) || [],
    sellerId: p.sellerId || '',
    sellerName: p.sellerName || '',
    sellerType: 'Individual Farmer',
    shelfLifeDays: p.shelfLifeDays ?? 180,
    status: p.listingStatus || p.status || 'active',
  };
}

function mapDbOrderToCard(o: any) {
  return {
    id: o.id,
    cropTitle: o.cropTitle || o.items?.[0]?.productTitle || 'Order',
    buyerName: o.buyerName || o.buyer?.name || 'Buyer',
    buyerPhone: o.buyerPhone || o.buyer?.phone || '',
    quantityQuintals: o.totalQuantityQuintals ?? o.items?.reduce((s: number, i: any) => s + i.quantityQuintals, 0) ?? 0,
    totalAmount: o.totalAmountINR ?? o.totalAmount ?? 0,
    orderStatus: o.orderStatus || o.status || 'pending_confirmation',
    paymentStatus: o.paymentStatus || '',
    trackingId: o.trackingId || o.id?.slice(-8).toUpperCase() || '',
    sellerId: o.sellerId || '',
    sellerName: o.sellerName || '',
    deliveryAddress: o.deliveryAddress || o.shippingAddress || { addressLine: '', city: '', district: '', state: '', pincode: '' },
    vehicleNumber: o.vehicleNumber || o.shipment?.vehicleNumber || '',
    driverContact: o.driverContact || o.shipment?.driverContact || '',
    checkpoints: o.checkpoints || o.statusHistory?.map((h: any) => ({ status: h.status, timestamp: h.changedAt, note: h.note })) || [],
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerDashboard();
      setData(res.data || res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const metrics = data?.metrics;
  const profile = data?.profile;
  const activeProduce = (data?.activeProduce || []).slice(0, 3).map(mapDbProductToCard);
  const incomingOrders = (data?.incomingOrders || [])
    .filter((o: any) => ['pending_confirmation', 'confirmed', 'weighment_pending'].includes(o.orderStatus || o.status))
    .slice(0, 4)
    .map(mapDbOrderToCard);

  const displayName = profile?.name || user?.name || 'Kisan';
  const district = profile?.address?.district || user?.location?.district || 'Sehore';
  const state = profile?.address?.state || user?.location?.state || 'Madhya Pradesh';
  const isVerifiedFPO = profile?.fpoName || user?.isVerifiedFPO;

  return (
    <PageContainer>
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isVerifiedFPO ? 'Verified FPO Producer' : 'Kisan Krishi Kendra'}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">{district}, {state}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display mt-1">
            नमस्ते, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Welcome to your digital harvest, APMC bidding, and escrow dispatch center.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            variant="primary"
            onClick={() => navigate('/farmer/seller-window/add')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Harvest Lot</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Dashboard Error" description={error} className="mb-6" />
      )}

      {/* Weather */}
      <div className="mb-6">
        <WeatherForecast locationName={`${district} Agro-Climatic Zone`} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        ) : (
          <>
            <FarmerStatCard title="Active Harvest Lots" hindiTitle="सक्रिय फसल लॉट"
              value={metrics?.activeListingsCount ?? 0} unit="Listed"
              trend={{ value: 'Live on marketplace', isPositive: true }}
              icon={Layers} color="emerald" onClick={() => navigate('/farmer/seller-window')} />
            <FarmerStatCard title="Total Harvest Stock" hindiTitle="कुल उपलब्ध उपज"
              value={metrics?.availableStockQuintals ?? 0} unit="Quintals"
              trend={{ value: 'Available inventory', isPositive: true }}
              icon={Sprout} color="amber" onClick={() => navigate('/farmer/seller-window')} />
            <FarmerStatCard title="Pending Dispatches" hindiTitle="प्रेषण हेतु लंबित ऑर्डर"
              value={metrics?.pendingOrdersCount ?? 0} unit="Consignments"
              trend={{ value: 'Awaiting action', isPositive: (metrics?.pendingOrdersCount ?? 0) === 0 }}
              icon={Truck} color="blue" onClick={() => navigate('/farmer/orders')} />
            <FarmerStatCard title="Escrow Settlement" hindiTitle="कुल प्राप्त भुगतान"
              value={`₹${((metrics?.totalSales ?? 0) / 100000).toFixed(1)}L`} unit="INR Total"
              trend={{ value: 'Zero Brokerage', isPositive: true }}
              icon={TrendingUp} color="purple" onClick={() => navigate('/farmer/earnings')} />
          </>
        )}
      </div>

      {/* Services grid */}
      <div className="mb-8">
        <SectionHeader title="Farmer Support Services & Tools"
          subtitle="Instant access to Krishi AI advisory, cold storage bookings, and yield calculators"
          badge="Essential Tools" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ServiceCard title="Krishi AI Saathi" hindiTitle="कृषि AI सलाहकार"
            description="24/7 crop disease diagnostics, pest remedy suggestions, and weather-based crop advice."
            icon={Bot} tag="Instant" onClick={() => navigate('/farmer/ai')} />
          <ServiceCard title="Agri Calculators" hindiTitle="कृषि गणना यंत्र"
            description="Compute precise seed rate, NPK fertilizer dosages, and cold storage rental costs."
            icon={Calculator} tag="Precision" onClick={() => navigate('/farmer/calculations')} />
          <ServiceCard title="Crop Life Cycle" hindiTitle="फसल जीवन चक्र"
            description="Step-by-step agronomy roadmap from seed treatment to mandi harvesting."
            icon={Sprout} tag="Agronomy" onClick={() => navigate('/farmer/crop-life-cycle')} />
          <ServiceCard title="Cold Storage Finder" hindiTitle="कोल्ड स्टोरेज खोजें"
            description="Locate nearby government-subsidized cold rooms and humidity-controlled warehouses."
            icon={Warehouse} tag="WDRA" onClick={() => navigate('/farmer/cold-storage')} />
        </div>
      </div>

      {/* Pending dispatches */}
      <div className="mb-8">
        <SectionHeader title="Pending Mandi Freight Dispatches"
          subtitle="Buyer orders ready for truck allocation, driver assignment, and weighbridge gate transit"
          badge={`${incomingOrders.length} Orders Awaiting Dispatch`}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/farmer/orders')}>
              <span>View All Orders</span><ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          } />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
        ) : incomingOrders.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No pending dispatches right now. All received orders have been dispatched or fulfilled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOrders.map((order) => (
              <OrderCard key={order.id} order={order} role="farmer"
                onViewDetails={() => navigate(`/farmer/orders/${order.id}`)}
                onDispatchAction={() => navigate(`/farmer/orders/${order.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Active listings preview */}
      <div>
        <SectionHeader title="My Harvest Lots (Seller Window)"
          subtitle="Manage active crop lots, adjust pricing per quintal, and review incoming trade inquiries"
          badge={`${loading ? '…' : (metrics?.activeListingsCount ?? 0)} Active Lots`}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/farmer/seller-window')}>
              <span>Manage Inventory</span><ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          } />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : activeProduce.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-stone-300 text-center">
            <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500 mb-3">No active listings yet. Start listing your harvest!</p>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => navigate('/farmer/seller-window/add')}>
              <PlusCircle className="w-4 h-4 mr-2" />List First Harvest Lot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProduce.map((crop) => (
              <CropListingCard key={crop.id} crop={crop}
                onEdit={() => navigate(`/farmer/seller-window/add?edit=${crop.id}`)}
                onDelete={() => { marketplaceService.deleteFarmerListing(crop.id).then(loadDashboard).catch(() => {}); }} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};


