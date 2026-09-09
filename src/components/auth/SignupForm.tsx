import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button, Input } from '../ui';
import { RoleSelectionCards } from './RoleSelectionCards';
import { 
  UserPlus, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface SignupFormProps {
  onSuccess?: (response?: any) => void;
  onSwitchToLogin?: () => void;
  language?: 'en' | 'hi';
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  language = 'en'
}) => {
  const { signup, authError, clearError, isLoading } = useAuth();

  // Wizard Steps: 1 = Core Credentials & Role, 2 = Profile Onboarding & Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Form Data
  const [role, setRole] = useState<UserRole>('farmer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Step 2 Profile Onboarding Data
  const [villageOrCity, setVillageOrCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('');
  const [isVerifiedFPO, setIsVerifiedFPO] = useState(false);
  const [fpoName, setFpoName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesale Commodity Trader');

  const [localError, setLocalError] = useState<string | null>(null);
  const isHindi = language === 'hi';

  // Validation for Step 1
  const handleProceedToProfileStep = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setLocalError(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLocalError(isHindi ? 'कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError(isHindi ? 'कृपया एक वैध ईमेल पता दर्ज करें' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(isHindi ? 'पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते' : 'Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setLocalError(isHindi ? 'कृपया ई-नाम व APMC मंडी शर्तों को स्वीकार करें' : 'Please accept the e-NAM & APMC statutory terms.');
      return;
    }

    // Set default location based on role if blank
    if (!villageOrCity) {
      setVillageOrCity(role === 'farmer' ? 'Kisan Nagar' : 'Azadpur Market');
    }
    if (!district) {
      setDistrict(role === 'farmer' ? 'Sehore' : 'North West Delhi');
    }
    if (!pincode) {
      setPincode(role === 'farmer' ? '466001' : '110033');
    }
    if (role === 'buyer' && !businessName) {
      setBusinessName(`${fullName}'s Agro Trading Co.`);
    }

    setStep(2);
  };

  // Submit complete signup to server
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    try {
      const res = await signup({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
        location: {
          villageOrCity: villageOrCity.trim() || 'Central Mandi',
          district: district.trim() || 'District Center',
          state: state || 'Madhya Pradesh',
          pincode: pincode.trim() || '462001'
        },
        isVerifiedFPO: role === 'farmer' ? isVerifiedFPO : false,
        fpoName: role === 'farmer' && isVerifiedFPO ? fpoName.trim() : undefined,
        businessName: role === 'buyer' ? businessName.trim() : undefined,
        businessType: role === 'buyer' ? businessType : undefined
      });

      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      // Handled
    }
  };

  const displayError = localError || authError;

  return (
    <div className="space-y-5">
      {/* Stepper Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 1 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-bold ${step === 1 ? 'text-stone-900' : 'text-stone-500'}`}>
            {isHindi ? 'खाता व भूमिका' : 'Account & Role'}
          </span>
        </div>

        <div className="w-12 h-0.5 bg-stone-200">
          <div className={`h-full bg-emerald-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 2 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-bold ${step === 2 ? 'text-stone-900' : 'text-stone-400'}`}>
            {isHindi ? 'प्रोफ़ाइल व सत्यापन' : 'Profile & KYC'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {displayError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{displayError}</div>
        </div>
      )}

      {/* STEP 1: Basic Credentials & Role Selection */}
      {step === 1 && (
        <form onSubmit={handleProceedToProfileStep} className="space-y-4" id="kisan-signup-step1">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              {isHindi ? '1. अपनी प्राथमिक भूमिका चुनें:' : '1. Choose your primary role:'}
            </label>
            <RoleSelectionCards
              selectedRole={role}
              onSelectRole={(r) => setRole(r)}
              language={language}
            />
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Input
              label={isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'}
              placeholder="e.g. Rameshwar Patel / Vikramaditya"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
              id="signup-name-input"
            />

            <Input
              label={isHindi ? '10-अंकों का मोबाइल नंबर' : '10-Digit Mobile Number'}
              placeholder="9826044123"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText={isHindi ? 'मंडी OTP व SMS सूचनाओं के लिए' : 'For Mandi SMS & OTP verification'}
              required
              id="signup-phone-input"
            />
          </div>

          <Input
            label={isHindi ? 'ईमेल पता (Email Address)' : 'Email Address'}
            placeholder="farmer.name@kisansaathi.in"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            id="signup-email-input"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={isHindi ? 'पासवर्ड (Password)' : 'Create Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              id="signup-password-input"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label={isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              id="signup-confirm-password-input"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
              {isHindi ? (
                <span>
                  मैं किसान साथी के <strong>e-NAM Mandi नियमों</strong>, RBI-अनुपालक एस्क्रो शर्तों और डेटा सुरक्षा दिशानिर्देशों से सहमत हूँ।
                </span>
              ) : (
                <span>
                  I agree to the <strong>e-NAM Mandi Regulations</strong>, RBI-compliant escrow guidelines, and statutory APMC trading terms.
                </span>
              )}
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            id="proceed-to-step2-btn"
          >
            {isHindi ? 'आगे बढ़ें: प्रोफ़ाइल व स्थान विवरण' : 'Continue: Profile & Mandi Location'}
          </Button>
        </form>
      )}

      {/* STEP 2: Profile Customization & Onboarding based on role */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4" id="kisan-signup-step2">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px]">
                {role}
              </span>
              <span>{fullName} ({email})</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-emerald-800 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Edit Credentials
            </button>
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHindi ? 'स्थान व मंडी केंद्र (Location & APMC Center):' : 'Location & Mandi Center:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={role === 'farmer' ? (isHindi ? 'गाँव / तहसील' : 'Village / Tehsil') : (isHindi ? 'शहर / व्यापारिक परिसर' : 'City / Mandi Complex')}
                value={villageOrCity}
                onChange={(e) => setVillageOrCity(e.target.value)}
                placeholder={role === 'farmer' ? 'e.g. Narsinghpur / Rehti' : 'e.g. Azadpur Mandi'}
                required
                id="profile-village-city"
              />

              <Input
                label={isHindi ? 'जिला (District)' : 'District'}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Sehore / Indore"
                required
                id="profile-district"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 select-none">
                  {isHindi ? 'राज्य (State)' : 'State'}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  id="profile-state-select"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                  <option value="Punjab">Punjab (पंजाब)</option>
                  <option value="Haryana">Haryana (हरियाणा)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Gujarat">Gujarat (गुजरात)</option>
                  <option value="Delhi">Delhi NCT (दिल्ली)</option>
                  <option value="Karnataka">Karnataka (कर्नाटक)</option>
                  <option value="Andhra Pradesh">Andhra Pradesh (आंध्र प्रदेश)</option>
                </select>
              </div>

              <Input
                label={isHindi ? 'पिनकोड (Pincode)' : 'Pincode'}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="466001"
                required
                id="profile-pincode"
              />
            </div>
          </div>

          {/* Farmer Specific Fields */}
          {role === 'farmer' && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fpo-checkbox"
                  checked={isVerifiedFPO}
                  onChange={(e) => setIsVerifiedFPO(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="fpo-checkbox" className="text-xs font-bold text-stone-800 cursor-pointer">
                  {isHindi ? 'क्या आप किसी FPO (किसान उत्पादक संगठन) के सदस्य हैं?' : 'Are you associated with a registered FPO?'}
                </label>
              </div>

              {isVerifiedFPO && (
                <Input
                  label={isHindi ? 'FPO का नाम (Registered FPO Name)' : 'FPO Organization Name'}
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  placeholder="e.g. Narmada Kisan Samriddhi Producer Co."
                  id="fpo-name-input"
                />
              )}
            </div>
          )}

          {/* Buyer Specific Fields */}
          {role === 'buyer' && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-800" />
                <span>{isHindi ? 'व्यावसायिक विवरण (Enterprise Details):' : 'Commercial Enterprise Details:'}</span>
              </h4>

              <Input
                label={isHindi ? 'फर्म / व्यापारिक नाम' : 'Business / Firm Name'}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Bharat Agro Commodity Exporters Ltd."
                id="buyer-business-name"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {isHindi ? 'व्यापार का प्रकार (Business Category)' : 'Business Category'}
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg bg-white border border-stone-200 text-stone-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  id="buyer-type-select"
                >
                  <option value="Wholesale Commodity Trader">Wholesale Commodity Trader (थोक व्यापारी)</option>
                  <option value="Food Processing Mill">Food Processing / Dal Mill (दाल / आटा मिल)</option>
                  <option value="Agri Commodity Exporter">Agri Commodity Exporter (कृषि निर्यातक)</option>
                  <option value="Retail Supermarket Chain">Retail Supermarket Chain (रिटेल चेन)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {isHindi ? 'वापस' : 'Back'}
            </Button>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
              id="final-signup-submit-btn"
            >
              {isHindi ? 'पंजीकरण पूरा करें (Complete Registration)' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      )}

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center text-xs text-stone-600 pt-1 border-t border-stone-100">
          <span>{isHindi ? 'पहले से खाता है?' : 'Already have an account?'} </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
            id="switch-to-login-btn"
          >
            {isHindi ? 'यहाँ लॉग इन करें (Sign In)' : 'Sign In Here'}
          </button>
        </div>
      )}
    </div>
  );
};
