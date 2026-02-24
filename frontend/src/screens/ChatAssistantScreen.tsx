import { useState } from 'react';
import { Screen } from '../types';
import { AIAssistantService, AIResponse } from '../services/AIAssistantService';

interface ChatAssistantScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function ChatAssistantScreen({ onNavigate }: ChatAssistantScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  const categorizedQuestions = AIAssistantService.getQuestionsByCategory();
  const categories = Object.keys(categorizedQuestions);

  const handleSelectQuestion = (question: string) => {
    setCurrentQuestion(question);
    const response = AIAssistantService.getResponse(question);
    setCurrentResponse(response);
  };

  const handleBack = () => {
    if (currentResponse) {
      setCurrentResponse(null);
      setCurrentQuestion(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onNavigate('home');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Basic Care': return '🩹';
      case 'Symptoms & Signs': return '🔍';
      case 'Infection Concerns': return '🦠';
      case 'Stitches & Sutures': return '🧵';
      case 'Pain Management': return '💊';
      case 'Activity & Lifestyle': return '🏃';
      case 'Healing & Timeline': return '📅';
      case 'Nutrition & Factors': return '🍎';
      case 'Scar Care': return '✨';
      case 'Emergency & Medical': return '🚨';
      default: return '❓';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basic Care': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Symptoms & Signs': return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'Infection Concerns': return 'bg-red-50 text-red-600 border-red-100';
      case 'Stitches & Sutures': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Pain Management': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Activity & Lifestyle': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Healing & Timeline': return 'bg-green-50 text-green-600 border-green-100';
      case 'Nutrition & Factors': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Scar Care': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Emergency & Medical': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col transition-colors">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10 transition-colors">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:bg-gray-200"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-semibold text-gray-800 text-lg">Frequent Questions</h1>
          <p className="text-xs text-gray-500">
            {currentQuestion ? 'AI Response' : selectedCategory ? selectedCategory : 'Select a category'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-24">
        {/* VIEW 1: CATEGORY GRID */}
        {!selectedCategory && !currentResponse && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-br from-[#2F80ED] to-[#6366f1] rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-100">
              <h2 className="text-xl font-bold mb-2">How can we help?</h2>
              <p className="text-blue-100 text-sm">Select a category below to find answers to common concerns about surgical wound care.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] shadow-sm ${getCategoryColor(category)}`}
                >
                  <span className="text-3xl mb-3 block">{getCategoryIcon(category)}</span>
                  <h3 className="font-bold text-sm leading-tight">{category}</h3>
                  <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
                    {categorizedQuestions[category].length} Questions
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <span className="text-xl">🚨</span>
              <div>
                <h4 className="text-amber-900 font-bold text-sm">Need immediate help?</h4>
                <p className="text-amber-800 text-xs mt-1">If you have severe symptoms, please contact your doctor or emergency services immediately.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: QUESTION LIST */}
        {selectedCategory && !currentResponse && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className={`p-4 rounded-2xl mb-6 flex items-center gap-4 ${getCategoryColor(selectedCategory)}`}>
              <span className="text-3xl">{getCategoryIcon(selectedCategory)}</span>
              <h2 className="text-lg font-bold">{selectedCategory}</h2>
            </div>

            <div className="space-y-3">
              {categorizedQuestions[selectedCategory].map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(question)}
                  className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left flex items-center gap-4 group transition-all active:bg-blue-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#2F80ED] group-active:bg-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-gray-700 font-medium">{question}</span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full mt-6 py-4 text-gray-500 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </button>
          </div>
        )}

        {/* VIEW 3: ANSWER VIEW */}
        {currentResponse && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-colors">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Question</p>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{currentQuestion}</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Verified Answer</span>
                </div>

                <div className="prose prose-sm text-gray-700 leading-relaxed space-y-4">
                  {currentResponse.message.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('**') ? 'font-bold text-gray-900 mt-4' : ''}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <span>AI Confidence: {currentResponse.confidence}%</span>
                  <span>Reference: clinical guidelines</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6">
              <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                DISCLAIMER: {currentResponse.disclaimer}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setCurrentResponse(null)}
                className="w-full bg-[#2F80ED] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Browse More Questions
              </button>

              <button
                onClick={() => {
                  setCurrentResponse(null);
                  setSelectedCategory(null);
                }}
                className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold border border-gray-200 transition-all active:scale-[0.98]"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safety Bottom Bar (only shown on main FAQ views) */}
      {!currentResponse && (
        <div className="p-4 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 z-20 transition-colors">
          <p className="text-[10px] text-gray-400 text-center leading-tight">
            These FAQs are for informational purposes only and do not replace professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      )}
    </div>
  );
}
