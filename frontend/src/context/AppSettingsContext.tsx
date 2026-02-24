import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppSettings } from '../types';
import { translations, Language, TranslationKey } from '../translations';

interface AppSettingsContextType {
    settings: AppSettings;
    profileImage: string | null;
    setProfileImage: (image: string | null) => void;
    setLanguage: (language: AppSettings['language']) => void;
    updateNotificationSetting: (key: keyof AppSettings['notifications'], value: boolean) => void;
    t: (key: TranslationKey) => string;
}

const defaultSettings: AppSettings = {
    language: 'en',
    notifications: {
        push: true,
        email: true,
        dailyTips: true,
        progressReminders: true,
    },
};

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettings must be used within AppSettingsProvider');
    }
    return context;
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
    try {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // migration for new languages
            if (parsed.darkMode !== undefined) delete parsed.darkMode;
            if (!parsed.language) parsed.language = 'en';
            return parsed;
        }
    } catch (e) {
        console.error('Failed to load app settings:', e);
    }
    return defaultSettings;
};

// ... other loaders remain same ...
const loadProfileImage = (): string | null => {
    try {
        return localStorage.getItem('profileImage');
    } catch (e) {
        console.error('Failed to load profile image:', e);
    }
    return null;
};

const saveSettings = (settings: AppSettings) => {
    try {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save app settings:', e);
    }
};

const saveProfileImage = (image: string | null) => {
    try {
        if (image) {
            localStorage.setItem('profileImage', image);
        } else {
            localStorage.removeItem('profileImage');
        }
    } catch (e) {
        console.error('Failed to save profile image:', e);
    }
};

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(loadSettings);
    const [profileImage, setProfileImageState] = useState<string | null>(loadProfileImage);

    // Apply Dark Mode effect (Disabled - Always Light)
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        saveSettings(settings);
    }, [settings]);

    // Translation helper
    const t = useCallback((key: TranslationKey): string => {
        const lang = settings.language as Language;
        return translations[lang]?.[key] || translations['en'][key] || key;
    }, [settings.language]);

    const setProfileImage = useCallback((image: string | null) => {
        setProfileImageState(image);
        saveProfileImage(image);
    }, []);

    const setLanguage = useCallback((language: AppSettings['language']) => {
        setSettings(prev => ({
            ...prev,
            language,
        }));
    }, []);

    const updateNotificationSetting = useCallback(
        (key: keyof AppSettings['notifications'], value: boolean) => {
            setSettings(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [key]: value,
                },
            }));
        },
        []
    );

    return (
        <AppSettingsContext.Provider
            value={{
                settings,
                profileImage,
                setProfileImage,
                setLanguage,
                updateNotificationSetting,
                t,
            }}
        >
            {children}
        </AppSettingsContext.Provider>
    );
};
