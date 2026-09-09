import React from 'react';
import { RFQRequirement } from '../../types';
import { FileText, Users, Clock, ShieldCheck, IndianRupee } from 'lucide-react';

export interface RFQSummaryProps {
  rfqs: RFQRequirement[];
  onNewRFQ: () => void;
  className?: string;
}

export const RFQSummary: React.FC<RFQSummaryProps> = ({
  rfqs,
  onNewRFQ,
  className = ''
}) => {
  const openCount = rfqs.filter(r => r.status === 'open').length;
  const totalBids = rfqs.reduce((sum, r) => sum + r.offersCount, 0);
  const totalTargetVolume = rfqs.reduce((sum, r) => sum + r.targetQuantityQuintals, 0);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Active Institutional RFQs</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">{openCount}</span>
          <span className="text-xs text-stone-500 font-medium">Demands Open</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Total Volume In Demand</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-display">{totalTargetVolume.toLocaleString('en-IN')}</span>
          <span className="text-xs text-stone-500 font-medium">Quintals</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Farmer Producer Bids</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">{totalBids}</span>
          <span className="text-xs text-stone-500 font-medium">Received Across Lots</span>
        </div>
      </div>
    </div>
  );
};
