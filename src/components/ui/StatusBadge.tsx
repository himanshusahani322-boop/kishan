import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  Lock,
  ArrowRightCircle,
  FileText
} from 'lucide-react';

export type BadgeStatusType = 
  // Order status
  | 'placed' 
  | 'confirmed' 
  | 'aggregated_at_mandi' 
  | 'quality_inspected' 
  | 'dispatched' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled'
  // Payment status
  | 'paid' 
  | 'escrow_hold' 
  | 'released_to_farmer' 
  | 'refunded'
  // RFQ status
  | 'open' 
  | 'negotiating' 
  | 'closed' 
  | 'fulfilled'
  // General status
  | 'active' 
  | 'pending' 
  | 'accepted' 
  | 'countered' 
  | 'rejected' 
  | 'sold_out';

export interface StatusBadgeProps {
  status: BadgeStatusType | string;
  customLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold'
  };

  const getStatusConfig = (s: string) => {
    switch (s) {
      // Success / Complete states
      case 'delivered':
      case 'released_to_farmer':
      case 'paid':
      case 'fulfilled':
      case 'accepted':
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
          defaultLabel: s === 'released_to_farmer' ? 'Escrow Released' : 
                        s === 'delivered' ? 'Delivered' : 
                        s === 'active' ? 'Active' : 
                        s === 'paid' ? 'Paid' : s.replace(/_/g, ' ')
        };

      // In-transit / Processing states
      case 'dispatched':
      case 'out_for_delivery':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          icon: <Truck className="w-3 h-3 text-sky-600 shrink-0" />,
          defaultLabel: s === 'out_for_delivery' ? 'Out for Delivery' : 'In Transit (Dispatched)'
        };

      case 'aggregated_at_mandi':
      case 'quality_inspected':
      case 'confirmed':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          icon: <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />,
          defaultLabel: s === 'aggregated_at_mandi' ? 'Aggregated at Mandi' :
                        s === 'quality_inspected' ? 'Quality Assayed' : 'Order Confirmed'
        };

      // Holding / Pending / Escrow states
      case 'escrow_hold':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
          icon: <Lock className="w-3 h-3 text-indigo-600 shrink-0" />,
          defaultLabel: 'Escrow Protected Hold'
        };

      case 'placed':
      case 'pending':
      case 'open':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <Clock className="w-3 h-3 text-amber-600 shrink-0" />,
          defaultLabel: s === 'placed' ? 'Order Placed' : s === 'open' ? 'Open for Bids' : 'Pending'
        };

      case 'negotiating':
      case 'countered':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-300',
          icon: <ArrowRightCircle className="w-3 h-3 text-purple-600 shrink-0" />,
          defaultLabel: s === 'negotiating' ? 'Under Negotiation' : 'Counter Offer Made'
        };

      // Warning / Error / Cancelled states
      case 'cancelled':
      case 'rejected':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: <XCircle className="w-3 h-3 text-rose-600 shrink-0" />,
          defaultLabel: s === 'cancelled' ? 'Cancelled' : 'Declined'
        };

      case 'sold_out':
      case 'closed':
      case 'refunded':
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-300',
          icon: <AlertCircle className="w-3 h-3 text-stone-500 shrink-0" />,
          defaultLabel: s === 'sold_out' ? 'Sold Out' : s === 'refunded' ? 'Refund Processed' : 'Closed'
        };

      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          icon: <FileText className="w-3 h-3 text-stone-500 shrink-0" />,
          defaultLabel: s.replace(/_/g, ' ')
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center rounded-full font-bold border tracking-wide uppercase ${sizeStyles[size]} ${config.bg} ${className}`}>
      {showIcon && config.icon}
      <span>{customLabel || config.defaultLabel}</span>
    </span>
  );
};
