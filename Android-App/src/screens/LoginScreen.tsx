import { useState } from 'react';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { Heart } from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { login } = useAuth();
  const { t } = useAppSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('fillFieldsError'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('invalidEmailError'));
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      onNavigate('home');
    } else {
      setError(result.error || t('loginFailedError'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col transition-colors">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-[#4D7FFF] to-[#2F80ED] w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-200 border-4 border-white/20 transform transition-all duration-300 hover:scale-105">
              <Heart className="w-12 h-12 text-white fill-white drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('welcomeBack')}</h1>
          <p className="text-gray-500 mt-1">{t('signInToContinue')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder={t('passwordPlaceholder')}
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
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-[#2F80ED] text-sm font-medium hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* API Host Display */}
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>{t('protectedEncryption')}</p>
          </div>

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
              t('signIn')
            )}
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-gray-500 mt-6">
          {t('dontHaveAccount')}{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-[#2F80ED] font-semibold hover:underline"
          >
            {t('signUp')}
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="p-6">
        <p className="text-xs text-gray-400 text-center">
          {t('bySigningIn')}{' '}
          <button className="text-[#2F80ED]">{t('termsConditions')}</button>
          {' '}{t('and')}{' '}
          <button className="text-[#2F80ED]">{t('privacyPolicy')}</button>
        </p>
      </div>
    </div>
  );
}
