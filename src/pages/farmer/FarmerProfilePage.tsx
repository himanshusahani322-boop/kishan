import React, { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  FormSection,
  Input,
  Button,
  Alert,
  LoadingState,
} from '../../components/ui';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Leaf,
  Star,
  CheckCircle2,
  Clock,
  RefreshCw,
  Save,
} from 'lucide-react';

// ─── Verification badge ────────────────────────────────────────────────────────
const VerificationBadge: React.FC<{ status?: string }> = ({ status }) => {
  const cfg: Record<string, { label: string; color: string }> = {
    verified:  { label: 'Verified ✓', color: 'bg-emerald-100 text-emerald-800' },
    pending:   { label: 'Pending Review', color: 'bg-amber-100 text-amber-800' },
    rejected:  { label: 'Verification Rejected', color: 'bg-red-100 text-red-800' },
  };
  const c = cfg[status || 'pending'] || cfg.pending;
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
};

// ─── Read-only stat ────────────────────────────────────────────────────────────
const ProfileStat: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({
  label, value, icon
}) => (
  <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-100">
    <div className="text-emerald-600">{icon}</div>
    <div>
      <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

export const FarmerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formFpoName, setFormFpoName] = useState('');
  const [formLandSize, setFormLandSize] = useState<number | ''>('');
  const [formVillage, setFormVillage] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerProfile();
      const p = res.profile || res;
      setProfile(p);
      // Populate form
      setFormName(p.name || '');
      setFormPhone(p.phone || '');
      setFormFpoName(p.farmerProfile?.fpoName || '');
      setFormLandSize(p.farmerProfile?.landSizeAcres ?? '');
      setFormVillage(p.address?.villageOrTehsil || p.farmerProfile?.village || '');
      setFormDistrict(p.address?.district || p.farmerProfile?.district || '');
      setFormState(p.address?.state || p.farmerProfile?.state || '');
      setFormPincode(p.address?.pincode || p.farmerProfile?.pincode || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await marketplaceService.updateFarmerProfile({
        name: formName,
        phone: formPhone,
        fpoName: formFpoName,
        landSizeAcres: formLandSize !== '' ? Number(formLandSize) : undefined,
        village: formVillage,
        district: formDistrict,
        state: formState,
        pincode: formPincode,
      });
      setSaveSuccess(true);
      setEditing(false);
      await loadProfile();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading farmer profile…" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" title="Failed to Load Profile" description={error} className="mb-4" />
        <Button variant="outline" onClick={loadProfile} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </PageContainer>
    );
  }

  const fp = profile?.farmerProfile;
  const addr = profile?.address;

  return (
    <PageContainer maxWidth="lg">
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Farmer Profile' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Farmer Profile & Verification"
        subtitle="Manage your personal information, farm details, and verification status"
        badge="My Profile"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadProfile}
              disabled={loading}
              className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {!editing && (
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => { setEditing(true); setSaveSuccess(false); }}
              >
                Edit Profile
              </Button>
            )}
          </div>
        }
      />

      {saveSuccess && (
        <Alert variant="success" title="Profile Updated" description="Your profile has been saved successfully." className="mb-4" />
      )}
      {saveError && (
        <Alert variant="error" title="Save Failed" description={saveError} className="mb-4" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Stats ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Profile avatar & verification */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-emerald-600" />
              )}
            </div>
            <p className="font-display font-bold text-stone-900 text-lg">{profile?.name || '—'}</p>
            <p className="text-xs text-stone-500 mb-3">{profile?.email || '—'}</p>
            <VerificationBadge status={fp?.verificationStatus} />
            {fp?.isVerifiedFPO && (
              <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                ✓ Verified FPO Member
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <ProfileStat
              label="Rating"
              value={`${fp?.rating?.toFixed(1) ?? '—'} / 5 (${fp?.totalRatingsCount ?? 0} reviews)`}
              icon={<Star className="w-4 h-4" />}
            />
            <ProfileStat
              label="Crops Listed"
              value={fp?.totalCropsListed ?? 0}
              icon={<Leaf className="w-4 h-4" />}
            />
            <ProfileStat
              label="Orders Fulfilled"
              value={fp?.totalOrdersFulfilled ?? 0}
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <ProfileStat
              label="Farm Size"
              value={fp?.landSizeAcres ? `${fp.landSizeAcres} Acres` : '—'}
              icon={<MapPin className="w-4 h-4" />}
            />
            <ProfileStat
              label="Farming Type"
              value={fp?.farmingType ? fp.farmingType.charAt(0).toUpperCase() + fp.farmingType.slice(1) : '—'}
              icon={<Leaf className="w-4 h-4" />}
            />
          </div>

          {/* Primary APMC */}
          {fp?.primaryApmcMandi && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs">
              <p className="text-stone-500 font-medium mb-0.5">Primary APMC Mandi</p>
              <p className="text-stone-900 font-bold">{fp.primaryApmcMandi}</p>
            </div>
          )}
        </div>

        {/* ── Right: Edit Form / Read-only View ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {editing ? (
            /* ── Edit Mode ─────────────────────────────────────────────────── */
            <>
              <FormSection
                title="Personal Information"
                description="Your name, phone and email as registered."
                badge="Account"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Mobile Number"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    type="tel"
                  />
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </FormSection>

              <FormSection
                title="Farm & FPO Details"
                description="Information about your farm and Farmer Producer Organisation."
                badge="Farm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="FPO / Farmer Group Name"
                    value={formFpoName}
                    onChange={e => setFormFpoName(e.target.value)}
                    placeholder="e.g. Malwa Kisan FPO"
                  />
                  <Input
                    label="Farm Size (Acres)"
                    type="number"
                    min={0}
                    step={0.5}
                    value={formLandSize}
                    onChange={e => setFormLandSize(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 14.5"
                  />
                </div>
              </FormSection>

              <FormSection
                title="Address"
                description="Farm gate and mailing address."
                badge="Location"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Village / Tehsil"
                    value={formVillage}
                    onChange={e => setFormVillage(e.target.value)}
                    placeholder="e.g. Narsinghpur"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="District"
                    value={formDistrict}
                    onChange={e => setFormDistrict(e.target.value)}
                    placeholder="e.g. Sehore"
                  />
                  <Input
                    label="State"
                    value={formState}
                    onChange={e => setFormState(e.target.value)}
                    placeholder="e.g. Madhya Pradesh"
                  />
                  <Input
                    label="Pincode"
                    value={formPincode}
                    onChange={e => setFormPincode(e.target.value)}
                    placeholder="6-digit PIN"
                    maxLength={6}
                  />
                </div>
              </FormSection>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setEditing(false); setSaveError(null); }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
                  onClick={handleSave}
                  disabled={saving || !formName}
                >
                  {saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Changes</>}
                </Button>
              </div>
            </>
          ) : (
            /* ── Read-only View ─────────────────────────────────────────────── */
            <>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                <h3 className="font-display font-semibold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Full Name</p>
                    <p className="text-stone-900 font-bold">{profile?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Mobile</p>
                    <p className="text-stone-900 font-bold">{profile?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Email</p>
                    <p className="text-stone-900 font-bold">{profile?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Language</p>
                    <p className="text-stone-900 font-bold capitalize">{profile?.preferredLanguage || 'English'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                <h3 className="font-display font-semibold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" /> Farm & FPO Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Farm Name</p>
                    <p className="text-stone-900 font-bold">{fp?.farmName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">FPO Name</p>
                    <p className="text-stone-900 font-bold">{fp?.fpoName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Farm Size</p>
                    <p className="text-stone-900 font-bold">
                      {fp?.landSizeAcres ? `${fp.landSizeAcres} Acres` : fp?.farmSize ? `${fp.farmSize} ${fp.farmSizeUnit || 'acres'}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Farming Type</p>
                    <p className="text-stone-900 font-bold capitalize">{fp?.farmingType || '—'}</p>
                  </div>
                  {fp?.certifications?.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-stone-400 font-medium mb-0.5">Certifications</p>
                      <p className="text-stone-900 font-bold">{fp.certifications.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                <h3 className="font-display font-semibold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Village / Tehsil</p>
                    <p className="text-stone-900 font-bold">{addr?.villageOrTehsil || fp?.village || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">District</p>
                    <p className="text-stone-900 font-bold">{addr?.district || fp?.district || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">State</p>
                    <p className="text-stone-900 font-bold">{addr?.state || fp?.state || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-0.5">Pincode</p>
                    <p className="text-stone-900 font-bold">{addr?.pincode || fp?.pincode || '—'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
