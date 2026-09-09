import React from 'react';
import { Order } from '../../types';
import { 
  Clock, 
  Package, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  XCircle,
  AlertCircle
} from 'lucide-react';

export interface OrderStatusProps {
  status: Order['orderStatus'];
  className?: string;
  size?: 'sm' | 'md';
}

export const OrderStatus: React.FC<OrderStatusProps> = ({
  status,
  className = '',
  size = 'md'
}) => {
  const config = {
    placed: {
      label: 'Order Placed (Escrow Pre-Funded)',
      icon: Clock,
      style: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    confirmed: {
      label: 'Confirmed by Farmer',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    aggregated_at_mandi: {
      label: 'Aggregated at APMC Mandi',
      icon: Package,
      style: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    quality_inspected: {
      label: 'AGMARK Quality Assayed',
      icon: ShieldCheck,
      style: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    dispatched: {
      label: 'Dispatched in GPS Transit',
      icon: Truck,
      style: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    out_for_delivery: {
      label: 'Out for Delivery (Truck Reaching Gate)',
      icon: Truck,
      style: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    delivered: {
      label: 'Delivered & Escrow Released',
      icon: CheckCircle2,
      style: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
    },
    cancelled: {
      label: 'Order Cancelled & Refunded',
      icon: XCircle,
      style: 'bg-red-50 text-red-800 border-red-200'
    }
  }[status] || {
    label: status,
    icon: AlertCircle,
    style: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.style} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span className="truncate">{config.label}</span>
    </span>
  );
};
