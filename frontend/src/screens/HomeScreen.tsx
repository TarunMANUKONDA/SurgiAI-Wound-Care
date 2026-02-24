import { useState, useEffect } from 'react';
import { Screen } from '../types';
import { useAnalysis } from '../context/AnalysisContext';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { createNewCase, setCurrentCase, refreshCases, woundCases } = useAnalysis();
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'select'>('create');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  const handleStartUpload = () => {
    setShowCaseModal(true);
  };

  const handleProceed = async () => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        if (!newCaseName.trim()) return;
        const newCase = await createNewCase(newCaseName, 'Created from Home Screen');
        if (newCase) {
          setCurrentCase(newCase);
          setShowCaseModal(false);
          onNavigate('upload');
        }
      } else {
        if (!selectedCaseId) return;
        const selected = woundCases.find(c => c.id.toString() === selectedCaseId);
        if (selected) {
          setCurrentCase(selected);
          setShowCaseModal(false);
          onNavigate('upload');
        }
      }
    } catch (error) {
      console.error("Error proceeding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20 relative transition-colors">
      {/* Header */}
      <div className="pt-8 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Hello, Stay Healthy 👋</h1>
          <p className="text-gray-500 mt-1">How can we help you today?</p>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 bg-gradient-to-br from-[#2F80ED] to-[#6366f1] rounded-full flex items-center justify-center shadow-lg shadow-blue-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Primary Action */}
      <button
        onClick={handleStartUpload}
        className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3 mb-4"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-lg font-medium">Upload New Wound Image</span>
      </button>

      {/* Secondary Action */}
      <button
        onClick={() => onNavigate('history')}
        className="w-full bg-white hover:bg-gray-50 text-[#2F80ED] py-4 px-6 rounded-2xl shadow-md border border-gray-100 transition-all duration-200 flex items-center justify-center gap-3 mb-6"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-lg font-medium">Wound History</span>
      </button>

      {/* Cards Section */}
      <div className="space-y-4">
        {/* Frequent Questions Card */}
        <button
          onClick={() => onNavigate('chat')}
          className="w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2F80ED] to-[#6366f1] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">Frequent Questions</h3>
              <p className="text-gray-500 text-sm mt-1">Find answers about surgical wound care</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Daily Care Tips Card */}
        <button
          onClick={() => onNavigate('daily-tips')}
          className="w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#27AE60] to-[#10b981] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">Daily Care Tips</h3>
              <p className="text-gray-500 text-sm mt-1">Essential wound care guidelines for faster healing</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Quick Access Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Learn More</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('wound-types')}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800">Wound Types</h4>
            <p className="text-xs text-gray-500 mt-1">Learn about classifications</p>
          </button>

          <button
            onClick={() => onNavigate('visual-library')}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800">Visual Reference</h4>
            <p className="text-xs text-gray-500 mt-1">Healing stage images</p>
          </button>

          <button
            onClick={() => onNavigate('healing-levels')}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800">Healing Levels</h4>
            <p className="text-xs text-gray-500 mt-1">Track your progress</p>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800">FAQs</h4>
            <p className="text-xs text-gray-500 mt-1">Common questions</p>
          </button>
        </div>
      </div>

      {/* Safety Note */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">
            Not a medical diagnosis. For emergencies consult a doctor.
          </p>
        </div>
      </div>

      {/* Case Selection Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transition-colors">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Start New Analysis</h3>

            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setMode('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mode === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                New Case
              </button>
              <button
                onClick={() => setMode('select')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mode === 'select' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Existing Case
              </button>
            </div>

            {mode === 'create' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
                <input
                  type="text"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  placeholder="e.g., Right Leg Injury"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Case</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a case...</option>
                  {woundCases.map(wc => (
                    <option key={wc.id} value={wc.id}>{wc.name} ({new Date(wc.createdAt).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCaseModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={isLoading || (mode === 'create' && !newCaseName) || (mode === 'select' && !selectedCaseId)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2F80ED] text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
