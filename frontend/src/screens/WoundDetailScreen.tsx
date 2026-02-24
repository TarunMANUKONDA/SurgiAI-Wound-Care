import { Screen, WoundType } from '../types';

interface WoundDetailScreenProps {
  onNavigate: (screen: Screen) => void;
  woundType: WoundType | null;
}

export function WoundDetailScreen({ onNavigate, woundType }: WoundDetailScreenProps) {
  if (!woundType) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] p-4 flex items-center justify-center">
        <p className="text-gray-500">No wound type selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('wound-types')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{woundType.name}</h1>
          <p className="text-sm text-gray-500">
            {woundType.category === 'classification' ? 'Classification' : 'Wound Type'}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            These are general clinical guidelines.
          </p>
        </div>
      </div>

      {/* Definition */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Definition</h3>
        <p className="text-sm text-gray-600">{woundType.definition}</p>
      </div>

      {/* Common Examples */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Common Examples</h3>
        <div className="flex flex-wrap gap-2">
          {woundType.examples.map((example, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {example}
            </span>
          ))}
        </div>
      </div>

      {/* Healing Time & Normal Appearance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-800 text-sm">Healing Time</h4>
          <p className="text-xs text-gray-500 mt-1">{woundType.healingTime}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-800 text-sm">Normal Look</h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{woundType.normalAppearance.substring(0, 40)}...</p>
        </div>
      </div>

      {/* Normal Appearance Full */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Normal Appearance</h3>
        <p className="text-sm text-gray-600">{woundType.normalAppearance}</p>
      </div>

      {/* Danger Signs */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-semibold text-red-800">Danger Signs</h3>
        </div>
        <ul className="space-y-2">
          {woundType.dangerSigns.map((sign, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{sign}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Basic Care Steps */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-green-800">Basic Care Steps</h3>
        </div>
        <ul className="space-y-2">
          {woundType.careSteps.map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs text-green-800 font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-green-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
