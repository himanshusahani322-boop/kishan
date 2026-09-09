import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  ProductCard, 
  EmptyState, 
  Button 
} from '../../components/ui';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { crops, wishlistIds, toggleWishlist, addToCart, cart, language } = useApp();

  const wishlistedCrops = crops.filter(c => wishlistIds.includes(c.id));

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Wishlist' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Saved Crop Lots (Wishlist)"
        subtitle="Monitored harvest lots for price movements, stock updates, and procurement planning"
        badge={`${wishlistedCrops.length} Saved`}
      />

      {wishlistedCrops.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyState
            title="Your Wishlist is Empty"
            description="Explore the APMC spot marketplace and bookmark harvest lots you wish to track or buy."
            icon={Heart}
            action={
              <Button
                variant="primary"
                onClick={() => navigate('/buyer/marketplace')}
                className="mt-4"
              >
                Explore Marketplace
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedCrops.map((crop) => (
            <ProductCard
              key={crop.id}
              crop={crop}
              onClick={() => navigate(`/buyer/product/${crop.id}`)}
              onAddToCart={() => addToCart(crop, crop.minOrderQuantity)}
              onToggleWishlist={() => toggleWishlist(crop.id)}
              isWishlisted={true}
              isInCart={cart.some(i => i.crop.id === crop.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
