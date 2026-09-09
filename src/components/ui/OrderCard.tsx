import React from 'react';
import { Order } from '../../types';
import { OrderStatus } from './OrderStatus';
import { MapPin, Truck, ChevronRight, Calendar, User } from 'lucide-react';
import { Button } from './Button';

export interface OrderCardProps {
  order: Order;
  role: 'farmer' | 'buyer' | 'admin';
  onViewDetails: () => void;
  onDispatchAction?: () => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  role,
  onViewDetails,
  onDispatchAction,
  className = ''
}) => {
  const isFarmer = role === 'farmer';

  return (
    <div className={`p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
            #{order.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs text-stone-400">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <OrderStatus status={order.orderStatus} size="sm" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            {order.category}
          </span>
          <h4 className="font-bold text-base text-stone-900 truncate font-display">
            {order.cropTitle}
          </h4>
          <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
            <span>Quantity: <strong className="text-stone-900">{order.quantityQuintals} Quintals</strong></span>
            <span>•</span>
            <span>Rate: <strong className="text-stone-900">₹{order.pricePerQuintal.toLocaleString('en-IN')}/Q</strong></span>
          </div>
        </div>

        <div className="sm:text-right shrink-0">
          <span className="text-[11px] text-stone-400 block">Total Settlement</span>
          <span className="text-lg sm:text-xl font-extrabold text-stone-900 font-display">
            ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-0.5">
            {order.paymentStatus === 'paid' || order.paymentStatus === 'escrow_hold' ? '100% Escrow Funded' : order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 truncate">
          {isFarmer ? (
            <>
              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">Buyer: <strong className="text-stone-700">{order.buyerName}</strong> ({order.deliveryAddress.city})</span>
            </>
          ) : (
            <>
              <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">Origin: <strong className="text-stone-700">{order.sellerName}</strong></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isFarmer && order.orderStatus === 'confirmed' && onDispatchAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onDispatchAction}
            >
              Generate Mandi Dispatch
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <span>{isFarmer ? 'Dispatch Console' : 'Track Order'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
