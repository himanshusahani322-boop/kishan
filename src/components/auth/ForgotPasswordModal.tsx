import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button, Input } from '../ui';
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReturnToLogin?: () => void;
  language?: 'en' | 'hi';
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessReturnToLogin,
  language = 'en'
}) => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maskedContact, setMaskedContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHindi = language === 'hi';

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError(isHindi ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें' : 'Please enter your registered email or mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(identifier.trim());
      setResetToken(res.resetToken || '');
      setDevOtpCode(res.otpCode || '');
      setEnteredOtp(res.otpCode || '');
      setMaskedContact(res.contactMasked || identifier);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Could not initiate password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(isHindi ? 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isHindi ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        resetToken,
        newPassword,
        otpCode: enteredOtp.trim()
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setIdentifier('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-700" />
          <span>{isHindi ? 'पासवर्ड रीसेट करें (Password Reset)' : 'Reset Password'}</span>
        </div>
      }
      maxWidth="md"
    >
      <div className="p-5 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Request OTP */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHindi
                ? 'अपना पंजीकृत ईमेल या 10-अंकों का मोबाइल नंबर दर्ज करें। हम आपको पासवर्ड रीसेट के लिए एक सुरक्षा कोड भेजेंगे।'
                : 'Enter your registered email address or 10-digit mobile number. We will verify your account and generate a secure password reset token.'}
            </p>

            <Input
              label={isHindi ? 'पंजीकृत ईमेल या मोबाइल नंबर' : 'Registered Email or Mobile'}
              placeholder="e.g. rameshwar.patel@kisansaathi.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
              id="forgot-identifier-input"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                id="send-reset-code-btn"
              >
                {isHindi ? 'रीसेट कोड प्राप्त करें' : 'Generate Reset Code'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 'verify' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* Dev Environment helper banner */}
            {devOtpCode && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHindi ? 'परीक्षण ओटीपी कोड (Sandbox OTP):' : 'Sandbox Verification OTP Code:'}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span>Simulated OTP sent to <strong>{maskedContact}</strong>:</span>
                  <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                    {devOtpCode}
                  </span>
                </div>
              </div>
            )}

            <Input
              label={isHindi ? '6-अंकों का सुरक्षा कोड (OTP)' : '6-Digit Security Code (OTP)'}
              placeholder="123456"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              required
              id="reset-otp-input"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={isHindi ? 'नया पासवर्ड (New Password)' : 'New Password'}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                id="reset-new-password-input"
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
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                id="reset-confirm-password-input"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep('request')}>
                {isHindi ? 'वापस' : 'Back'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                id="submit-new-password-btn"
              >
                {isHindi ? 'पासवर्ड अपडेट करें' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Success State */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-base text-stone-900">
                {isHindi ? 'पासवर्ड सफलतापूर्वक बदल दिया गया!' : 'Password Reset Successfully!'}
              </h4>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                {isHindi
                  ? 'आपका पासवर्ड सुरक्षित रूप से अपडेट हो गया है। अब आप नए पासवर्ड के साथ लॉग इन कर सकते हैं।'
                  : 'Your account password has been cryptographically updated. You can now sign in with your new credentials.'}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                handleClose();
                if (onSuccessReturnToLogin) onSuccessReturnToLogin();
              }}
              fullWidth
              id="password-reset-done-btn"
            >
              {isHindi ? 'लॉग इन पर वापस जाएं' : 'Back to Sign In'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
