import { useState, useRef, useEffect } from 'react';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';

interface OTPVerificationScreenProps {
    email: string;
    initialMessage?: string;
    onNavigate: (screen: Screen) => void;
    onVerified: () => void;
}

export function OTPVerificationScreen({ email, initialMessage, onNavigate, onVerified }: OTPVerificationScreenProps) {
    const { verifyOTP, resendOTP } = useAuth();
    const { t } = useAppSettings();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[value.length - 1];
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length < 6) {
            setError(t('verifyOTP')); // Fallback to label if error key missing
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await verifyOTP(email, otpString);

        if (result.success) {
            onVerified();
        } else {
            setError(result.error || 'Verification failed');
        }
        setIsLoading(false);
    };

    const handleResend = async () => {
        if (timer > 0 || isResending) return;

        setIsResending(true);
        const result = await resendOTP(email);

        if (result.success) {
            setTimer(60);
            setError('');
        } else {
            setError(result.error || 'Failed to resend code');
        }
        setIsResending(false);
    };

    return (
        <div className="min-h-screen bg-[#F9FBFF] flex flex-col transition-colors">
            {/* Header */}
            <div className="p-4">
                <button
                    onClick={() => onNavigate('signup')}
                    className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 px-6 flex flex-col items-center justify-center -mt-12">
                {/* Icon */}
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8">
                    <svg className="w-10 h-10 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
                    {t('verifyEmail')}
                </h1>
                <div className="text-gray-500 text-center mb-10 max-w-xs leading-relaxed">
                    {initialMessage ? (
                        <p>{initialMessage}</p>
                    ) : (
                        <p>
                            {t('verificationCodeSent')} <span className="text-gray-800 font-medium">{email}</span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    <div className="flex justify-between gap-2 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 bg-white border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length < 6}
                        className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none"
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
                            t('verifyOTP')
                        )}
                    </button>
                </form>

                {/* Resend */}
                <div className="mt-8 text-center transition-colors">
                    <p className="text-gray-500 mb-2">{t('didntReceiveCode')}</p>
                    {timer > 0 ? (
                        <p className="text-sm font-medium text-gray-400">
                            {t('resendIn', { s: timer })}
                        </p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-[#2F80ED] font-semibold hover:underline flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isResending ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t('resending')}
                                </>
                            ) : (
                                t('resendCode')
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Safety Info */}
            <div className="p-6">
                <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
                    <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-[#2F80ED] leading-relaxed">
                        {t('securityNote')}
                    </p>
                </div>
            </div>
        </div>
    );
}
