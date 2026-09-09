import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  OrderStatus, 
  OrderTimeline, 
  ShipmentTimeline, 
  Button, 
  RatingStars,
  Alert 
} from '../../components/ui';
import { 
  Truck, 
  Phone, 
  Scale, 
  ShieldCheck, 
  Download, 
  FileCheck2, 
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, submitRating, showToast, language } = useApp();
  const { user } = useAuth();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(id || orders[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [isEscrowReleased, setIsEscrowReleased] = useState(false);

  const visibleOrders = orders.filter(o => {
    if (filterStatus === 'active') return o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled';
    if (filterStatus === 'delivered') return o.orderStatus === 'delivered';
    return true;
  });

  const activeOrder = orders.find(o => o.id === (id || selectedOrderId)) || visibleOrders[0] || orders[0];

  const handleReleaseEscrow = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'delivered', 'Physical Delivery & Certified Weighbridge Tare Verified by Buyer. Escrow Released to Farmer Bank Account.');
    setIsEscrowReleased(true);
    showToast('Escrow payment released to farmer account successfully.', 'success');
  };

  if (!activeOrder) {
    return (
      <PageContainer>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-stone-900 font-display">No Orders Found</h2>
          <Button variant="primary" onClick={() => navigate('/buyer/marketplace')}>
            Explore Marketplace Lots
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Orders', href: '/buyer/orders' },
          { label: `Tracking #${activeOrder.id.slice(-8).toUpperCase()}` }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Live Consignment Tracking & Escrow Settlement"
        subtitle="GPS-telemetry freight tracking, weighbridge inspection, and APMC gate clearance"
        badge={activeOrder.orderStatus.toUpperCase()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Selector / Tabs for multi-orders */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 font-display">Your Consignments</h3>
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                  filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                  filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                In Transit
              </button>
              <button
                onClick={() => setFilterStatus('delivered')}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                  filterStatus === 'delivered' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {visibleOrders.map((o) => {
              const isSelected = o.id === activeOrder.id;
              return (
                <div
                  key={o.id}
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    navigate(`/buyer/orders/${o.id}`);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-stone-900">
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                    <OrderStatus status={o.orderStatus} size="sm" />
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 truncate font-display">
                    {o.cropTitle}
                  </h4>
                  <p className="text-xs text-stone-500 truncate">
                    {o.quantityQuintals} Quintals • ₹{o.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tracking Details, Live GPS & Escrow Settlement */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Header Card */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Consignment #{activeOrder.id.slice(-8).toUpperCase()}
                </span>
                <h2 className="text-xl font-extrabold text-stone-900 font-display">
                  {activeOrder.cropTitle}
                </h2>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                  <span>Batch Volume: <strong className="text-stone-900">{activeOrder.quantityQuintals} Quintals</strong></span>
                  <span>•</span>
                  <span>Origin Farmer: <strong className="text-stone-900">{activeOrder.sellerName}</strong></span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-stone-400 block">Escrow Protected Total</span>
                <span className="text-2xl font-extrabold text-stone-900 font-display">
                  ₹{activeOrder.totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit sm:ml-auto mt-0.5">
                  100% Pre-Funded Escrow
                </span>
              </div>
            </div>

            {/* Live Freight & GPS Widget */}
            <ShipmentTimeline
              trackingId={activeOrder.trackingId}
              vehicleNumber={activeOrder.vehicleNumber}
              driverContact={activeOrder.driverContact}
              estimatedDelivery={activeOrder.estimatedDeliveryDate}
              weighbridgeWeightQuintals={activeOrder.quantityQuintals}
            />

            {/* Checkpoints Timeline */}
            <div className="pt-4 border-t border-stone-100">
              <h4 className="font-bold text-sm text-stone-900 mb-4 font-display">
                APMC Statutory Audit Checkpoints
              </h4>
              <OrderTimeline checkpoints={activeOrder.checkpoints} />
            </div>

            {/* Escrow Release Action if In Transit / Ready for Gate Inspection */}
            {activeOrder.orderStatus !== 'delivered' && (
              <div className="pt-4 border-t border-stone-100 p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Destination Gate Inspection & Escrow Release
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Confirm truck physical arrival, verify the weighbridge gross-tare slip, and inspect the sample. Clicking release will instantly disburse escrow payment to the farmer's registered bank account.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={handleReleaseEscrow}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Weighment & Release Escrow to Farmer</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => alert('Dispute flag raised. APMC Inspector assigned for arbitration within 2 hours.')}
                    className="text-stone-600 border-stone-300"
                  >
                    Flag Weighment Discrepancy
                  </Button>
                </div>
              </div>
            )}

            {activeOrder.orderStatus === 'delivered' && (
              <Alert
                variant="success"
                title="Escrow Settlement Disbursed & Completed"
              >
                Full payment of ₹{activeOrder.totalAmount.toLocaleString('en-IN')} has been transferred to {activeOrder.sellerName} via RTGS e-NAM clearing. Weighbridge audit slip is archived.
              </Alert>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
