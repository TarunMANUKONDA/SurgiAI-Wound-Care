import { Screen } from '../types';
import { dailyCareTips } from '../data/woundData';
import { useAppSettings } from '../context/AppSettingsContext';

interface DailyTipsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const tipIcons = ['🧼', '🩹', '🖐️', '🥩', '💧', '🚭', '😴', '👀', '💊', '📅'];

export function DailyTipsScreen({ onNavigate }: DailyTipsScreenProps) {
  const { t } = useAppSettings();
  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{t('dailyTipsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('dailyTipsDesc')}</p>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-[#2F80ED] to-[#6366f1] rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">{t('todayFocus')}</h3>
            <p className="text-sm text-blue-100">{t('todayFocusDesc')}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">🩹</p>
            <p className="text-xs">{t('changeDressing')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">💧</p>
            <p className="text-xs">{t('stayHydrated')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">📸</p>
            <p className="text-xs">{t('takePhoto')}</p>
          </div>
        </div>
      </div>

      {/* All Tips */}
      <div className="space-y-3">
        {dailyCareTips.map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {tipIcons[index]}
              </div>
              <div className="flex-1">
                <p className="text-gray-700">{t(`tip${index + 1}` as any)}</p>
              </div>
              <div className="w-6 h-6 border-2 border-gray-300 rounded-md flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Medical Care Guidelines */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('medicalCareGuidelines')}</h2>

        {/* Clean Wound */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">🩹</span>
            </div>
            <h3 className="font-medium text-gray-800">{t('clean')}</h3>
          </div>
          <ul className="space-y-1 ml-11">
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {t('hemostasisCare').split(',')[1]?.trim() || 'Keep dry'}
            </li>
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {t('hemostasisCare').split(',')[2]?.trim() || 'Simple dressing'}
            </li>
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {t('cleanDesc')}
            </li>
          </ul>
        </div>

        {/* Contaminated */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">⚠️</span>
            </div>
            <h3 className="font-medium text-gray-800">{t('contaminated')}</h3>
          </div>
          <ul className="space-y-1 ml-11">
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              {t('contaminatedDesc')}
            </li>
          </ul>
        </div>

        {/* Infected */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">🔴</span>
            </div>
            <h3 className="font-medium text-gray-800">{t('infected')}</h3>
          </div>
          <ul className="space-y-1 ml-11">
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {t('infectedDesc')}
            </li>
          </ul>
        </div>

        {/* Graft Site */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">🩼</span>
            </div>
            <h3 className="font-medium text-gray-800">{t('graftSite')}</h3>
          </div>
          <ul className="space-y-1 ml-11">
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              {t('graftSiteDesc')}
            </li>
          </ul>
        </div>
      </div>

      {/* Safety Note */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">
            {t('safetyNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
