import { Screen } from '../types';
import { healingStages, careMatrix } from '../data/woundData';
import { useAppSettings } from '../context/AppSettingsContext';

interface HealingLevelsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const levelColors = ['#EB5757', '#F2994A', '#27AE60', '#2F80ED'];

export function HealingLevelsScreen({ onNavigate }: HealingLevelsScreenProps) {
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
          <h1 className="text-xl font-semibold text-gray-800">{t('healingLevelSystem')}</h1>
          <p className="text-sm text-gray-500">{t('recoveryTracking')}</p>
        </div>
      </div>

      {/* Healing Levels */}
      <div className="space-y-4 mb-6">
        {healingStages.map((stage, index) => {
          const stageKey = stage.stage.toLowerCase();
          return (
            <div key={stage.stage} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${levelColors[index]}20` }}
                >
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: levelColors[index] }}
                    >
                      {t('level')} {stage.level}
                    </span>
                    <h3 className="font-semibold text-gray-800">{t(stageKey as any)}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{t(`${stageKey}Desc` as any)}</p>

                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: `${levelColors[index]}10` }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: levelColors[index] }}>
                      {t('appearance')}
                    </p>
                    <p className="text-xs text-gray-600">{t(`${stageKey}Appearance` as any)}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('careSteps')}</p>
                    <p className="text-sm text-gray-700">{t(`${stageKey}Care` as any)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Healing Care Matrix */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">{t('healingCareMatrix')}</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#2F80ED] text-white">
              <tr>
                <th className="text-left p-3 font-medium">{t('healingTimeline')}</th>
                <th className="text-left p-3 font-medium">{t('careSteps')}</th>
              </tr>
            </thead>
            <tbody>
              {careMatrix.map((item, index) => {
                const stageKey = item.stage.split(' ')[0].toLowerCase();
                return (
                  <tr key={item.stage} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-medium text-gray-700">{t(stageKey as any)}</td>
                    <td className="p-3 text-gray-600">{t(`${stageKey}Care` as any)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">{t('healingTimeline')}</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-yellow-300 via-green-300 to-blue-300 rounded-full" />
          <div className="space-y-6">
            {healingStages.map((stage, index) => {
              const stageKey = stage.stage.toLowerCase();
              return (
                <div key={stage.stage} className="flex items-center gap-4 relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-white border-4 z-10"
                    style={{ borderColor: levelColors[index] }}
                  >
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{t(stageKey as any)}</p>
                    <p className="text-xs text-gray-500">
                      {t(`${stageKey}Time` as any)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Reference Gallery */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">{t('visualGallery')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('compareWounds')}</p>

        <div className="space-y-4">
          {/* Early Stage - Sutured Wound */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#F2994A]">
                {t('inflammatory')}
              </span>
              <p className="text-sm font-medium text-gray-700">{t('incision')}</p>
            </div>
            <img
              src="/early-stage.jpg"
              alt="Early stage sutured wound with stitches"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">{t('inflammatoryAppearance')}</p>
          </div>

          {/* Mid Stage - Active Healing */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#27AE60]">
                {t('proliferative')}
              </span>
              <p className="text-sm font-medium text-gray-700">{t('normalHealing')}</p>
            </div>
            <img
              src="/mid-stage.png"
              alt="Mid-stage healing wound showing reduced inflammation"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">{t('proliferativeAppearance')}</p>
          </div>

          {/* Healing Progression */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#2F80ED]">
                {t('maturation')}
              </span>
              <p className="text-sm font-medium text-gray-700">{t('healingTimeline')}</p>
            </div>
            <img
              src="/progression.png"
              alt="Series showing wound healing progression over time"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">{t('maturationAppearance')}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-800">
            <strong>{t('safetyNote')}:</strong> {t('emergencyContactDoc')}
          </p>
        </div>
      </div>
    </div>
  );
}
