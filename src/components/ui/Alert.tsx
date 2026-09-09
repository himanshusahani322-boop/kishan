import React from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'success' | 'danger' | 'escrow';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  action,
  className = ''
}) => {
  const variantConfig = {
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      defaultIcon: <Info className="w-5 h-5 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: <AlertTriangle className="w-5 h-5 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: <CheckCircle2 className="w-5 h-5 shrink-0" />
    },
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      defaultIcon: <XCircle className="w-5 h-5 shrink-0" />
    },
    escrow: {
      bg: 'bg-indigo-50/70 border-indigo-200 text-indigo-950',
      iconColor: 'text-indigo-600',
      defaultIcon: <ShieldAlert className="w-5 h-5 shrink-0" />
    }
  }[variant];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${variantConfig.bg} ${className}`}>
      <div className={`mt-0.5 ${variantConfig.iconColor}`}>
        {icon || variantConfig.defaultIcon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold mb-0.5 text-inherit leading-snug">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-90">{children}</div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
};
