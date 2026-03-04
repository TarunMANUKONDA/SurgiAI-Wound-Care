import { useState, useEffect, useRef } from 'react';
import { Screen, User } from '../types';
import { useAppSettings } from '../context/AppSettingsContext';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout?: () => void;
  onResetOnboarding?: () => void;
  currentUser?: User | null;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export function ProfileScreen({ onNavigate, onLogout, onResetOnboarding, currentUser }: ProfileScreenProps) {
  const { settings, profileImage, setProfileImage, setLanguage, t } = useAppSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: currentUser?.name || 'John Doe',
    email: currentUser?.email || 'john.doe@email.com',
    phone: currentUser?.phone || '+1 (555) 123-4567',
    dateOfBirth: currentUser?.dateOfBirth || '1985-06-15',
    bloodType: currentUser?.bloodType || 'O+',
    emergencyContact: currentUser?.emergencyContact || 'Jane Doe',
    emergencyPhone: currentUser?.emergencyPhone || '+1 (555) 987-6543'
  });

  // Update profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
      }));
    }
  }, [currentUser]);

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    // Save to localStorage
    try {
      const updatedUser = {
        ...currentUser,
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        dateOfBirth: editedProfile.dateOfBirth,
        bloodType: editedProfile.bloodType,
        emergencyContact: editedProfile.emergencyContact,
        emergencyPhone: editedProfile.emergencyPhone,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(settings.language === 'en' ? 'en-US' : settings.language, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'ta', label: 'தமிழ்' },
  ];


  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('personalInfo')}</h1>
            <p className="text-sm text-gray-500">{t('manageInfo')}</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#2F80ED] text-white rounded-xl text-sm font-medium"
          >
            {t('edit')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-[#27AE60] text-white rounded-xl text-sm font-medium"
            >
              {t('save')}
            </button>
          </div>
        )}
      </div>

      {/* Profile Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#2F80ED] to-[#6366f1] rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-semibold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-[#2F80ED]"
              >
                <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mt-3">{profile.name}</h2>
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">{t('personalInfo')}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('fullName')}</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            ) : (
              <p className="text-gray-800 mt-1">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('email')}</label>
            {isEditing ? (
              <input
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            ) : (
              <p className="text-gray-800 mt-1">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('phone')}</label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.phone}
                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            ) : (
              <p className="text-gray-800 mt-1">{profile.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">{t('dob')}</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedProfile.dateOfBirth}
                  onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
                />
              ) : (
                <p className="text-gray-800 mt-1">{formatDate(profile.dateOfBirth)}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">{t('bloodType')}</label>
              {isEditing ? (
                <select
                  value={editedProfile.bloodType}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bloodType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 mt-1">{profile.bloodType}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">{t('emergencyContact')}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('contactName')}</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.emergencyContact}
                onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            ) : (
              <p className="text-gray-800 mt-1">{profile.emergencyContact}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">{t('contactPhone')}</label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.emergencyPhone}
                onChange={(e) => setEditedProfile({ ...editedProfile, emergencyPhone: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            ) : (
              <p className="text-gray-800 mt-1">{profile.emergencyPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">{t('appSettings')}</h3>
        </div>

        <div className="space-y-3">
          {/* Language Selector */}
          <div className="w-full flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-gray-700">{t('language')}</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <button
            onClick={() => onNavigate('notification-settings')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-gray-700">{t('notifications')}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Help & Support */}
          <button
            onClick={() => onNavigate('help-support')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{t('helpSupport')}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => onNavigate('legal' as any)}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-gray-700">{t('privacyPolicy')}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Terms & Conditions */}
          <button
            onClick={() => onNavigate('legal' as any)}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-gray-700">{t('termsConditions')}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* App Guide / Tutorial */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">{t('appGuide')}</h3>
        </div>
        <button
          onClick={onResetOnboarding}
          className="w-full flex items-center justify-between py-3"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">{t('reWatchTutorial')}</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>


      {/* Logout Button */}
      <button
        onClick={handleLogoutClick}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 px-6 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {t('logout')}
      </button>

      {/* Version Info */}
      <p className="text-center text-xs text-gray-400 mt-4">
        {t('version')} 1.0.0
      </p>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('logoutConfirm')}</h3>
              <p className="text-gray-600 mb-6">
                {t('logoutConfirmDesc')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
