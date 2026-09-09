import React from 'react';
import { AlertTriangle, RefreshCw, PhoneCall } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHelpline?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showHelpline = true,
  className = ''
}) => {
  return (
    <div className={`p-8 bg-rose-50/70 border border-rose-200 rounded-2xl text-center flex flex-col items-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 border border-rose-200">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-rose-950 font-display">
          {title}
        </h3>
        <p className="text-xs text-rose-800 font-medium leading-relaxed max-w-sm">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        )}
        {showHelpline && (
          <a
            href="tel:18001801551"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-900 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
            <span>Kisan Helpline 1800-180-1551</span>
          </a>
        )}
      </div>
    </div>
  );
};
