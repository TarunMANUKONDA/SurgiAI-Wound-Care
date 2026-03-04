import { useState } from 'react';
import { Screen, WoundType } from '../types';
import { woundTypes } from '../data/woundData';
import { useAppSettings } from '../context/AppSettingsContext';

interface WoundTypesScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectType: (woundType: WoundType) => void;
}

const idToKeyMap: Record<string, string> = {
  'clean': 'clean',
  'clean-contaminated': 'cleanContaminated',
  'contaminated': 'contaminated',
  'infected': 'infected',
  'incision': 'incision',
  'excision': 'excision',
  'puncture': 'puncture',
  'drain-site': 'drainSite',
  'graft-site': 'graftSite'
};

const healingTimeKeyMap: Record<string, string> = {
  '7-14 days': 'days7_14',
  '10-21 days': 'days10_21',
  '21-42 days': 'days21_42',
  '42-90+ days': 'days42_90',
  '14-28 days': 'days14_28',
  '7-21 days': 'days7_21',
  '14-28 days after drain removal': 'daysAfterRemoval'
};

const categoryIcons: Record<string, string> = {
  'clean': '🩹',
  'clean-contaminated': '⚠️',
  'contaminated': '🦠',
  'infected': '🔴',
  'incision': '✂️',
  'excision': '🔪',
  'puncture': '📍',
  'drain-site': '💧',
  'graft-site': '🩼'
};

export function WoundTypesScreen({ onNavigate, onSelectType }: WoundTypesScreenProps) {
  const { t } = useAppSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const getWoundName = (id: string, defaultName: string) => {
    const key = idToKeyMap[id];
    if (key) {
      const translated = t(key as any);
      return translated !== key ? translated : defaultName;
    }
    return defaultName;
  };

  const getWoundDesc = (id: string, defaultDesc: string) => {
    const key = `${idToKeyMap[id]}Desc`;
    if (key) {
      const translated = t(key as any);
      return translated !== key ? translated : defaultDesc;
    }
    return defaultDesc;
  };

  const classifications = woundTypes
    .filter(w => w.category === 'classification')
    .filter(w =>
      getWoundName(w.id, w.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getWoundDesc(w.id, w.definition).toLowerCase().includes(searchTerm.toLowerCase())
    );

  const types = woundTypes
    .filter(w => w.category === 'type')
    .filter(w =>
      getWoundName(w.id, w.name).toLowerCase().includes(searchTerm.toLowerCase())
    );

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
          <h1 className="text-xl font-semibold text-gray-800">{t('woundTypeTitle')}</h1>
          <p className="text-sm text-gray-500">{t('educationalGuide')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchCases' as any) || 'Search...'}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-shadow"
        />
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            {t('emergencyContactDoc')}
          </p>
        </div>
      </div>

      {/* Wound Classifications */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('classificationTitle')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {classifications.map((wound) => (
            <button
              key={wound.id}
              onClick={() => onSelectType(wound)}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl mb-3">
                {categoryIcons[wound.id]}
              </div>
              <h3 className="font-medium text-gray-800 text-sm">{getWoundName(wound.id, wound.name)}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {getWoundDesc(wound.id, wound.definition)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Wound Types */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('woundTypeTitle')}</h2>
        <div className="space-y-3">
          {types.map((wound) => (
            <button
              key={wound.id}
              onClick={() => onSelectType(wound)}
              className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {categoryIcons[wound.id]}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{getWoundName(wound.id, wound.name)}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('healingTimeline')}: {t(healingTimeKeyMap[wound.healingTime] as any || wound.healingTime)}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {classifications.length === 0 && types.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('noMatchingCases' as any)}</p>
        </div>
      )}
    </div>
  );
}
