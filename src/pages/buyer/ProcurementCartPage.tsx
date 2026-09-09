import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  QuantitySelector, 
  OrderSummary, 
  Button, 
  EmptyState, 
  QualityBadge 
} from '../../components/ui';
import { ShoppingCart, Trash2, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const ProcurementCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart, language } = useApp();

  const totalQuintals = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.crop.pricePerQuintal * item.quantityQuintals), 0);
  const mandiCess = Math.round(subtotal * 0.015);
  const logisticsFee = totalQuintals > 0 ? 1200 : 0;
  const grandTotal = subtotal + mandiCess + logisticsFee;

  if (cart.length === 0) {
    return (
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Buyer Home', href: '/buyer' },
            { label: 'Procurement Cart' }
          ]}
          className="mb-4"
        />

        <div className="py-16 text-center">
          <EmptyState
            title="Your Procurement Cart is Empty"
            description="Select quality-assayed agricultural lots from verified farmers in the spot marketplace."
            icon={ShoppingCart}
            action={
              <Button
                variant="primary"
                onClick={() => navigate('/buyer/marketplace')}
                className="mt-4"
              >
                Browse Marketplace Lots
              </Button>
            }
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Cart' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Wholesale Procurement Cart"
        subtitle="Consolidated agricultural commodity batches ready for weighbridge scheduling & escrow funding"
        badge={`${cart.length} Batches (${totalQuintals} Quintals)`}
        action={
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Item Batches */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const crop = item.crop;
            const batchSubtotal = crop.pricePerQuintal * item.quantityQuintals;

            return (
              <div
                key={crop.id}
                className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={crop.imageUrl}
                    alt={crop.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-stone-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {crop.category} • {crop.variety}
                      </span>
                      <button
                        onClick={() => removeFromCart(crop.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-base text-stone-900 font-display mt-0.5 truncate">
                      {crop.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">Origin: {crop.location.district}, {crop.location.state} ({crop.sellerName})</span>
                    </div>

                    <div className="mt-2">
                      <QualityBadge grade={crop.grade} isOrganic={crop.isOrganicCertified} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-stone-500 block">Rate: ₹{crop.pricePerQuintal.toLocaleString('en-IN')}/Quintal</span>
                    <span className="text-xs text-stone-400">Available: {crop.quantityAvailable} Q</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <QuantitySelector
                      value={item.quantityQuintals}
                      onChange={(q) => updateCartQuantity(crop.id, q)}
                      min={crop.minOrderQuantity}
                      max={crop.quantityAvailable}
                      step={5}
                      unit="Quintals"
                    />

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Subtotal</span>
                      <span className="text-base font-extrabold text-stone-900 font-display">
                        ₹{batchSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Action */}
        <div className="lg:col-span-4 space-y-4">
          <OrderSummary
            quantityQuintals={totalQuintals}
            subtotal={subtotal}
            mandiCess={mandiCess}
            logisticsFee={logisticsFee}
            totalAmount={grandTotal}
            actionButton={
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/buyer/checkout')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <span>Proceed to Delivery & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      </div>
    </PageContainer>
  );
};
