import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CropCategory, QualityGrade } from '../../types';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  FormSection, 
  Input, 
  Select, 
  Textarea, 
  DateSelector, 
  Checkbox, 
  Button, 
  Alert 
} from '../../components/ui';
import { PlusCircle, Sprout, Award, MapPin, IndianRupee, ArrowLeft } from 'lucide-react';

const CATEGORIES: CropCategory[] = [
  'Grains & Cereals',
  'Pulses (Dal)',
  'Vegetables',
  'Spices',
  'Oilseeds',
  'Fruits',
  'Cash Crops'
];

const GRADES: QualityGrade[] = [
  'Grade A+ (Export)',
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair)'
];

export const AddCropListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { user } = useAuth();
  const { currentUser, crops, addCrop, updateCrop, showToast, language } = useApp();

  const farmerUser = user || currentUser;
  const existingCrop = editId ? crops.find(c => c.id === editId) : null;

  // Form states
  const [title, setTitle] = useState(existingCrop?.title || 'Sharbati Wheat (Golden Premium Grain)');
  const [hindiTitle, setHindiTitle] = useState(existingCrop?.hindiTitle || 'शरबती गेहूं (सोना मोती दाना)');
  const [category, setCategory] = useState<CropCategory>(existingCrop?.category || 'Grains & Cereals');
  const [variety, setVariety] = useState(existingCrop?.variety || 'C-306 Sharbati Original');
  const [grade, setGrade] = useState<QualityGrade>(existingCrop?.grade || 'Grade A+ (Export)');
  const [moisture, setMoisture] = useState<number>(existingCrop?.moisturePercentage ?? 10.2);
  const [quantity, setQuantity] = useState<number>(existingCrop?.quantityAvailable ?? 250);
  const [minOrder, setMinOrder] = useState<number>(existingCrop?.minOrderQuantity ?? 20);
  const [price, setPrice] = useState<number>(existingCrop?.pricePerQuintal ?? 3850);
  const [mandiBenchmark, setMandiBenchmark] = useState<number>(existingCrop?.mandiBenchmarkPrice ?? 3620);
  const [isOrganic, setIsOrganic] = useState(existingCrop?.isOrganicCertified ?? false);
  const [harvestDate, setHarvestDate] = useState(existingCrop?.harvestDate || '2026-03-25');
  const [packaging, setPackaging] = useState(existingCrop?.packagingType || '50kg HDPE laminated gunny bags');
  const [description, setDescription] = useState(
    existingCrop?.description || 
    'Directly harvested from Sehore fertile Malwa black soil. Naturally sundried with certified low moisture and uniform golden luster.'
  );
  const [district, setDistrict] = useState(existingCrop?.location.district || farmerUser.location?.district || 'Sehore');
  const [state, setState] = useState(existingCrop?.location.state || farmerUser.location?.state || 'Madhya Pradesh');
  const [nearestMandi, setNearestMandi] = useState(existingCrop?.location.nearestMandi || `${farmerUser.location?.district || 'Sehore'} APMC Yard`);
  const [imageUrl, setImageUrl] = useState(existingCrop?.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (existingCrop) {
      updateCrop(existingCrop.id, {
        title,
        hindiTitle,
        category,
        variety,
        grade,
        moisturePercentage: Number(moisture),
        quantityAvailable: Number(quantity),
        minOrderQuantity: Number(minOrder),
        pricePerQuintal: Number(price),
        mandiBenchmarkPrice: Number(mandiBenchmark),
        isOrganicCertified: isOrganic,
        harvestDate,
        packagingType: packaging,
        description,
        location: {
          district,
          state,
          nearestMandi
        },
        imageUrl
      });
      showToast('Crop lot updated successfully.', 'success');
    } else {
      addCrop({
        title,
        hindiTitle,
        category,
        variety,
        grade,
        moisturePercentage: Number(moisture),
        quantityAvailable: Number(quantity),
        minOrderQuantity: Number(minOrder),
        pricePerQuintal: Number(price),
        mandiBenchmarkPrice: Number(mandiBenchmark),
        isOrganicCertified: isOrganic,
        harvestDate,
        packagingType: packaging,
        description,
        sellerType: farmerUser.isVerifiedFPO ? 'FPO (Farmer Producer Org)' : 'Individual Farmer',
        location: {
          district,
          state,
          nearestMandi
        },
        imageUrl,
        images: [imageUrl],
        shelfLifeDays: 180,
        status: 'active'
      });
      showToast('New harvest lot listed on APMC spot marketplace.', 'success');
    }

    navigate('/farmer/seller-window');
  };

  return (
    <PageContainer maxWidth="lg">
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Seller Window', href: '/farmer/seller-window' },
          { label: existingCrop ? 'Edit Harvest Lot' : 'List New Harvest Lot' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title={existingCrop ? 'Update Harvest Lot' : 'List New Harvest Lot on APMC Exchange'}
        subtitle="Provide assaying specifications, moisture levels, pricing, and certified storage packaging"
        badge={existingCrop ? 'Edit Mode' : 'New Mandi Listing'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Crop Nomenclature & Classification"
          description="Identify commodity type, trade variety, and local language name."
          badge="Identification"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Commodity Category
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
              label="Crop Title (English)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Crop Title (Hindi / Local Name)"
              value={hindiTitle}
              onChange={(e) => setHindiTitle(e.target.value)}
              required
            />
            <Input
              label="Certified Variety / Hybrid"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="AGMARK Quality Assaying & Grading"
          description="Parameters verified during mandi gate intake."
          badge="Quality Metrics"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Quality Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <Input
              label="Moisture Content (%)"
              type="number"
              step="0.1"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              required
            />

            <DateSelector
              label="Harvesting Date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 border-t border-stone-100">
            <Checkbox
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              label="🌱 Certified Organic Harvest (Jaivik Bharat / NPOP)"
              description="Check if crop has valid organic certification from authorized agency."
            />
          </div>
        </FormSection>

        <FormSection
          title="Pricing & Batch Quantities"
          description="Specify your selling price against current APMC mandi modal price."
          badge="Commercials"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Asking Price (₹ per Quintal)"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Mandi Benchmark Rate (₹ per Quintal)"
              type="number"
              value={mandiBenchmark}
              onChange={(e) => setMandiBenchmark(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Available Stock (in Quintals)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <Input
              label="Minimum Order Quantity (MOQ in Quintals)"
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Origin Mandi & Packaging Details"
          description="Logistics information for freight pickup."
          badge="Logistics"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="Nearest APMC Mandi Yard"
              value={nearestMandi}
              onChange={(e) => setNearestMandi(e.target.value)}
              required
            />
          </div>

          <Input
            label="Packaging Type"
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            placeholder="e.g. 50kg HDPE laminated gunny bags"
            required
          />

          <Input
            label="Lot Photo URL (High-Resolution)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />

          <Textarea
            label="Harvest Description & Storage Condition"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/farmer/seller-window')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
          >
            {existingCrop ? 'Save Changes' : 'Publish Harvest Lot'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};
