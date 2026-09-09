import React from 'react';
import { RFQRequirement } from '../../types';
import { Clock, CheckCircle2, XCircle, Users } from 'lucide-react';

export interface RequirementStatusProps {
  status: RFQRequirement['status'];
  className?: string;
  size?: 'sm' | 'md';
}

export const RequirementStatus: React.FC<RequirementStatusProps> = ({
  status,
  className = '',
  size = 'md'
}) => {
  const config = {
    open: {
      label: 'Open for Bidding',
      icon: Clock,
      style: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    negotiating: {
      label: 'Under Negotiation',
      icon: Users,
      style: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    fulfilled: {
      label: 'Fulfilled & Awarded',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
    },
    closed: {
      label: 'RFQ Closed',
      icon: XCircle,
      style: 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }[status] || {
    label: status,
    icon: Clock,
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
