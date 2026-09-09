import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  RadioGroup, 
  Button, 
  OrderSummary, 
  Alert,
  Input 
} from '../../components/ui';
import { ShieldCheck, Lock, QrCode, Building, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, createOrderFromCart, clearCart, language } = useApp();

  const totalQuintals = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.crop.pricePerQuintal * item.quantityQuintals), 0);
  const mandiCess = Math.round(subtotal * 0.015);
  const logisticsFee = totalQuintals > 0 ? 1200 : 0;
  const grandTotal = subtotal + mandiCess + logisticsFee;

  const [paymentMethod, setPaymentMethod] = useState<'Escrow Agropay' | 'UPI' | 'NetBanking / NEFT'>('Escrow Agropay');
  const [upiId, setUpiId] = useState('vikramaditya@okhdfcbank');
  const [bankName, setBankName] = useState('State Bank of India (Corporate Mandi Banking)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Retrieve saved address
  const savedAddressStr = sessionStorage.getItem('ks_checkout_address');
  const address = savedAddressStr ? JSON.parse(savedAddressStr) : {
    addressLine: 'Shed 14, Azadpur Agro Logistics Hub Gate 2',
    city: 'Delhi',
    district: 'North West Delhi',
    state: 'Delhi',
    pincode: '110033'
  };

  const handlePayAndConfirm = async () => {
    if (cart.length === 0) {
      navigate('/buyer/marketplace');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Create first order from cart (or batch)
      const primaryItem = cart[0];
      const createdOrder = await createOrderFromCart({
        crop: primaryItem.crop,
        quantityQuintals: primaryItem.quantityQuintals,
        paymentMethod: paymentMethod,
        deliveryAddress: {
          addressLine: address.addressLine,
          city: address.city,
          district: address.district,
          state: address.state,
          pincode: address.pincode
        }
      });

      clearCart();
      navigate(`/buyer/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Escrow pre-authorization failed. Please retry.');
      setIsProcessing(false);
    }
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Procurement Cart', href: '/buyer/cart' },
          { label: 'Delivery Address', href: '/buyer/checkout' },
          { label: 'Order Review', href: '/buyer/order-review' },
          { label: 'Escrow Payment' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="100% Online Escrow Payment"
        subtitle="Pre-fund RBI escrow custody. Funds remain protected until physical weighbridge delivery confirmation."
        badge="Step 3 of 3"
      />

      {errorMessage && (
        <Alert variant="danger" title="Payment Authorization Error" className="mb-6">
          {errorMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Payment Method Selector */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-stone-900 font-display border-b border-stone-100 pb-3">
              Select Online Payment Channel
            </h3>

            <RadioGroup
              name="paymentMethod"
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val as any)}
              options={[
                {
                  value: 'Escrow Agropay',
                  label: 'Escrow Agropay (Scheduled Bank Escrow Wallet)',
                  description: 'Direct institutional escrow transfer with instantaneous weighbridge release token.',
                  badge: 'Recommended'
                },
                {
                  value: 'UPI',
                  label: 'Instant UPI Dynamic QR / VPA',
                  description: 'Pay via BHIM, Google Pay, PhonePe, or corporate banking UPI handles up to ₹5,00,000.',
                  badge: 'Instant'
                },
                {
                  value: 'NetBanking / NEFT',
                  label: 'RTGS / NEFT / Mandi Corporate NetBanking',
                  description: 'For high-value wholesale consignments exceeding ₹10 Lakhs with automated e-Challan generation.'
                }
              ]}
            />

            {/* Payment Method Specific Sub-inputs */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <Input
                  label="Virtual Payment Address (UPI ID)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okhdfcbank"
                />
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Dynamic QR will be presented on screen upon authorization</span>
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking / NEFT' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Corporate Mandi Clearing Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option>State Bank of India (Corporate Mandi Banking)</option>
                  <option>HDFC Bank Agri Infrastructure Branch</option>
                  <option>ICICI Bank e-NAM Settlement Desk</option>
                  <option>Punjab National Bank Kisan Escrow Branch</option>
                </select>
              </div>
            )}

            {/* Zero Cash-on-Delivery Rule Callout */}
            <Alert
              variant="warning"
              title="Statutory APMC Compliance Notice: Online Payment Only"
            >
              To eliminate illegal middleman deduction and protect farmers' statutory minimum returns, Kisan Saathi does not permit Cash on Delivery (COD). All settlements are conducted strictly via digital escrow accounts.
            </Alert>
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
                disabled={isProcessing}
                onClick={handlePayAndConfirm}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <span>Authorizing Escrow Vault...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Fund Escrow (₹{grandTotal.toLocaleString('en-IN')})</span>
                  </>
                )}
              </Button>
            }
          />
        </div>
      </div>
    </PageContainer>
  );
};
