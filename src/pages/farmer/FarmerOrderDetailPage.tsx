import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  OrderTimeline,
  OrderStatus,
  Alert,
  Button,
  Input,
  LoadingState,
} from '../../components/ui';
import {
  Truck,
  Phone,
  Scale,
  CheckCircle2,
  ArrowRight,
  Package,
  MapPin,
  User,
  IndianRupee,
  RefreshCw,
  X,
} from 'lucide-react';

// ─── Status flow for this page (DB schema statuses) ──────────────────────────
const STATUS_FLOW = [
  { status: 'pending_confirmation', label: 'Received' },
  { status: 'confirmed',            label: 'Confirmed' },
  { status: 'weighment_pending',    label: 'Weighment' },
  { status: 'dispatched',          label: 'Dispatched' },
  { status: 'in_transit',          label: 'In Transit' },
  { status: 'delivered',           label: 'Delivered' },
];

// ─── Farmer-allowed transitions ───────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  'pending_confirmation': [
    { label: 'Accept Order', next: 'confirmed',         color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Cancel Order', next: 'cancelled',         color: 'bg-red-500 hover:bg-red-600' },
  ],
  'confirmed': [
    { label: 'Start Packing / Weighment', next: 'weighment_pending', color: 'bg-emerald-600 hover:bg-emerald-700' },
  ],
  'weighment_pending': [],  // weighment form handles transition to dispatched
  'dispatched': [
    { label: 'Mark In Transit', next: 'in_transit', color: 'bg-blue-600 hover:bg-blue-700' },
  ],
  'in_transit': [],
  'delivered': [],
  'cancelled': [],
  'disputed': [],
};

// ─── Section card wrapper ──────────────────────────────────────────────────────
const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title, icon, children, className = ''
}) => (
  <div className={`bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs ${className}`}>
    <h2 className="font-display font-semibold text-stone-900 mb-4 text-sm flex items-center gap-2">
      {icon}{title}
    </h2>
    {children}
  </div>
);

export const FarmerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weighment form
  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [weighmentSlipRef, setWeighmentSlipRef] = useState('');
  const [weighmentLoading, setWeighmentLoading] = useState(false);
  const [weighmentSuccess, setWeighmentSuccess] = useState(false);
  const [weighmentError, setWeighmentError] = useState<string | null>(null);

  // Dispatch form
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Status transition
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerOrder(id);
      setOrder(res.order || res);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading order details…" />
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Farmer Dashboard', href: '/farmer' },
            { label: 'Orders', href: '/farmer/orders' },
            { label: 'Order Not Found' },
          ]}
          className="mb-4"
        />
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-600 font-medium">{error || 'Order not found'}</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/farmer/orders')}>
            ← Back to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const item = order.items?.[0] || {};
  const orderStatus: string = order.status || 'pending_confirmation';
  const statusIndex = STATUS_FLOW.findIndex(s => s.status === orderStatus);
  const transitions = ALLOWED_TRANSITIONS[orderStatus] || [];
  const hasWeighment = Boolean(order.weighment || order.certifiedWeightQuintals);
  const canDoWeighment = orderStatus === 'weighment_pending' && !hasWeighment;
  const canDoDispatch = orderStatus === 'weighment_pending' && hasWeighment && !dispatchSuccess;

  // ── Status transition ─────────────────────────────────────────────────────────
  const handleStatusTransition = async (nextStatus: string) => {
    setStatusLoading(true);
    setStatusError(null);
    setStatusSuccess(null);
    try {
      await marketplaceService.updateFarmerOrderStatus(id!, nextStatus);
      setStatusSuccess(`Order moved to: ${nextStatus.replace(/_/g, ' ')}`);
      await loadOrder();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Weighment submit ──────────────────────────────────────────────────────────
  const handleWeighment = async () => {
    const gross = Number(grossWeight);
    const tare = Number(tareWeight);
    if (!gross || gross <= 0) { setWeighmentError('Gross weight must be positive.'); return; }
    if (tare < 0) { setWeighmentError('Tare weight cannot be negative.'); return; }
    if (gross <= tare) { setWeighmentError('Gross weight must be greater than tare weight.'); return; }

    setWeighmentLoading(true);
    setWeighmentError(null);
    try {
      await marketplaceService.submitWeighment(id!, {
        grossWeightKg: gross,
        tareWeightKg: tare,
        weighbridgeSlipRef: weighmentSlipRef || undefined,
        unit: 'kg',
      });
      setWeighmentSuccess(true);
      await loadOrder();
    } catch (err: any) {
      setWeighmentError(err.message || 'Failed to submit weighment');
    } finally {
      setWeighmentLoading(false);
    }
  };

  // ── Dispatch submit ───────────────────────────────────────────────────────────
  const handleDispatch = async () => {
    if (!vehicleNumber) { setDispatchError('Vehicle number is required.'); return; }
    if (!driverContact) { setDispatchError('Driver contact number is required.'); return; }

    setDispatchLoading(true);
    setDispatchError(null);
    try {
      await marketplaceService.submitDispatch(id!, {
        vehicleNumber,
        driverContactNumber: driverContact,
        driverName: driverName || 'Driver',
      });
      setDispatchSuccess(true);
      await loadOrder();
    } catch (err: any) {
      setDispatchError(err.message || 'Failed to submit dispatch');
    } finally {
      setDispatchLoading(false);
    }
  };

  // ── Timeline checkpoints from statusHistory ───────────────────────────────────
  const checkpoints = (order.statusHistory || []).map((h: any) => ({
    status: h.newStatus,
    timestamp: h.timestamp || h.createdAt,
    note: h.changeReason || h.note || '',
  }));

  // ── Computed net weight ───────────────────────────────────────────────────────
  const computedNetKg =
    grossWeight && tareWeight
      ? Math.max(0, Number(grossWeight) - Number(tareWeight))
      : null;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Orders', href: '/farmer/orders' },
          { label: `Order #${order.orderNumber || order.id?.slice(-6).toUpperCase()}` },
        ]}
        className="mb-4"
      />

      {/* Page title */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display font-bold text-xl text-stone-900">
            Dispatch Console — {item.cropName || item.varietyName || 'Order'}
          </h1>
          <OrderStatus status={orderStatus} />
        </div>
        <p className="text-stone-500 text-sm">
          Order #{order.orderNumber || '—'} &nbsp;·&nbsp;
          {order.totalQuantityQuintals} Qtl for{' '}
          <span className="font-semibold text-stone-700">{order.buyer?.name || 'Buyer'}</span>
        </p>
      </div>

      {/* Alerts */}
      {order.paymentStatus === 'escrow_locked' && (
        <Alert
          variant="escrow"
          title="Escrow Agropay — Payment Secured"
          description={`₹${(order.totalAmount || 0).toLocaleString('en-IN')} is secured in Agropay escrow. Funds release automatically once delivery is confirmed.`}
          className="mb-4"
        />
      )}
      {statusSuccess && (
        <Alert variant="success" title="Status Updated" description={statusSuccess} className="mb-4" />
      )}
      {statusError && (
        <Alert variant="error" title="Status Error" description={statusError} className="mb-4" />
      )}
      {dispatchSuccess && (
        <Alert variant="success" title="Dispatched Successfully!" description="Buyer has been notified. Escrow funds will release after delivery confirmation." className="mb-4" />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left column ──────────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Status progress bar */}
          <SectionCard title="Order Progression">
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {STATUS_FLOW.map((step, idx) => {
                const isCompleted = statusIndex > idx;
                const isCurrent = step.status === orderStatus;
                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600'
                          : isCurrent
                          ? 'bg-white border-emerald-600'
                          : 'bg-white border-stone-300'
                      }`}>
                        {isCompleted
                          ? <CheckCircle2 className="w-4 h-4 text-white" />
                          : <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                        }
                      </div>
                      <span className={`text-[10px] mt-1 font-medium text-center max-w-[60px] leading-tight ${
                        isCurrent ? 'text-emerald-700' : isCompleted ? 'text-stone-600' : 'text-stone-400'
                      }`}>{step.label}</span>
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 min-w-[16px] ${isCompleted ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </SectionCard>

          {/* Status action buttons */}
          {transitions.length > 0 && (
            <SectionCard title="Action Required">
              <div className="flex flex-wrap gap-3">
                {transitions.map(t => (
                  <Button
                    key={t.next}
                    variant="primary"
                    className={`${t.color} text-white font-bold flex items-center gap-2`}
                    disabled={statusLoading}
                    onClick={() => handleStatusTransition(t.next)}
                  >
                    {statusLoading ? 'Updating…' : (
                      <>
                        {t.label} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">
                All status changes are recorded in the order history and notified to the buyer.
              </p>
            </SectionCard>
          )}

          {/* Weighment Form */}
          {canDoWeighment && !weighmentSuccess && (
            <SectionCard title="Certified Weighment" icon={<Scale className="w-4 h-4 text-emerald-600" />}>
              <p className="text-xs text-stone-500 mb-4">
                Enter weighbridge verified weights. Net weight is calculated server-side.
              </p>
              {weighmentError && (
                <Alert variant="error" title="Weighment Error" description={weighmentError} className="mb-3" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Gross Weight (kg) *"
                  type="number"
                  min={1}
                  step={0.01}
                  value={grossWeight}
                  onChange={e => setGrossWeight(e.target.value)}
                  placeholder="e.g. 10250"
                />
                <Input
                  label="Tare Weight (kg) *"
                  type="number"
                  min={0}
                  step={0.01}
                  value={tareWeight}
                  onChange={e => setTareWeight(e.target.value)}
                  placeholder="e.g. 250"
                />
              </div>
              {computedNetKg !== null && (
                <div className="mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Calculated Net Weight: <span className="font-extrabold text-emerald-900">{computedNetKg.toFixed(2)} kg ({(computedNetKg / 100).toFixed(2)} quintals)</span>
                  <span className="text-emerald-600 text-[10px]">(verified server-side on submit)</span>
                </div>
              )}
              <Input
                label="Weighbridge Slip Reference"
                placeholder="e.g. WB/2026/0042"
                value={weighmentSlipRef}
                onChange={e => setWeighmentSlipRef(e.target.value)}
                className="mt-4"
              />
              <Button
                variant="primary"
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
                disabled={!grossWeight || !tareWeight || weighmentLoading}
                onClick={handleWeighment}
              >
                {weighmentLoading ? 'Submitting…' : (
                  <><CheckCircle2 className="w-4 h-4" /> Submit Weighment</>
                )}
              </Button>
            </SectionCard>
          )}

          {weighmentSuccess && (
            <Alert variant="success" title="Weighment Recorded" description="Certified weighment has been saved. You can now submit dispatch details." className="" />
          )}

          {/* Dispatch Form */}
          {(canDoDispatch || (orderStatus === 'weighment_pending' && hasWeighment && !dispatchSuccess)) && !dispatchSuccess && (
            <SectionCard title="Freight & Dispatch Details" icon={<Truck className="w-4 h-4 text-emerald-600" />}>
              <p className="text-xs text-stone-500 mb-4">
                Fill in truck and driver details. Submitting will mark order as Dispatched.
              </p>
              {dispatchError && (
                <Alert variant="error" title="Dispatch Error" description={dispatchError} className="mb-3" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Vehicle / Truck Number *"
                  placeholder="e.g. MH 12 AB 3456"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  leftIcon={<Truck className="w-4 h-4" />}
                />
                <Input
                  label="Driver Contact Number *"
                  placeholder="10-digit mobile"
                  value={driverContact}
                  onChange={e => setDriverContact(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Driver Name"
                  placeholder="Driver's full name"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                />
                <Input
                  label="Transporter / Logistics Company"
                  placeholder="e.g. APMC Mandi Logistics"
                  value={transporterName}
                  onChange={e => setTransporterName(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="mt-5 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
                disabled={!vehicleNumber || !driverContact || dispatchLoading}
                onClick={handleDispatch}
              >
                {dispatchLoading ? 'Updating…' : (
                  <><Truck className="w-4 h-4" /> Mark as Dispatched <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </SectionCard>
          )}

          {/* Shipment info (if exists) */}
          {order.shipment && (
            <SectionCard title="Shipment Information" icon={<Truck className="w-4 h-4 text-blue-600" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-stone-500 font-medium">Vehicle</p>
                  <p className="text-stone-900 font-bold">{order.shipment.vehicleNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Driver</p>
                  <p className="text-stone-900 font-bold">{order.shipment.driverName || '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Contact</p>
                  <p className="text-stone-900 font-bold">{order.shipment.driverContactNumber || order.shipment.driverPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Transporter</p>
                  <p className="text-stone-900 font-bold">{order.shipment.transporterName || order.shipment.logisticsPartnerName || '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Tracking</p>
                  <p className="text-stone-900 font-bold font-mono">{order.shipment.trackingNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Status</p>
                  <p className="text-stone-900 font-bold capitalize">{order.shipment.status?.replace(/_/g, ' ') || '—'}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Weighment record (if exists) */}
          {hasWeighment && order.weighment && (
            <SectionCard title="Weighment Record" icon={<Scale className="w-4 h-4 text-amber-600" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-stone-500 font-medium">Gross Weight</p>
                  <p className="text-stone-900 font-bold">{order.weighment.grossWeight} kg</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Tare Weight</p>
                  <p className="text-stone-900 font-bold">{order.weighment.tareWeight} kg</p>
                </div>
                <div>
                  <p className="text-stone-500 font-medium">Net Weight (Certified)</p>
                  <p className="text-emerald-700 font-extrabold">{order.weighment.netWeight} kg</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Delivery address */}
          <SectionCard title="Buyer Delivery Address" icon={<MapPin className="w-4 h-4 text-emerald-600" />}>
            <div className="text-sm text-stone-700 leading-relaxed">
              <p className="font-semibold">{order.buyer?.name || '—'}</p>
              {order.buyer?.businessName && (
                <p className="text-stone-500 text-xs">{order.buyer.businessName}</p>
              )}
              <p className="text-stone-500 mt-1">📞 {order.buyer?.phone || '—'}</p>
            </div>
          </SectionCard>

          {/* Order timeline */}
          {checkpoints.length > 0 && (
            <SectionCard title="Order Timeline">
              <OrderTimeline checkpoints={checkpoints} />
            </SectionCard>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Order summary card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <h2 className="font-display font-semibold text-stone-900 mb-4 text-sm flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Order Summary
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Order #</span>
                <span className="font-mono font-bold text-stone-900">{order.orderNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Crop</span>
                <span className="font-semibold text-stone-900">{item.cropName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Variety</span>
                <span className="font-semibold text-stone-900">{item.varietyName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Quantity</span>
                <span className="font-semibold text-stone-900">{order.totalQuantityQuintals} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Rate</span>
                <span className="font-semibold text-stone-900">₹{(item.pricePerQuintal || item.unitPrice || 0).toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between">
                <span className="text-stone-500">Crop Amount</span>
                <span className="font-bold text-stone-900">₹{(order.cropSubtotalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Platform Fee</span>
                <span className="text-stone-700">₹{(order.platformFeeAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Freight</span>
                <span className="text-stone-700">₹{(order.freightLogisticsAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm">
                <span className="font-bold text-stone-900">Total</span>
                <span className="font-extrabold text-emerald-700">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-stone-500">Payment Status</span>
                <span className={`font-bold capitalize px-2 py-0.5 rounded-full text-[10px] ${
                  order.paymentStatus === 'escrow_locked' ? 'bg-amber-100 text-amber-800' :
                  order.paymentStatus === 'disbursed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {(order.payment?.status || order.paymentStatus || 'Pending').replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Order Date</span>
                <span className="text-stone-700">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Buyer info card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <h2 className="font-display font-semibold text-stone-900 mb-3 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Buyer
            </h2>
            <div className="text-xs space-y-1.5">
              <p className="font-bold text-stone-900">{order.buyer?.name || '—'}</p>
              {order.buyer?.businessName && (
                <p className="text-stone-500">{order.buyer.businessName}</p>
              )}
              <p className="text-stone-500">📞 {order.buyer?.phone || '—'}</p>
            </div>
          </div>

          {/* Refresh button */}
          <Button variant="outline" className="w-full flex items-center gap-2 justify-center" onClick={loadOrder}>
            <RefreshCw className="w-4 h-4" /> Refresh Order
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => navigate('/farmer/orders')}>
            ← Back to Orders
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
