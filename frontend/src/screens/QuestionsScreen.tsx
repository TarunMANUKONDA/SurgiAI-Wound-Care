import { useState } from 'react';
import { Screen, PatientAnswers } from '../types';
import { useAnalysis } from '../context/AnalysisContext';

interface QuestionsScreenProps {
  onNavigate: (screen: Screen) => void;
  onSubmit: (answers: PatientAnswers) => void;
}

export function QuestionsScreen({ onNavigate, onSubmit }: QuestionsScreenProps) {
  const { currentAnalysis, setPatientAnswers } = useAnalysis();
  const [answers, setAnswers] = useState<PatientAnswers>({
    daysSinceSurgery: 0,
    painLevel: 'none',
    discharge: 'no',
    fever: false,
    rednessSpread: false,
    dressingChanged: true
  });

  const handleSubmit = () => {
    // Save answers to context
    setPatientAnswers({
      daysSinceSurgery: answers.daysSinceSurgery,
      painLevel: answers.painLevel,
      dischargeType: answers.discharge,
      hasFever: answers.fever,
      rednessSpread: answers.rednessSpread,
      dressingChanged: answers.dressingChanged,
    });
    onSubmit(answers);
  };

  // Determine warning indicators based on AI analysis
  const getAIInsight = () => {
    if (!currentAnalysis) return null;

    const insights: string[] = [];

    if (currentAnalysis.rednessLevel > 60) {
      insights.push('Elevated redness detected in image');
    }
    if (currentAnalysis.dischargeDetected) {
      insights.push(`${currentAnalysis.dischargeType} discharge visible`);
    }
    if (currentAnalysis.tissueColor.yellow > 20) {
      insights.push('Possible slough tissue present');
    }

    return insights.length > 0 ? insights : null;
  };

  const aiInsights = getAIInsight();

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('upload')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Medical Questions</h1>
          <p className="text-sm text-gray-500">Help us assess your wound accurately</p>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">AI Image Analysis Detected:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                {aiInsights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))}
              </ul>
              <p className="text-xs text-blue-600 mt-2 italic">
                Please confirm or correct with your observations below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl p-3 shadow-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Step 2 of 4</span>
          <span className="text-xs text-[#2F80ED] font-medium">Required Questions</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="bg-[#2F80ED] h-2 rounded-full w-1/2 transition-all"></div>
        </div>
      </div>

      {/* Questions Form */}
      <div className="space-y-4">
        {/* Days since surgery */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              How many days ago was your surgery?
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={answers.daysSinceSurgery}
              onChange={(e) => setAnswers({ ...answers, daysSinceSurgery: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent text-lg"
              placeholder="0"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 font-medium">Days</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1">
            We use this to track if healing is on schedule.
          </p>
        </div>

        {/* Pain Level */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Are you currently in pain?
            </span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'none', label: 'No Pain', icon: '😊', color: 'bg-green-50 border-green-200 text-green-700', active: 'bg-green-600 text-white ring-4 ring-green-100' },
              { value: 'mild', label: 'Mild', icon: '😐', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', active: 'bg-yellow-500 text-white ring-4 ring-yellow-100' },
              { value: 'severe', label: 'Severe', icon: '😫', color: 'bg-red-50 border-red-200 text-red-700', active: 'bg-red-600 text-white ring-4 ring-red-100 active-pulse' }
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setAnswers({ ...answers, painLevel: option.value })}
                className={`py-4 px-2 rounded-xl font-medium transition-all flex flex-col items-center border-2 ${answers.painLevel === option.value
                    ? `${option.active} border-transparent shadow-lg transform scale-105`
                    : `${option.color} hover:opacity-80 border-transparent`
                  }`}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Discharge (Renamed to Fluid/Drainage) */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Is there any fluid or drainage?
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'no', label: 'Dry (None)', desc: 'Wound is dry', color: 'bg-green-50 border-green-200 text-green-700', active: 'bg-green-600 text-white' },
              { value: 'clear', label: 'Clear / Watery', desc: 'Serous fluid', color: 'bg-blue-50 border-blue-200 text-blue-700', active: 'bg-blue-600 text-white' },
              { value: 'yellow', label: 'Thick Yellow', desc: 'Possible Pus', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', active: 'bg-yellow-500 text-white' },
              { value: 'green', label: 'Green / Bad Odor', desc: 'Infection Sign', color: 'bg-red-50 border-red-200 text-red-700', active: 'bg-red-600 text-white' }
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setAnswers({ ...answers, discharge: option.value })}
                className={`py-3 px-4 rounded-xl font-medium transition-all text-left border-2 ${answers.discharge === option.value
                    ? `${option.active} border-transparent shadow-md`
                    : `${option.color} hover:bg-opacity-70 border-transparent`
                  }`}
              >
                <div className="font-bold text-sm">{option.label}</div>
                <div className={`text-xs ${answers.discharge === option.value ? 'text-white/90' : 'opacity-70'}`}>
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fever */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Do you have a fever?
            </span>
            <span className="block text-xs text-gray-500 mt-1 ml-10 font-normal">Temperature above 38°C (100.4°F)</span>
          </label>
          <div className="flex gap-3">
            {[
              { value: false, label: 'No Normal Temp', icon: '✓', color: 'bg-green-50 text-green-700 border-green-200', active: 'bg-green-600 text-white' },
              { value: true, label: 'Yes, I have a fever', icon: '🌡️', color: 'bg-red-50 text-red-700 border-red-200', active: 'bg-red-600 text-white' }
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => setAnswers({ ...answers, fever: option.value })}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${answers.fever === option.value
                    ? `${option.active} border-transparent shadow-md`
                    : `${option.color} hover:opacity-80 border-transparent`
                  }`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Redness spreading */}
        <div className={`rounded-2xl p-4 shadow-md border-l-4 transition-all ${answers.rednessSpread ? 'bg-red-50 border-red-500' : 'bg-white border-blue-500'}`}>
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Is redness spreading away from the wound?
            </span>
          </label>
          <div className="flex gap-3">
            {[
              { value: false, label: 'No, it\'s stable', icon: '✓', color: 'bg-green-50 text-green-700', active: 'bg-green-600 text-white' },
              { value: true, label: 'Yes, it\'s spreading', icon: '⚠️', color: 'bg-red-100 text-red-700', active: 'bg-red-600 text-white' }
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => setAnswers({ ...answers, rednessSpread: option.value })}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${answers.rednessSpread === option.value
                    ? `${option.active} shadow-md`
                    : `${option.color} hover:opacity-80`
                  }`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {answers.rednessSpread && (
            <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800 font-medium">
                Spreading redness can be a detailed sign of infection. Please take a photo that includes the redness.
              </p>
            </div>
          )}
        </div>

        {/* Dressing changed */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
          <label className="block font-medium text-gray-800 mb-3">
            <span className="flex items-center gap-2 text-lg">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
              Have you changed your dressing today?
            </span>
          </label>
          <div className="flex gap-3">
            {[
              { value: true, label: 'Yes', icon: '✅', color: 'bg-green-50 text-green-700', active: 'bg-green-600 text-white' },
              { value: false, label: 'No', icon: '⏳', color: 'bg-gray-100 text-gray-700', active: 'bg-gray-600 text-white' }
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => setAnswers({ ...answers, dressingChanged: option.value })}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${answers.dressingChanged === option.value
                    ? `${option.active} shadow-md`
                    : `${option.color} hover:opacity-80`
                  }`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {!answers.dressingChanged && (
            <p className="text-xs text-blue-600 mt-2 ml-1 italic">
              Daily changes are usually recommended to keep the wound clean.
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Get AI Care Advice
      </button>

      {/* Safety Note */}
      <div className="mt-4 bg-gray-100 rounded-xl p-3">
        <p className="text-xs text-gray-500 text-center">
          Your answers help improve AI accuracy but don't replace professional medical evaluation.
        </p>
      </div>
    </div>
  );
}
