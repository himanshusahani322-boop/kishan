import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  OrderSummary, 
  Checkbox, 
  Button, 
  Alert,
  QualityBadge 
} from '../../components/ui';
import { MapPin, Truck, ShieldCheck, Scale, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OrderReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, language } = useApp();

  const totalQuintals = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.crop.pricePerQuintal * item.quantityQuintals), 0);
  const mandiCess = Math.round(subtotal * 0.015);
  const logisticsFee = totalQuintals > 0 ? 1200 : 0;
  const grandTotal = subtotal + mandiCess + logisticsFee;

  // Retrieve draft address
  const savedAddressStr = sessionStorage.getItem('ks_checkout_address');
  const address = savedAddressStr ? JSON.parse(savedAddressStr) : {
    addressLine: 'Shed 14, Azadpur Agro Logistics Hub Gate 2',
    city: 'Delhi',
    district: 'North West Delhi',
    state: 'Delhi',
    pincode: '110033',
    contactName: 'Vikramaditya Aggarwal',
    contactPhone: '+91 98112 55981',
    dockFacility: 'Heavy Truck Unloading Ramp'
  };

  const [termsAgreed, setTermsAgreed] = useState(true);
  const [weighbridgeAgreed, setWeighbridgeAgreed] = useState(true);

  const handleProceedToPayment = () => {
    navigate('/buyer/payment');
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Cart', href: '/buyer/cart' },
          { label: 'Delivery Address', href: '/buyer/checkout' },
          { label: 'Order Review & Terms' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Procurement Review & Escrow Undertaking"
        subtitle="Confirm batch assays, delivery destination, and statutory APMC compliance"
        badge="Step 2 of 3"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Batches to be Procured */}
          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-display border-b border-stone-100 pb-3">
              Commodity Batches ({cart.length} Lots)
            </h3>

            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.crop.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.crop.imageUrl} alt={item.crop.title} className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 block truncate text-sm font-display">{item.crop.title}</span>
                      <span className="text-stone-500">{item.crop.variety} • Origin: {item.crop.location.district}</span>
                      <div className="mt-1">
                        <QualityBadge grade={item.crop.grade} />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-stone-900 block text-sm">{item.quantityQuintals} Quintals</span>
                    <span className="text-stone-500">₹{item.crop.pricePerQuintal.toLocaleString('en-IN')}/Q</span>
                    <span className="font-extrabold text-emerald-800 block mt-0.5 font-display">
                      ₹{(item.crop.pricePerQuintal * item.quantityQuintals).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Logistics Details */}
          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-3 text-xs">
            <h3 className="text-base font-bold text-stone-900 font-display border-b border-stone-100 pb-3">
              Destination & Receiving Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Delivery Warehouse</span>
                <p className="font-bold text-stone-900">{address.addressLine}</p>
                <p className="text-stone-600">{address.city}, {address.district}, {address.state} - {address.pincode}</p>
              </div>

              <div className="space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Supervisor & Dock</span>
                <p className="font-bold text-stone-900">{address.contactName} ({address.contactPhone})</p>
                <p className="text-stone-600">{address.dockFacility}</p>
              </div>
            </div>
          </div>

          {/* Statutory Compliance Undertakings */}
          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-stone-900 font-display border-b border-stone-100 pb-3">
              APMC & RBI Escrow Undertaking
            </h3>

            <div className="space-y-3">
              <Checkbox
                checked={weighbridgeAgreed}
                onChange={(e) => setWeighbridgeAgreed(e.target.checked)}
                label="Certified Weighbridge Tare Settlement"
                description="I agree that final payment will be released based on the computerised weighbridge gross-tare slip uploaded at delivery."
              />

              <Checkbox
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                label="Online Payment & Escrow Custody Acceptance"
                description="I acknowledge that Kisan Saathi operates 100% online prepaid escrow custody. Cash on delivery is strictly prohibited under APMC trade guidelines."
              />
            </div>
          </div>
        </div>

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
                disabled={!termsAgreed || !weighbridgeAgreed}
                onClick={handleProceedToPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <span>Proceed to Escrow Payment</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      </div>
    </PageContainer>
  );
};
