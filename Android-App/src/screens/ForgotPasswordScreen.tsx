import { useState } from 'react';
import { Screen } from '../types';
import { useAppSettings } from '../context/AppSettingsContext';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8000';
const BASE_URL = API_HOST.startsWith('http') ? API_HOST : `https://${API_HOST}`;

interface ForgotPasswordScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function ForgotPasswordScreen({ onNavigate }: ForgotPasswordScreenProps) {
  const { t } = useAppSettings();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('enterEmailError'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('invalidEmailError'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t('sendResetCodeError'));
        return;
      }
      setStep('code');
    } catch (err) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(t('enterCompleteCodeError'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/verify-reset-otp?email=${encodeURIComponent(email)}&otp_code=${encodeURIComponent(fullCode)}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t('invalidCodeError'));
        return;
      }
      setStep('password');
    } catch (err) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('passwordMinLengthError'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatchError'));
      return;
    }

    setIsLoading(true);

    const fullCode = code.join('');
    try {
      const res = await fetch(
        `${BASE_URL}/api/reset-password?email=${encodeURIComponent(email)}&otp_code=${encodeURIComponent(fullCode)}&new_password=${encodeURIComponent(newPassword)}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t('resetPasswordError'));
        return;
      }
      setIsSuccess(true);
    } catch (err) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    try {
      await fetch(`${BASE_URL}/api/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST' });
    } catch (err) {
      // Silent — user will try again if needed
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">{t('passwordResetSuccess')}</h1>
        <p className="text-gray-500 text-center mb-8">
          {t('passwordResetSuccessDesc')}
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="w-full max-w-sm bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200"
        >
          {t('signInNow')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => step === 'email' ? onNavigate('login') : setStep(step === 'password' ? 'code' : 'email')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {step === 'email' && t('forgotPasswordTitle')}
            {step === 'code' && t('verificationCodeTitle')}
            {step === 'password' && t('newPasswordTitle')}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 'email' && t('forgotPasswordDesc')}
            {step === 'code' && t('verificationCodeDesc')}
            {step === 'password' && t('newPasswordDesc')}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full ${step === 'email' || step === 'code' || step === 'password' ? 'bg-[#2F80ED]' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'code' || step === 'password' ? 'bg-[#2F80ED]' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'password' ? 'bg-[#2F80ED]' : 'bg-gray-200'}`} />
        </div>
        <div className="flex justify-between mt-2">
          <span className={`text-xs ${step === 'email' ? 'text-[#2F80ED] font-medium' : 'text-gray-400'}`}>{t('email')}</span>
          <span className={`text-xs ${step === 'code' ? 'text-[#2F80ED] font-medium' : 'text-gray-400'}`}>{t('verify')}</span>
          <span className={`text-xs ${step === 'password' ? 'text-[#2F80ED] font-medium' : 'text-gray-400'}`}>{t('reset')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {/* Email Step */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600">
                {t('enterEmailDesc')}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('sending')}
                  </>
                ) : (
                  t('sendVerificationCode')
                )}
              </button>
            </form>
          </>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-gray-600">
                {t('verificationCodeSent')}
              </p>
              <p className="text-[#2F80ED] font-medium mt-1">{email}</p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  {t('enterVerificationCode')}
                </label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('verifying')}
                  </>
                ) : (
                  t('verifyCode')
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                {t('didntReceiveCode')}{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[#2F80ED] font-medium"
                >
                  {t('resendCode')}
                </button>
              </p>
            </form>
          </>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-600">
                {t('createNewPasswordDesc')}
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPasswordTitle')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('passwordMinLength')}
                    className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPassword')}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('resetting')}
                  </>
                ) : (
                  t('resetPassword')
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-6">
        <p className="text-center text-gray-500 text-sm">
          {t('alreadyHaveAccount')}{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#2F80ED] font-medium"
          >
            {t('signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}
