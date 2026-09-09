import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Phone, 
  FileText, 
  Calendar,
  ExternalLink,
  Lock,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const OrdersTrackingView: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    orders, 
    updateOrderStatus, 
    submitRating, 
    language 
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Rating modal
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');

  // Filter orders relevant to current user
  const visibleOrders = orders.filter(order => {
    const isUserOrder = 
      currentRole === 'admin' || 
      order.buyerId === currentUser.id || 
      order.sellerId === currentUser.id ||
      order.sellerName.includes(currentUser.name);

    if (!isUserOrder) return false;

    if (filterStatus === 'active') return order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
    if (filterStatus === 'delivered') return order.orderStatus === 'delivered';
    return true;
  });

  const activeOrder = orders.find(o => o.id === selectedOrderId) || visibleOrders[0] || null;

  const handleOpenRating = (order: Order) => {
    setRatingOrderId(order.id);
    setIsRatingModalOpen(true);
    setRatingScore(5);
    setReviewText('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrderId) return;
    submitRating(ratingOrderId, currentRole === 'farmer' ? 'farmer' : 'buyer', ratingScore, reviewText);
    setIsRatingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 font-display">
            {language === 'hi' ? 'ऑर्डर ट्रैकिंग व सुरक्षित डिलीवरी' : 'Wholesale Consignments & GPS Tracking'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time milestones from farm harvest weighment to delivery hub with RBI escrow protection.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
          >
            All ({visibleOrders.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'active' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
          >
            In Transit
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'delivered' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
          >
            Delivered
          </button>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
          <Truck className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No consignment orders found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you purchase wholesale lots from the marketplace or accept an RFQ contract, your live dispatch track will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {visibleOrders.map(order => {
              const isSelected = activeOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all bg-white text-xs space-y-2.5 ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/15 shadow-sm' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-sm font-display">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.orderStatus === 'in_transit' || order.orderStatus === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-800">{order.cropTitle}</h4>
                    <div className="text-stone-500">
                      Quantity: <strong>{order.quantityQuintals} Qtl</strong> • Amount: <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <span className="truncate max-w-[180px]">From: {order.sellerName}</span>
                    <span className="font-semibold text-emerald-700">Track: {order.trackingId}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Order Live Tracker & Details (7 cols) */}
          {activeOrder && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6 text-xs">
              {/* Top Order Overview Banner */}
              <div className="p-4 bg-emerald-950 text-white rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-300 text-[11px] font-semibold">
                      Live Freight Consignment Contract
                    </span>
                    <h3 className="text-lg font-extrabold font-display">{activeOrder.cropTitle}</h3>
                    <p className="text-stone-300 text-xs">
                      Contract #{activeOrder.id} • Tracking ID: {activeOrder.trackingId}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-stone-400 block text-[10px]">Escrow Value</span>
                    <span className="text-xl font-black text-amber-400 font-display">
                      ₹{activeOrder.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Vehicle and Driver details if available */}
                {activeOrder.vehicleNumber && (
                  <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      Vehicle: <strong className="text-white">{activeOrder.vehicleNumber}</strong>
                    </span>
                    {activeOrder.driverContact && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        Driver: <strong className="text-white">{activeOrder.driverContact}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Checkpoint Tracking Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                  Consignment Milestones & Assay Verification:
                </h4>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {activeOrder.checkpoints.map((cp, idx) => (
                    <div key={idx} className="relative space-y-1">
                      {/* Milestone marker circle */}
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        cp.completed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {cp.completed ? '✓' : idx + 1}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${cp.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                          {cp.title}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">{cp.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{cp.location}</span>
                      </div>

                      {cp.notes && (
                        <p className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-md border border-stone-100">
                          {cp.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Participants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="space-y-1">
                  <span className="font-bold text-stone-800 block text-xs">Buyer Destination:</span>
                  <p className="text-stone-600 text-xs">
                    {activeOrder.deliveryAddress.addressLine}, {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state} - {activeOrder.deliveryAddress.pincode}
                  </p>
                  <p className="text-stone-500 text-[11px]">Consignee: {activeOrder.buyerName} ({activeOrder.buyerPhone})</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-stone-800 block text-xs">Seller Producer / FPO:</span>
                  <p className="text-stone-600 text-xs">{activeOrder.sellerName}</p>
                  <p className="text-stone-500 text-[11px]">Contact: {activeOrder.sellerPhone}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> APMC Certified Mandi Assay
                  </span>
                </div>
              </div>

              {/* Two-Way Ratings Section */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                    Two-Way Mandi Feedback & Reputation:
                  </h4>
                  <button
                    onClick={() => handleOpenRating(activeOrder)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Submit Rating / समीक्षा दें</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Buyer Rating */}
                  <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Buyer Quality Review:</span>
                      {activeOrder.buyerRating && (
                        <span className="text-amber-600 font-bold">★ {activeOrder.buyerRating.rating}/5</span>
                      )}
                    </div>
                    {activeOrder.buyerRating ? (
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        "{activeOrder.buyerRating.review}"
                      </p>
                    ) : (
                      <p className="text-stone-400 text-[11px] italic">Pending buyer delivery confirmation rating.</p>
                    )}
                  </div>

                  {/* Farmer Rating */}
                  <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Farmer / FPO Review:</span>
                      {activeOrder.farmerRating && (
                        <span className="text-amber-600 font-bold">★ {activeOrder.farmerRating.rating}/5</span>
                      )}
                    </div>
                    {activeOrder.farmerRating ? (
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        "{activeOrder.farmerRating.review}"
                      </p>
                    ) : (
                      <p className="text-stone-400 text-[11px] italic">Farmer rating for payment promptness pending.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Completion Simulation for Buyer or Admin */}
              {activeOrder.orderStatus !== 'delivered' && (
                <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between">
                  <div className="text-stone-600 text-xs">
                    Upon delivery inspection, confirm acceptance to release Escrow to farmer.
                  </div>
                  <button
                    onClick={() => updateOrderStatus(activeOrder.id, 'delivered', 'Consignment Unloaded & Inspected. Escrow payout released.')}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs"
                  >
                    Confirm Delivery & Release Escrow
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-extrabold text-stone-900 font-display">
                {currentRole === 'farmer' ? 'Rate Buyer Handling & Payment' : 'Rate Farmer Crop Quality & Packaging'}
              </h3>
              <button 
                onClick={() => setIsRatingModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-2">Score Rating (1 to 5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      className="p-1.5 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-7 h-7 ${star <= ratingScore ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                  <span className="font-bold text-sm text-stone-800 ml-2">{ratingScore} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Feedback & Comments:</label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder={currentRole === 'farmer' 
                    ? 'Comment on buyer weighment accuracy, prompt payment clearance, and gate unloading speed...'
                    : 'Comment on crop moisture, grain luster, bag packaging quality, and vehicle dispatch timing...'}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
