import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  width = 'md',
  id = 'drawer-sheet'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const positionStyles = {
    right: `top-0 right-0 h-full w-full ${widthStyles[width]} border-l animate-in slide-in-from-right duration-200`,
    left: `top-0 left-0 h-full w-full ${widthStyles[width]} border-r animate-in slide-in-from-left duration-200`,
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] w-full border-t rounded-t-2xl animate-in slide-in-from-bottom duration-200'
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-stretch"
      onClick={onClose}
    >
      <div
        className={`fixed bg-white border-stone-200 shadow-2xl flex flex-col ${positionStyles[position]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-4 bg-stone-50/70 shrink-0">
          <div>
            {title && (
              <h3 className="text-base font-extrabold text-stone-900 font-display tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/70 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
