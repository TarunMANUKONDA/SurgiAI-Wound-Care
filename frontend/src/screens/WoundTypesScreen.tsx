import { Screen, WoundType } from '../types';
import { woundTypes } from '../data/woundData';

interface WoundTypesScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectType: (woundType: WoundType) => void;
}

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
  const classifications = woundTypes.filter(w => w.category === 'classification');
  const types = woundTypes.filter(w => w.category === 'type');

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
          <h1 className="text-xl font-semibold text-gray-800">Types of Surgical Wounds</h1>
          <p className="text-sm text-gray-500">Educational reference</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            These are general clinical guidelines for educational purposes.
          </p>
        </div>
      </div>

      {/* Wound Classifications */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Wound Classifications</h2>
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
              <h3 className="font-medium text-gray-800 text-sm">{wound.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{wound.definition.substring(0, 50)}...</p>
            </button>
          ))}
        </div>
      </div>

      {/* Wound Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Wound Types</h2>
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
                  <h3 className="font-medium text-gray-800">{wound.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Healing: {wound.healingTime}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
