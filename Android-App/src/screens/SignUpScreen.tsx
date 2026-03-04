import { useState } from 'react';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';

interface SignUpScreenProps {
  onNavigate: (screen: Screen) => void;
  onSignupSuccess?: (email: string, message?: string) => void;
}

export function SignUpScreen({ onNavigate, onSignupSuccess }: SignUpScreenProps) {
  const { signup } = useAuth();
  const { t } = useAppSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordRequirements = () => {
    return [
      { id: 'length', met: password.length >= 8, label: t('passReqLength') },
      { id: 'upperLower', met: /[a-z]/.test(password) && /[A-Z]/.test(password), label: t('passReqUpperLower') },
      { id: 'number', met: /[0-9]/.test(password), label: t('passReqNumber') },
      { id: 'special', met: /[^a-zA-Z0-9]/.test(password), label: t('passReqSpecial') },
    ];
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };

    const reqs = getPasswordRequirements();
    const metCount = reqs.filter(r => r.met).length;
    const strength = (metCount / reqs.length) * 100;

    if (strength <= 25) return { strength, label: t('weak'), color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: t('fair'), color: 'bg-orange-500' };
    if (strength <= 75) return { strength, label: t('good'), color: 'bg-yellow-500' };
    return { strength, label: t('strong'), color: 'bg-green-500' };
  };

  const passwordRequirements = getPasswordRequirements();
  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword || !phone || !age || !gender) {
      setError(t('fillFieldsError'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('invalidEmailError'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMinLengthError'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatchError'));
      return;
    }

    if (!agreeTerms) {
      setError(t('agreeTermsError'));
      return;
    }

    setIsLoading(true);
    const result = await signup(name, email, password, phone, parseInt(age), gender);
    setIsLoading(false);

    if (result.success) {
      onSignupSuccess?.(email, result.otp_sent ? undefined : result.message);
    } else {
      setError(result.error || result.message || t('signupFailedError'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col transition-colors">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => onNavigate('login')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('createAccount')}</h1>
            <p className="text-sm text-gray-500">{t('joinSurgiAI')}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fullName')}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors"
              />
            </div>
          </div>

          {/* Email */}
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
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone')}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('age')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t('agePlaceholder')}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('gender')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm appearance-none transition-colors"
                >
                  <option value="">{t('select')}</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                  <option value="Other">{t('other')}</option>
                  <option value="Prefer not to say">{t('preferNotToSay')}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordMinLength')}
                className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors"
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
            {/* Password Strength Meter & Suggestions */}
            {password && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('passwordSuggestions')}</span>
                  <span className={`text-xs font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 mt-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {req.met ? (
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-1 h-1 bg-current rounded-full" />
                        )}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-gray-600' : 'text-gray-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
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
                placeholder={t('reEnterPasswordPlaceholder')}
                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-colors ${confirmPassword && password !== confirmPassword
                  ? 'border-red-300'
                  : confirmPassword && password === confirmPassword
                    ? 'border-green-300'
                    : 'border-gray-200'
                  }`}
              />
              {confirmPassword && password === confirmPassword && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${agreeTerms
                ? 'bg-[#2F80ED] border-[#2F80ED]'
                : 'border-gray-300'
                }`}
            >
              {agreeTerms && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className="text-sm text-gray-600">
              {t('agreeTerms')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
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
                {t('processing')}
              </>
            ) : (
              t('signUp')
            )}
          </button>
        </form>

        {/* Sign In */}
        <p className="text-center text-gray-500 mt-6">
          {t('alreadyHaveAccount')}{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#2F80ED] font-semibold hover:underline"
          >
            {t('signIn')}
          </button>
        </p>
      </div>

      {/* Features */}
      <div className="px-6 pb-6 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-md transition-colors">
          <p className="text-xs text-gray-400 text-center mb-3">{t('whatYouGet')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">{t('aiAnalysis')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">{t('progressTracking')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">{t('aiAssistant')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">{t('personalizedAdvice')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
