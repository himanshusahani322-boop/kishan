import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  OrderCard,
  EmptyState,
  Alert,
} from '../../components/ui';
import { Package, RefreshCw } from 'lucide-react';

// ─── Status filter definitions (aligned with DB schema) ───────────────────────
const FILTER_TABS = [
  { id: 'all',                  label: 'All Orders' },
  { id: 'pending_confirmation', label: 'New' },
  { id: 'confirmed',            label: 'Confirmed' },
  { id: 'weighment_pending',    label: 'Weighment' },
  { id: 'dispatched',          label: 'Dispatched' },
  { id: 'in_transit',          label: 'In Transit' },
  { id: 'delivered',           label: 'Delivered' },
] as const;

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const OrderSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-36">
    <div className="h-3 bg-stone-200 rounded w-1/3 mb-3" />
    <div className="h-3 bg-stone-100 rounded w-2/3 mb-2" />
    <div className="h-3 bg-stone-100 rounded w-1/2" />
  </div>
);

// ─── Map DB order shape → OrderCard shape ─────────────────────────────────────
function mapDbOrder(o: any) {
  const item = o.items?.[0] || {};
  return {
    id: o.id,
    cropTitle: item.cropName || item.varietyName || 'Agricultural Order',
    buyerName: o.buyer?.name || o.buyerName || 'Buyer',
    buyerPhone: o.buyer?.phone || '',
    quantityQuintals: o.totalQuantityQuintals ?? item.quantityQuintals ?? 0,
    totalAmount: o.totalAmount ?? 0,
    orderStatus: o.status || 'pending_confirmation',
    paymentStatus: o.paymentStatus || o.payment?.status || 'pending',
    trackingId: o.orderNumber || o.id?.slice(-8).toUpperCase() || '',
    sellerId: o.farmerId || '',
    sellerName: o.farmer?.name || '',
    deliveryAddress: o.deliveryAddress || {
      addressLine: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
    },
    vehicleNumber: o.shipment?.vehicleNumber || '',
    driverContact: o.shipment?.driverContactNumber || '',
    checkpoints: (o.statusHistory || []).map((h: any) => ({
      status: h.newStatus,
      timestamp: h.timestamp || h.createdAt,
      note: h.changeReason || h.note || '',
    })),
    createdAt: o.createdAt,
  };
}

export const FarmerOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerOrders();
      const raw = res.orders || res.data || res || [];
      setOrders(Array.isArray(raw) ? raw.map(mapDbOrder) : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus);

  const countFor = (status: string) =>
    status === 'all' ? orders.length : orders.filter(o => o.orderStatus === status).length;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Order Dispatch Center' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Order Dispatch & Mandi Freight Center"
        subtitle="Manage incoming buyer orders, allocate freight trucks, and upload certified weighbridge slips"
        badge={`${orders.length} Total Orders`}
        action={
          <button
            onClick={loadOrders}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {error && (
        <Alert variant="error" title="Error Loading Orders" description={error} className="mb-4" />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 border-b border-stone-200">
        {FILTER_TABS.map(tab => (
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

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description={
            filterStatus === 'all'
              ? 'You have no orders yet. Active buyer orders will appear here once received.'
              : `No orders with status "${FILTER_TABS.find(t => t.id === filterStatus)?.label}". Try a different filter.`
          }
          icon={Package}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              role="farmer"
              onViewDetails={() => navigate(`/farmer/orders/${order.id}`)}
              onDispatchAction={() => navigate(`/farmer/orders/${order.id}`)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
