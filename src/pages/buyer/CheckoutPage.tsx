import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  FormSection, 
  Input, 
  Select, 
  Button, 
  OrderSummary,
  Alert 
} from '../../components/ui';
import { MapPin, Building, Truck, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, language } = useApp();
  const { user } = useAuth();

  const totalQuintals = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.crop.pricePerQuintal * item.quantityQuintals), 0);
  const mandiCess = Math.round(subtotal * 0.015);
  const logisticsFee = totalQuintals > 0 ? 1200 : 0;
  const grandTotal = subtotal + mandiCess + logisticsFee;

  // Delivery Address State
  const [addressLine, setAddressLine] = useState('Shed 14, Azadpur Agro Logistics Hub Gate 2');
  const [city, setCity] = useState('Delhi');
  const [district, setDistrict] = useState('North West Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110033');
  const [contactName, setContactName] = useState(user?.name || 'Vikramaditya Aggarwal');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98112 55981');
  const [dockFacility, setDockFacility] = useState('Heavy Truck Unloading Ramp (16-Wheeler Accessible)');
  const [unloadingTime, setUnloadingTime] = useState('Daytime (08:00 AM - 06:00 PM)');

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Save checkout draft to sessionStorage
    sessionStorage.setItem('ks_checkout_address', JSON.stringify({
      addressLine,
      city,
      district,
      state,
      pincode,
      contactName,
      contactPhone,
      dockFacility,
      unloadingTime
    }));
    navigate('/buyer/order-review');
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Cart', href: '/buyer/cart' },
          { label: 'Delivery Address & Freight Scheduling' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Delivery Address & Mandi Freight Intake"
        subtitle="Specify warehouse destination, weighbridge facility, and receiving dock contact"
        badge="Step 1 of 3"
      />

      <form onSubmit={handleProceedToReview} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <FormSection
            title="Destination Warehouse / Mandi Shed"
            description="Ensure address is accessible by multi-axle freight trucks."
            badge="Freight Routing"
          >
            <Input
              label="Full Delivery Address & Warehouse / Shed No."
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              required
              placeholder="e.g. Shed 14, Azadpur Mandi Complex, GT Karnal Road"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / Mandi Hub"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="Postal PIN Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </FormSection>

          <FormSection
            title="Receiving Dock Logistics & Contact"
            description="Driver will coordinate with this contact upon arrival at gate."
            badge="Gate Clearance"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Authorized Receiving Person"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
              <Input
                label="Contact Mobile (For GPS Driver Call)"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Truck Dock Ramp Type
                </label>
                <select
                  value={dockFacility}
                  onChange={(e) => setDockFacility(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option>Heavy Truck Unloading Ramp (16-Wheeler Accessible)</option>
                  <option>Standard 6-Wheeler Medium Truck Dock</option>
                  <option>Manual Labour Laborer Gang Unloading Ground</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Gate Unloading Shift
                </label>
                <select
                  value={unloadingTime}
                  onChange={(e) => setUnloadingTime(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option>Daytime (08:00 AM - 06:00 PM)</option>
                  <option>Night Shift (10:00 PM - 06:00 AM)</option>
                  <option>24 Hours Open Mandi Complex</option>
                </select>
              </div>
            </div>
          </FormSection>

          <Alert
            variant="escrow"
            title="Weighbridge Slip Verification Mandate"
          >
            Upon truck arrival, your receiving supervisor must obtain the certified weighbridge slip. Escrow payment will be finalized based on gross minus tare weighment.
          </Alert>
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
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <span>Proceed to Order Review</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      </form>
    </PageContainer>
  );
};
