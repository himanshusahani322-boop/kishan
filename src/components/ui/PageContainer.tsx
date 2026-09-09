import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
  noPadding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '7xl',
  className = '',
  noPadding = false
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }[maxWidth];

  return (
    <div
      className={`w-full mx-auto transition-all ${maxWidthClasses} ${
        noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-5 sm:py-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};
