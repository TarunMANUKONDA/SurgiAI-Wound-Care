import { Screen } from '../types';
import { healingStages, careMatrix } from '../data/woundData';

interface HealingLevelsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const levelColors = ['#EB5757', '#F2994A', '#27AE60', '#2F80ED'];

export function HealingLevelsScreen({ onNavigate }: HealingLevelsScreenProps) {
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
          <h1 className="text-xl font-semibold text-gray-800">Healing Level System</h1>
          <p className="text-sm text-gray-500">Track your recovery</p>
        </div>
      </div>

      {/* Healing Levels */}
      <div className="space-y-4 mb-6">
        {healingStages.map((stage, index) => (
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
                    Level {stage.level}
                  </span>
                  <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{stage.description}</p>

                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: `${levelColors[index]}10` }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: levelColors[index] }}>
                    Appearance
                  </p>
                  <p className="text-xs text-gray-600">{stage.appearance}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Recommended Care</p>
                  <p className="text-sm text-gray-700">{stage.care}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Healing Care Matrix */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">Healing Care Matrix</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#2F80ED] text-white">
              <tr>
                <th className="text-left p-3 font-medium">Healing Stage</th>
                <th className="text-left p-3 font-medium">Care</th>
              </tr>
            </thead>
            <tbody>
              {careMatrix.map((item, index) => (
                <tr key={item.stage} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 font-medium text-gray-700">{item.stage}</td>
                  <td className="p-3 text-gray-600">{item.care}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Healing Timeline</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-yellow-300 via-green-300 to-blue-300 rounded-full" />
          <div className="space-y-6">
            {healingStages.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-4 relative">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-white border-4 z-10"
                  style={{ borderColor: levelColors[index] }}
                >
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{stage.name}</p>
                  <p className="text-xs text-gray-500">
                    {index === 0 && '0-4 hours'}
                    {index === 1 && '1-4 days'}
                    {index === 2 && '4-21 days'}
                    {index === 3 && '21 days - 2 years'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Reference Gallery */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">Visual Reference Gallery</h3>
        <p className="text-sm text-gray-500 mb-4">Real examples of wound healing stages</p>

        <div className="space-y-4">
          {/* Early Stage - Sutured Wound */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#F2994A]">
                Early Stage
              </span>
              <p className="text-sm font-medium text-gray-700">Sutured Surgical Wound</p>
            </div>
            <img
              src="/early-stage.jpg"
              alt="Early stage sutured wound with stitches"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">Fresh surgical wound with sutures. Note slight redness and swelling which is normal in early healing.</p>
          </div>

          {/* Mid Stage - Active Healing */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#27AE60]">
                Mid Stage
              </span>
              <p className="text-sm font-medium text-gray-700">Active Healing Phase</p>
            </div>
            <img
              src="/mid-stage.png"
              alt="Mid-stage healing wound showing reduced inflammation"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">Wound showing good progress with reduced redness and inflammation. Edges closing well.</p>
          </div>

          {/* Healing Progression */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#2F80ED]">
                Progression
              </span>
              <p className="text-sm font-medium text-gray-700">Healing Timeline Series</p>
            </div>
            <img
              src="/progression.png"
              alt="Series showing wound healing progression over time"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <p className="text-xs text-gray-600">Three-stage progression showing healing from fresh wound to scar formation. Compare changes in color and texture.</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> These are reference images. Your wound's appearance may vary. Always consult with your healthcare provider if you have concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
