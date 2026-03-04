import { useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

export function LanguageSwitcher() {
    const { settings, setLanguage } = useAppSettings();
    const [isOpen, setIsOpen] = useState(false);

    const languageOptions = [
        { value: 'en', label: 'EN', fullName: 'English' },
        { value: 'hi', label: 'HI', fullName: 'Hindi' },
        { value: 'te', label: 'TE', fullName: 'తెలుగు' },
        { value: 'ta', label: 'TA', fullName: 'தமிழ்' },
    ];

    const currentLang = languageOptions.find(opt => opt.value === settings.language) || languageOptions[0];

    return (
        <div className="fixed top-[env(safe-area-inset-top,1rem)] right-4 z-[9999]">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-sm font-bold text-[#2F80ED] transition-all active:scale-95"
                >
                    {currentLang.label}
                </button>

                {isOpen && (
                    <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[120px] animate-fade-in">
                        <div className="grid grid-cols-1 gap-1">
                            {languageOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setLanguage(option.value as any);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-left text-sm font-medium transition-colors ${settings.language === option.value
                                        ? 'bg-blue-50 text-[#2F80ED]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="mr-2">{option.label}</span>
                                    <span className="text-xs text-gray-400">{option.fullName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
