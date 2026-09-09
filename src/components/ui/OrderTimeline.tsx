import React from 'react';
import { OrderTrackingCheckpoint } from '../../types';
import { CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';

export interface OrderTimelineProps {
  checkpoints: OrderTrackingCheckpoint[];
  className?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  checkpoints,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {checkpoints.map((cp, idx) => {
        const isLast = idx === checkpoints.length - 1;
        const isCompleted = cp.completed;

        return (
          <div key={idx} className="relative flex items-start gap-4">
            {/* Timeline vertical connector */}
            {!isLast && (
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                  isCompleted ? 'bg-emerald-600' : 'bg-stone-200'
                }`}
              />
            )}

            {/* Icon Node */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                isCompleted
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                  : 'bg-stone-100 text-stone-400 border border-stone-300'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className={`text-sm font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-500'}`}>
                  {cp.title}
                </h4>
                {cp.timestamp && (
                  <span className="text-[11px] text-stone-400">
                    {cp.timestamp}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{cp.location}</span>
              </div>

              {cp.notes && (
                <p className="mt-1 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/60 leading-relaxed">
                  {cp.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
