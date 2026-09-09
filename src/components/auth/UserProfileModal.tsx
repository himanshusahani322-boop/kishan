import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button, Input, StatusBadge, TrustBadge } from '../ui';
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Save, 
  Edit3, 
  Building2, 
  Wheat, 
  ShoppingBag, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'hi';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  language = 'en'
}) => {
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [villageOrCity, setVillageOrCity] = useState(user?.location?.villageOrCity || '');
  const [district, setDistrict] = useState(user?.location?.district || '');
  const [state, setState] = useState(user?.location?.state || '');
  const [pincode, setPincode] = useState(user?.location?.pincode || '');
  const [fpoName, setFpoName] = useState(user?.fpoName || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHindi = language === 'hi';

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: {
          villageOrCity: villageOrCity.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim()
        },
        fpoName: user.role === 'farmer' ? fpoName.trim() : undefined,
        businessName: user.role === 'buyer' ? businessName.trim() : undefined,
        businessType: user.role === 'buyer' ? businessType.trim() : undefined
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-700" />
          <span>{isHindi ? 'उपयोगकर्ता प्रोफ़ाइल (User Profile)' : 'Kisan Saathi User Profile'}</span>
        </div>
      }
      maxWidth="lg"
      id="user-profile-modal"
    >
      <div className="p-5 space-y-5">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{isHindi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।' : 'Profile information updated successfully.'}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-stone-900 font-display">{user.name}</h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    user.role === 'farmer'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : user.role === 'buyer'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                  ★ {user.rating} ({user.totalRatingsCount} verified Mandi trades)
                </span>
                <span className="text-[11px] text-stone-400">Member since {user.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                id="edit-profile-btn"
              >
                {isHindi ? 'संपादित करें' : 'Edit Profile'}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>

        {/* Server Authoritative Role Security Pill */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold">Server-Verified Institutional Role: </span>
              <span className="capitalize font-extrabold text-emerald-800">{user.role}</span>
            </div>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-mono">
            HMAC-SHA256 Signed
          </span>
        </div>

        {/* Profile Content / Edit Form */}
        {!isEditing ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Contact Information
                </span>
                <div className="flex items-center gap-2 text-stone-800 font-medium">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-800 font-medium">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  APMC Mandi Jurisdiction
                </span>
                <div className="flex items-start gap-2 text-stone-800 font-medium">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <p>{user.location.villageOrCity}, {user.location.district}</p>
                    <p className="text-stone-500">{user.location.state} - {user.location.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Details */}
            {user.role === 'farmer' && (
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Farmer / FPO Accreditation
                </span>
                <div className="flex items-center gap-3">
                  <TrustBadge type="fpo" />
                  {user.fpoName ? (
                    <span className="font-semibold text-stone-800">Affiliated with {user.fpoName}</span>
                  ) : (
                    <span className="text-stone-600">Individual Progressive Grower</span>
                  )}
                </div>
              </div>
            )}

            {user.role === 'buyer' && (
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Buyer Enterprise Accreditation
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">{user.businessName || 'Independent Wholesale Trader'}</p>
                  <p className="text-stone-600">{user.businessType || 'Commodity Trading & Aggregation'}</p>
                  {user.gstNumber && <p className="font-mono text-stone-500 text-[11px]">GSTIN: {user.gstNumber}</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs" id="edit-profile-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                id="edit-name"
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                id="edit-phone"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Village / City / Mandi"
                value={villageOrCity}
                onChange={(e) => setVillageOrCity(e.target.value)}
                required
                id="edit-village"
              />
              <Input
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                id="edit-district"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                id="edit-state"
              />
              <Input
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                id="edit-pincode"
              />
            </div>

            {user.role === 'farmer' && (
              <Input
                label="FPO Organization Name (Optional)"
                value={fpoName}
                onChange={(e) => setFpoName(e.target.value)}
                placeholder="e.g. Narmada Kisan Samriddhi FPO"
                id="edit-fpo-name"
              />
            )}

            {user.role === 'buyer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Enterprise / Firm Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  id="edit-business-name"
                />
                <Input
                  label="Business Category"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  id="edit-business-type"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
                id="save-profile-btn"
              >
                Save Changes to Server
              </Button>
            </div>
          </form>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            id="user-logout-btn"
          >
            {isHindi ? 'लॉग आउट करें (Sign Out)' : 'Sign Out'}
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            {isHindi ? 'बंद करें' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
