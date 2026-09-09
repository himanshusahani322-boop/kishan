import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  OrderTimeline,
  ShipmentTimeline,
  OrderSummary,
  OrderStatus,
  Alert,
  Button,
  Input,
} from '../../components/ui';
import {
  Truck,
  User,
  Phone,
  Scale,
  Upload,
  CheckCircle2,
  ArrowRight,
  Package,
  MapPin,
} from 'lucide-react';

export const FarmerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const { user } = useAuth();

  const order = orders.find(o => o.id === id);

  const [vehicleNumber, setVehicleNumber] = useState(order?.vehicleNumber || '');
  const [driverContact, setDriverContact] = useState(order?.driverContact || '');
  const [weighbridgeRef, setWeighbridgeRef] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  if (!order) {
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
          <p className="text-stone-600 font-medium">Order not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/farmer/orders')}>
            Back to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const canDispatch =
    order.orderStatus === 'confirmed' || order.orderStatus === 'aggregated_at_mandi' || order.orderStatus === 'quality_inspected';

  const handleDispatch = async () => {
    setDispatchLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (updateOrderStatus) {
      updateOrderStatus(order.id, 'dispatched');
    }
    setDispatchSuccess(true);
    setDispatchLoading(false);
  };

  const statusFlow = [
    { status: 'placed', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'aggregated_at_mandi', label: 'Aggregated at Mandi' },
    { status: 'quality_inspected', label: 'Quality Inspected' },
    { status: 'dispatched', label: 'Dispatched' },
    { status: 'out_for_delivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Orders', href: '/farmer/orders' },
          { label: `Order #${order.id.slice(-6).toUpperCase()}` },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display font-bold text-xl text-stone-900">
            Dispatch Console — {order.cropTitle}
          </h1>
          <OrderStatus status={order.orderStatus} />
        </div>
        <p className="text-stone-500 text-sm">
          Tracking ID: <span className="font-mono font-semibold text-emerald-700">{order.trackingId}</span>
          &nbsp;·&nbsp; {order.quantityQuintals} Qtl for{' '}
          <span className="font-semibold text-stone-700">{order.buyerName}</span>
        </p>
      </div>

      {/* Escrow alert */}
      {order.paymentStatus === 'escrow_hold' && (
        <Alert
          variant="escrow"
          title="Escrow Agropay — Payment Secured"
          description={`₹${order.totalAmount.toLocaleString('en-IN')} is secured in Agropay escrow. Funds release automatically once the buyer confirms delivery.`}
          className="mb-6"
        />
      )}

      {dispatchSuccess && (
        <Alert
          variant="success"
          title="Order Dispatched Successfully!"
          description="The buyer has been notified. Escrow funds will be released after delivery confirmation."
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left / Main */}
        <div className="xl:col-span-2 space-y-6">

          {/* Status Progress Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <h2 className="font-display font-semibold text-stone-900 mb-4 text-sm">Order Progression</h2>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {statusFlow.map((step, idx) => {
                const isCompleted = statusFlow.findIndex(s => s.status === order.orderStatus) > idx;
                const isCurrent = step.status === order.orderStatus;
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
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium text-center max-w-[60px] leading-tight ${
                        isCurrent ? 'text-emerald-700' : isCompleted ? 'text-stone-600' : 'text-stone-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < statusFlow.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 min-w-[16px] ${
                        isCompleted ? 'bg-emerald-500' : 'bg-stone-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Dispatch Details Entry */}
          {canDispatch && !dispatchSuccess && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <h2 className="font-display font-semibold text-stone-900 mb-1">Freight & Dispatch Details</h2>
              <p className="text-xs text-stone-500 mb-4">
                Fill in truck details and weighbridge reference before marking as Dispatched.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Vehicle / Truck Number"
                  placeholder="e.g. MH 12 AB 3456"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  leftIcon={<Truck className="w-4 h-4" />}
                />
                <Input
                  label="Driver Contact Number"
                  placeholder="10-digit mobile"
                  value={driverContact}
                  onChange={e => setDriverContact(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Weighbridge Slip Reference No."
                  placeholder="e.g. WB/2025/0042"
                  value={weighbridgeRef}
                  onChange={e => setWeighbridgeRef(e.target.value)}
                  leftIcon={<Scale className="w-4 h-4" />}
                  className="sm:col-span-2"
                />
              </div>
              {/* Weighbridge upload placeholder */}
              <div className="mt-4 border-2 border-dashed border-stone-200 rounded-xl p-4 flex flex-col items-center gap-2 text-stone-400 bg-stone-50">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Upload Weighbridge Slip (PDF/Image)</span>
                <span className="text-[10px]">Max 5MB · JPEG, PNG, PDF</span>
                <button className="text-[11px] text-emerald-700 font-semibold underline underline-offset-2 cursor-pointer">
                  Browse Files
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={!vehicleNumber || !driverContact || dispatchLoading}
                  onClick={handleDispatch}
                >
                  {dispatchLoading ? 'Updating...' : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Mark as Dispatched
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Buyer Delivery Address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <h2 className="font-display font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Buyer Delivery Address
            </h2>
            <div className="text-sm text-stone-700 leading-relaxed">
              <p className="font-semibold">{order.buyerName}</p>
              <p className="text-stone-500">{order.deliveryAddress.addressLine}</p>
              <p className="text-stone-500">
                {order.deliveryAddress.city}, {order.deliveryAddress.district}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
              </p>
              <p className="text-stone-500 mt-1">📞 {order.buyerPhone}</p>
            </div>
          </div>

          {/* Timeline */}
          {order.checkpoints.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <h2 className="font-display font-semibold text-stone-900 mb-4">Shipment Timeline</h2>
              <OrderTimeline checkpoints={order.checkpoints} />
            </div>
          )}
        </div>

        {/* Right / Sidebar */}
        <div className="space-y-4">
          <OrderSummary order={order} />
        </div>
      </div>
    </PageContainer>
  );
};
