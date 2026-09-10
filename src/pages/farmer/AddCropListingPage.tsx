import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  FormSection,
  Input,
  Textarea,
  DateSelector,
  Checkbox,
  Button,
  Alert,
  LoadingState,
} from '../../components/ui';
import { PlusCircle, Sprout, IndianRupee, MapPin, ArrowLeft, Save, Eye, CheckCircle2 } from 'lucide-react';

// ─── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Crop & Grade', hindiLabel: 'फसल और ग्रेड' },
  { id: 2, label: 'Quantity & Pricing', hindiLabel: 'मात्रा और मूल्य' },
  { id: 3, label: 'Logistics & Media', hindiLabel: 'लॉजिस्टिक्स और मीडिया' },
  { id: 4, label: 'Review & Publish', hindiLabel: 'समीक्षा और प्रकाशित करें' },
];

const GRADES = [
  'Grade A+',
  'Grade A',
  'Grade B',
  'Standard FAQ',
];

// ─── Component ─────────────────────────────────────────────────────────────────
export const AddCropListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const { user } = useAuth();

  // Support both ?edit=<id> and /farmer/seller-window/edit/:id
  const editId = searchParams.get('edit') || params.id || null;

  // ── Data loading ─────────────────────────────────────────────────────────────
  const [crops, setCrops] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(editId));

  // ── Form steps ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1: Crop & Grade ─────────────────────────────────────────────────────
  const [cropId, setCropId] = useState('');
  const [varietyId, setVarietyId] = useState('');
  const [grade, setGrade] = useState('Grade A');
  const [quality, setQuality] = useState('');
  const [description, setDescription] = useState('');
  const [organicCertified, setOrganicCertified] = useState(false);

  // ── Step 2: Quantity & Pricing ────────────────────────────────────────────────
  const [totalAvailableQuintals, setTotalAvailableQuintals] = useState<number | ''>(100);
  const [minOrderQuantityQuintals, setMinOrderQuantityQuintals] = useState<number | ''>(10);
  const [pricePerQuintal, setPricePerQuintal] = useState<number | ''>(3500);
  const [moisturePercentage, setMoisturePercentage] = useState<number | ''>(11.0);
  const [harvestDate, setHarvestDate] = useState('');

  // ── Step 3: Logistics & Media ─────────────────────────────────────────────────
  const [pickupLocation, setPickupLocation] = useState('');
  const [apmcMandiYard, setApmcMandiYard] = useState('');
  const [storageInformation, setStorageInformation] = useState('Hermetic HDPE bags / Covered Warehouse');
  const [imageUrl, setImageUrl] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('Immediate Dispatch');

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  // ── Load crops on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    marketplaceService.getCrops()
      .then(res => {
        const cropList = res.crops || [];
        const varList = res.varieties || [];
        setCrops(cropList);
        setVarieties(varList);
        if (!editId && cropList.length > 0 && !cropId) {
          setCropId(cropList[0].id);
          const firstVarieties = varList.filter((v: any) => v.cropId === cropList[0].id);
          if (firstVarieties.length > 0) setVarietyId(firstVarieties[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCrops(false));
  }, []);

  // ── Load existing listing for edit ────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    setLoadingExisting(true);
    marketplaceService.getFarmerListing(editId)
      .then(res => {
        const p = res.product || res;
        setCropId(p.cropId || '');
        setVarietyId(p.varietyId || '');
        setGrade(p.grade || 'Grade A');
        setQuality(p.quality || '');
        setDescription(p.description || '');
        setOrganicCertified(Boolean(p.organicCertified));
        setTotalAvailableQuintals(p.inventory?.totalAvailableQuintals ?? p.quantity ?? 100);
        setMinOrderQuantityQuintals(p.inventory?.minOrderQuantityQuintals ?? p.minimumOrderQuantity ?? 10);
        setPricePerQuintal(p.pricePerQuintal ?? 3500);
        setMoisturePercentage(p.inventory?.moisturePercentage ?? 11.0);
        setHarvestDate(p.harvestDate || '');
        setPickupLocation(p.inventory?.warehouseLocation || p.pickupLocation || '');
        setApmcMandiYard(p.apmcMandiYard || '');
        setStorageInformation(p.inventory?.storageConditions || p.storageInformation || 'Hermetic HDPE bags');
        setImageUrl(p.images?.[0]?.imageUrl || '');
        setAvailabilityStatus(p.availabilityStatus || 'Immediate Dispatch');
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [editId]);

  // ── Derived: varieties for selected crop ─────────────────────────────────────
  const cropVarieties = varieties.filter(v => v.cropId === cropId);
  const selectedCrop = crops.find(c => c.id === cropId);
  const selectedVariety = varieties.find(v => v.id === varietyId);

  // ── Handle crop change ────────────────────────────────────────────────────────
  const handleCropChange = (id: string) => {
    setCropId(id);
    const filteredVars = varieties.filter(v => v.cropId === id);
    setVarietyId(filteredVars.length > 0 ? filteredVars[0].id : '');
  };

  // ── Step validation ────────────────────────────────────────────────────────────
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!cropId) return 'Please select a crop.';
      if (!grade) return 'Please select a quality grade.';
    }
    if (s === 2) {
      const qty = Number(totalAvailableQuintals);
      const moq = Number(minOrderQuantityQuintals);
      const price = Number(pricePerQuintal);
      if (!qty || qty <= 0) return 'Quantity must be greater than 0.';
      if (!price || price <= 0) return 'Price must be greater than 0.';
      if (!moq || moq <= 0) return 'Minimum Order Quantity must be greater than 0.';
      if (moq > qty) return 'Minimum Order Quantity cannot exceed total available quantity.';
      if (!harvestDate) return 'Please select a harvest date.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setStepErrors(prev => ({ ...prev, [step]: err }));
      return;
    }
    setStepErrors(prev => { const n = { ...prev }; delete n[step]; return n; });
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (asDraft = false) => {
    setSubmitting(true);
    setSubmitError(null);

    const payload: Record<string, any> = {
      cropId,
      varietyId,
      grade,
      quality,
      description,
      organicCertified,
      pricePerQuintal: Number(pricePerQuintal),
      totalAvailableQuintals: Number(totalAvailableQuintals),
      minOrderQuantityQuintals: Number(minOrderQuantityQuintals),
      moisturePercentage: Number(moisturePercentage),
      harvestDate,
      pickupLocation,
      apmcMandiYard,
      storageInformation,
      availability: availabilityStatus,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (editId) {
        if (asDraft) payload.status = 'draft';
        await marketplaceService.updateFarmerListing(editId, payload);
      } else {
        if (asDraft) payload.status = 'draft';
        await marketplaceService.createFarmerListing(payload);
      }
      setSuccess(true);
      setTimeout(() => navigate('/farmer/seller-window'), 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loadingCrops || loadingExisting) {
    return (
      <PageContainer maxWidth="lg">
        <LoadingState message="Loading listing data…" />
      </PageContainer>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <PageContainer maxWidth="lg">
        <div className="flex flex-col items-center py-24 gap-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          <p className="text-xl font-bold text-stone-900">
            {editId ? 'Listing Updated!' : 'Harvest Lot Published!'}
          </p>
          <p className="text-sm text-stone-500">Redirecting to Seller Window…</p>
        </div>
      </PageContainer>
    );
  }

  // ── Review step summary ───────────────────────────────────────────────────────
  const ReviewRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-xs py-1.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 font-medium">{label}</span>
      <span className="text-stone-900 font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <PageContainer maxWidth="lg">
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Seller Window', href: '/farmer/seller-window' },
          { label: editId ? 'Edit Harvest Lot' : 'List New Harvest Lot' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title={editId ? 'Update Harvest Lot' : 'List New Harvest Lot on APMC Exchange'}
        subtitle="Provide assaying specifications, moisture levels, pricing and certified storage details"
        badge={editId ? 'Edit Mode' : 'New Mandi Listing'}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, idx) => {
          const isCompleted = step > s.id;
          const isCurrent = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white border-emerald-600 text-emerald-700'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[10px] mt-1 font-medium text-center max-w-[72px] leading-tight whitespace-nowrap ${
                  isCurrent ? 'text-emerald-700 font-bold' : isCompleted ? 'text-stone-600' : 'text-stone-400'
                }`}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 min-w-[20px] ${isCompleted ? 'bg-emerald-500' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step error */}
      {stepErrors[step] && (
        <Alert variant="error" title="Please fix the following" description={stepErrors[step]} className="mb-4" />
      )}
      {submitError && (
        <Alert variant="error" title="Submission Error" description={submitError} className="mb-4" />
      )}

      {/* ── Step 1: Crop & Grade ─────────────────────────────────────────────── */}
      {step === 1 && (
        <FormSection
          title="Crop & Quality Grade"
          description="Select the commodity type, certified variety, and AGMARK quality grade."
          badge="Step 1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Crop / Commodity <span className="text-red-500">*</span>
              </label>
              <select
                value={cropId}
                onChange={e => handleCropChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Select Crop —</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.hindiName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Variety
              </label>
              <select
                value={varietyId}
                onChange={e => setVarietyId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Select Variety —</option>
                {cropVarieties.map(v => (
                  <option key={v.id} value={v.id}>{v.varietyName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Quality Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <Input
              label="Quality Notes"
              placeholder="e.g. Low moisture, uniform golden sheen"
              value={quality}
              onChange={e => setQuality(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Crop Description"
              placeholder="Detailed description: origin, storage condition, visual quality…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <Checkbox
              checked={organicCertified}
              onChange={e => setOrganicCertified(e.target.checked)}
              label="🌱 Certified Organic Harvest (Jaivik Bharat / NPOP)"
              description="Check only if you have a valid organic certification from an authorized agency."
            />
          </div>
        </FormSection>
      )}

      {/* ── Step 2: Quantity & Pricing ───────────────────────────────────────── */}
      {step === 2 && (
        <FormSection
          title="Quantity & Pricing"
          description="Set total available stock, minimum order quantity and your asking price."
          badge="Step 2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Available Stock (Quintals) *"
              type="number"
              min={1}
              step={1}
              value={totalAvailableQuintals}
              onChange={e => setTotalAvailableQuintals(e.target.value === '' ? '' : Number(e.target.value))}
              leftIcon={<Sprout className="w-4 h-4" />}
              required
            />
            <Input
              label="Minimum Order Quantity — MOQ (Quintals) *"
              type="number"
              min={1}
              step={1}
              value={minOrderQuantityQuintals}
              onChange={e => setMinOrderQuantityQuintals(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Input
              label="Your Asking Price (₹ per Quintal) *"
              type="number"
              min={1}
              step={10}
              value={pricePerQuintal}
              onChange={e => setPricePerQuintal(e.target.value === '' ? '' : Number(e.target.value))}
              leftIcon={<IndianRupee className="w-4 h-4" />}
              required
            />
            <Input
              label="Moisture Content (%)"
              type="number"
              min={0}
              max={30}
              step={0.1}
              value={moisturePercentage}
              onChange={e => setMoisturePercentage(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <DateSelector
              label="Harvest Date *"
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Immediate Dispatch">Immediate Dispatch</option>
                <option value="Within 3 Days">Within 3 Days</option>
                <option value="Within 7 Days">Within 7 Days</option>
                <option value="Pre-booking">Pre-booking Only</option>
              </select>
            </div>
          </div>
        </FormSection>
      )}

      {/* ── Step 3: Logistics & Media ────────────────────────────────────────── */}
      {step === 3 && (
        <FormSection
          title="Logistics & Media"
          description="Pickup location, APMC mandi yard, storage details, and product photo."
          badge="Step 3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pickup / Farm Gate Location"
              placeholder="e.g. Village Narsinghpur, Sehore, MP"
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Nearest APMC Mandi Yard"
              placeholder="e.g. Sehore APMC Yard"
              value={apmcMandiYard}
              onChange={e => setApmcMandiYard(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Storage Information"
              placeholder="e.g. Hermetic HDPE 50kg bags, Covered warehouse"
              value={storageInformation}
              onChange={e => setStorageInformation(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Product Photo URL (Optional)"
              placeholder="https://… (high-resolution crop photo)"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-3 h-32 w-auto rounded-xl border border-stone-200 object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
            <p className="text-[10px] text-stone-400 mt-1">
              Paste a public image URL. Full image upload will be available in a future release.
            </p>
          </div>
        </FormSection>
      )}

      {/* ── Step 4: Review & Publish ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <h3 className="font-display font-bold text-stone-900 mb-4 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" /> Listing Preview
            </h3>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Crop"
                className="w-full h-40 object-cover rounded-xl mb-4 border border-stone-200"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}

            <div className="space-y-0.5">
              <ReviewRow label="Crop" value={selectedCrop?.name || '—'} />
              <ReviewRow label="Variety" value={selectedVariety?.varietyName || 'Standard'} />
              <ReviewRow label="Grade" value={grade} />
              {quality && <ReviewRow label="Quality Notes" value={quality} />}
              <ReviewRow label="Organic Certified" value={organicCertified ? 'Yes ✓' : 'No'} />
              <ReviewRow label="Total Available" value={`${totalAvailableQuintals} Quintals`} />
              <ReviewRow label="Minimum Order (MOQ)" value={`${minOrderQuantityQuintals} Quintals`} />
              <ReviewRow label="Price" value={`₹${Number(pricePerQuintal).toLocaleString('en-IN')} / Quintal`} />
              <ReviewRow label="Moisture" value={`${moisturePercentage}%`} />
              <ReviewRow label="Harvest Date" value={harvestDate} />
              <ReviewRow label="Availability" value={availabilityStatus} />
              {pickupLocation && <ReviewRow label="Pickup Location" value={pickupLocation} />}
              {apmcMandiYard && <ReviewRow label="APMC Mandi Yard" value={apmcMandiYard} />}
              <ReviewRow label="Storage" value={storageInformation} />
            </div>

            {description && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-500 font-medium mb-1">Description</p>
                <p className="text-xs text-stone-700 leading-relaxed">{description}</p>
              </div>
            )}
          </div>

          <Alert
            variant="info"
            title="Ready to publish"
            description="Once published, your listing will appear on the marketplace for buyers to discover."
            className=""
          />
        </div>
      )}

      {/* ── Navigation buttons ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-6">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/farmer/seller-window')}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save as Draft (any step) */}
          {!editId && step < 4 && (
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
            >
              Next Step →
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 flex items-center gap-2"
              >
                {submitting ? 'Publishing…' : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    {editId ? 'Save Changes' : 'Publish Listing'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
