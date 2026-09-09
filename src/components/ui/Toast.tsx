import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
  id?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onDismiss,
  id = 'kisan-toast'
}) => {
  const typeConfig = {
    success: {
      bg: 'bg-emerald-950 border-emerald-700 text-white',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    },
    error: {
      bg: 'bg-rose-950 border-rose-700 text-white',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950 border-amber-700 text-white',
      icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
    },
    info: {
      bg: 'bg-stone-900 border-stone-700 text-white',
      icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />
    }
  };

  const current = typeConfig[type];

  return (
    <div
      id={id}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 text-xs font-bold shadow-2xl ${current.bg}`}>
        {current.icon}
        <span className="flex-1 leading-snug">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded text-stone-400 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
