import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CropCategory } from '../../types';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  FormSection, 
  Input, 
  Select, 
  Textarea, 
  DateSelector, 
  Button, 
  Alert 
} from '../../components/ui';
import { FileText, PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const CATEGORIES: CropCategory[] = [
  'Grains & Cereals',
  'Pulses (Dal)',
  'Vegetables',
  'Spices',
  'Oilseeds',
  'Fruits',
  'Cash Crops'
];

export const CreateBulkRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRFQ, showToast, language } = useApp();
  const { user } = useAuth();

  const [category, setCategory] = useState<CropCategory>('Grains & Cereals');
  const [cropName, setCropName] = useState('Sharbati Wheat (Export Grade A+)');
  const [variety, setVariety] = useState('C-306 Original');
  const [targetQuantity, setTargetQuantity] = useState<number>(500);
  const [targetPrice, setTargetPrice] = useState<number>(3750);
  const [deliveryLocation, setDeliveryLocation] = useState('Azadpur Agro Logistics Hub, Delhi');
  const [deadlineDate, setDeadlineDate] = useState('2026-04-15');
  const [specifications, setSpecifications] = useState('Moisture < 10.5%, Foreign Matter < 0.5%, Sound grain minimum 98%. Packed in 50kg new HDPE laminated gunny bags.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRFQ({
      buyerOrg: 'Bharat Agro Exports & Processing Ltd.',
      cropCategory: category,
      cropName: cropName,
      varietyPreferred: variety,
      targetQuantityQuintals: Number(targetQuantity),
      targetPricePerQuintal: Number(targetPrice),
      deliveryLocation: deliveryLocation,
      deadlineDate: deadlineDate,
      specifications: specifications
    });

    showToast('Bulk crop requirement posted successfully to registered APMC FPOs.', 'success');
    navigate('/buyer/bulk-requirements');
  };

  return (
    <PageContainer maxWidth="lg">
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Bulk Requirements', href: '/buyer/bulk-requirements' },
          { label: 'Post New RFQ Demand' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Post Institutional Bulk Crop Requirement (RFQ)"
        subtitle="Broadcast commercial volume demands directly to accredited farmer producer organizations (FPOs)"
        badge="Enterprise Procurement"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Commodity & Quality Parameters"
          description="Specify crop type, variety preferences, and AGMARK grading requirements."
          badge="Product Spec"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Crop Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input
              label="Commodity Name / Heading"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              required
              placeholder="e.g. Sharbati Wheat, Yellow Maize"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Seed / Variety"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              required
              placeholder="e.g. C-306, Pusa 1509"
            />
            <DateSelector
              label="Procurement Deadline Date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Volume & Target Pricing"
          description="State required quintals and benchmark offer per quintal."
          badge="Commercials"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Procurement Volume (in Quintals)"
              type="number"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(Number(e.target.value))}
              required
              min={10}
            />
            <Input
              label="Target Price (₹ per Quintal)"
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              required
              min={100}
            />
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">Total Estimated Procurement Commitment:</span>
            <span className="text-base font-extrabold text-stone-900 font-display">
              ₹{(targetQuantity * targetPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </FormSection>

        <FormSection
          title="Intake Hub & Technical Assaying Mandate"
          description="Receiving warehouse destination and quality tolerances."
          badge="Fulfillment"
        >
          <Input
            label="Intake Mandi Yard / Warehouse Destination"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            required
            placeholder="e.g. Azadpur Agro Logistics Hub, Shed 14, Delhi"
          />

          <Textarea
            label="Technical Assaying Specifications & Packaging"
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            required
            rows={3}
            placeholder="Specify moisture threshold, foreign matter limits, packaging, etc."
          />
        </FormSection>

        <Alert variant="escrow" title="Direct FPO Notification">
          Posting this RFQ will instantly alert verified FPOs in Madhya Pradesh, Punjab, Haryana, Rajasthan, and Maharashtra with matching lot capability.
        </Alert>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/buyer/bulk-requirements')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
          >
            Publish Bulk RFQ
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};
