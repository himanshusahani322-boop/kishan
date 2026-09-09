import React from 'react';
import { CropListing } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { Sprout } from 'lucide-react';

export interface ProductGridProps {
  products: CropListing[];
  loading?: boolean;
  onSelectProduct: (crop: CropListing) => void;
  onAddToCart?: (crop: CropListing) => void;
  onToggleWishlist?: (cropId: string) => void;
  wishlistIds?: string[];
  cartCropIds?: string[];
  emptyTitle?: string;
  emptySubtitle?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  cartCropIds = [],
  emptyTitle = 'No agricultural lots found',
  emptySubtitle = 'Try changing your category, state filter, or search keywords.',
  className = ''
}) => {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingState message="Fetching live mandi listings and quality grades..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptySubtitle}
        icon={Sprout}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6 ${className}`}>
      {products.map((crop) => {
        const isWishlisted = wishlistIds.includes(crop.id);
        const isInCart = cartCropIds.includes(crop.id);

        return (
          <ProductCard
            key={crop.id}
            crop={crop}
            onClick={() => onSelectProduct(crop)}
            onAddToCart={onAddToCart ? () => onAddToCart(crop) : undefined}
            onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(crop.id) : undefined}
            isWishlisted={isWishlisted}
            isInCart={isInCart}
          />
        );
      })}
    </div>
  );
};
