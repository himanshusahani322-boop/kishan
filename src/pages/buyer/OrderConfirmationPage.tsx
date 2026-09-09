import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageContainer, Button, OrderStatus } from '../../components/ui';
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Download, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock 
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, language } = useApp();

  const order = orders.find(o => o.id === id) || orders[0];

  return (
    <PageContainer maxWidth="lg">
      <div className="py-8 sm:py-12 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50 animate-in zoom-in-90 duration-200">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Escrow Pre-Funded & APMC Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Wholesale Procurement Order Booked
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Your consignment payment of <strong>₹{order?.totalAmount.toLocaleString('en-IN')}</strong> is safely locked in the RBI scheduled bank escrow account.
          </p>
        </div>
      </div>

      {order && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm space-y-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Order Number</span>
              <span className="font-mono font-bold text-stone-900">#{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Consignment Tracking ID</span>
              <span className="font-mono font-bold text-indigo-700">{order.trackingId}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Payment Gateway</span>
              <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Estimated Delivery</span>
              <span className="font-bold text-emerald-800">{order.estimatedDeliveryDate}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                {order.cropTitle}
              </h3>
              <p className="text-xs text-stone-500">
                Quantity: <strong>{order.quantityQuintals} Quintals</strong> • Producer: <strong>{order.sellerName}</strong>
              </p>
            </div>
            <OrderStatus status={order.orderStatus} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="space-y-1">
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Destination Warehouse</span>
              <p className="font-bold text-stone-900">{order.deliveryAddress.addressLine}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Assigned Freight Truck</span>
              <p className="font-bold text-stone-900">{order.vehicleNumber || 'MP-09-GH-4921 (16-Wheeler Tata Signa)'}</p>
              <p>Driver Contact: {order.driverContact || '+91 97552 11984 (Balwinder Singh)'}</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('e-NAM APMC Tax Invoice downloaded with digital signature.')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Mandi Tax Invoice</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/buyer/orders/${order.id}`)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
            >
              <span>Go to Live GPS Consignment Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
