import { Screen, PatientAnswers } from '../types';
import { WoundAnalysisResult, CareRecommendation } from '../services/WoundAnalysisService';

interface CareAdviceScreenProps {
  onNavigate: (screen: Screen) => void;
  patientAnswers: PatientAnswers | null;
  onSaveToHistory: () => void;
  analysis?: WoundAnalysisResult | null;
  recommendations?: CareRecommendation[];
}

export function CareAdviceScreen({ 
  onNavigate, 
  patientAnswers, 
  onSaveToHistory,
  analysis,
  recommendations = []
}: CareAdviceScreenProps) {
  // Determine risk level based on analysis or answers
  const getRiskLevel = () => {
    if (analysis) {
      return analysis.riskLevel;
    }
    
    const hasInfectionSigns = patientAnswers?.discharge === 'yellow' || 
                              patientAnswers?.discharge === 'green' || 
                              patientAnswers?.fever || 
                              patientAnswers?.rednessSpread;
    return hasInfectionSigns ? 'warning' : 'normal';
  };

  const riskLevel = getRiskLevel();

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'normal':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          badgeBg: 'bg-green-200 text-green-800',
          textColor: 'text-green-800',
          label: 'LOW RISK',
          message: 'Wound appears to be healing normally'
        };
      case 'warning':
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badgeBg: 'bg-orange-200 text-orange-800',
          textColor: 'text-orange-800',
          label: 'MONITOR CLOSELY',
          message: 'Some signs require monitoring - follow care guidelines closely'
        };
      case 'infected':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-200 text-red-800',
          textColor: 'text-red-800',
          label: 'INFECTION SIGNS',
          message: 'Signs of possible infection detected - consider medical consultation'
        };
      case 'critical':
        return {
          bgColor: 'bg-red-100 border-red-300',
          iconBg: 'bg-red-200',
          iconColor: 'text-red-700',
          badgeBg: 'bg-red-300 text-red-900',
          textColor: 'text-red-900',
          label: 'URGENT',
          message: 'Seek immediate medical attention'
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-200 text-gray-800',
          textColor: 'text-gray-800',
          label: 'UNKNOWN',
          message: 'Unable to determine risk level'
        };
    }
  };

  const riskConfig = getRiskConfig();

  const handleSaveAndGoHome = () => {
    onSaveToHistory();
    onNavigate('home');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Wound Cleaning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'Wound Dressing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'Nutrition':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'Pain Management':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Warning Signs':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'Activity & Rest':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get next scan time based on analysis
  const getNextScanTime = () => {
    if (analysis) {
      switch (analysis.riskLevel) {
        case 'critical': return 'Immediately after medical consultation';
        case 'infected': return '12 hours';
        case 'warning': return '12-24 hours';
        default: return '24 hours';
      }
    }
    return '24 hours';
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('progress')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">AI Care Advice</h1>
          <p className="text-sm text-gray-500">Personalized recommendations</p>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`rounded-2xl p-4 mb-4 border ${riskConfig.bgColor}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riskConfig.iconBg}`}>
            {riskLevel === 'normal' ? (
              <svg className={`w-6 h-6 ${riskConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${riskConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${riskConfig.badgeBg}`}>
              {riskConfig.label}
            </span>
            <p className={`mt-1 font-medium ${riskConfig.textColor}`}>
              {riskConfig.message}
            </p>
          </div>
        </div>
      </div>

      {/* Current Condition Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Current Condition Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Days post-surgery</span>
            <span className="font-medium">{patientAnswers?.daysSinceSurgery || 5} days</span>
          </div>
          {analysis && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Healing Stage</span>
                <span className="font-medium capitalize">{analysis.healingStage}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Overall Health Score</span>
                <span className={`font-medium ${
                  analysis.overallHealth > 70 ? 'text-green-600' :
                  analysis.overallHealth > 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>{analysis.overallHealth}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Redness Level</span>
                <span className={`font-medium ${
                  analysis.rednessLevel > 60 ? 'text-red-600' :
                  analysis.rednessLevel > 40 ? 'text-yellow-600' : 'text-green-600'
                }`}>{analysis.rednessLevel}%</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Pain level</span>
            <span className={`font-medium ${patientAnswers?.painLevel === 'severe' ? 'text-red-600' : ''}`}>
              {patientAnswers?.painLevel || 'Mild'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Discharge</span>
            <span className={`font-medium ${
              patientAnswers?.discharge === 'yellow' || patientAnswers?.discharge === 'green' 
                ? 'text-red-600' : ''
            }`}>
              {analysis?.dischargeDetected ? `${analysis.dischargeType} (AI detected)` : (patientAnswers?.discharge || 'None')}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">AI Confidence</span>
            <span className="font-medium text-[#2F80ED]">{analysis?.confidence || 87}%</span>
          </div>
        </div>
      </div>

      {/* AI-Generated Care Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-gray-800">Personalized Care Guidelines</h3>
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  rec.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                  rec.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getCategoryIcon(rec.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
              </div>
              
              {rec.frequency && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-blue-700 font-medium">Frequency: {rec.frequency}</span>
                </div>
              )}
              
              <div className="space-y-1">
                {rec.steps.slice(0, 5).map((step, stepIdx) => (
                  <div key={stepIdx} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 flex-shrink-0 mt-0.5">
                      {stepIdx + 1}
                    </span>
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              {rec.warnings.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
                  {rec.warnings.map((warning, warnIdx) => (
                    <p key={warnIdx} className="text-sm text-red-700">{warning}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Default Care Guidelines if no recommendations generated */
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Care Guidelines</h3>
          
          {/* Cleaning Method */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Cleaning Method</span>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Gently clean with sterile saline solution. Pat dry with clean gauze. Avoid rubbing or scrubbing the wound area.
            </p>
          </div>

          {/* Dressing Frequency */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Dressing Frequency</span>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Change dressing once daily or when wet/soiled. Use sterile, non-adherent dressing appropriate for wound stage.
            </p>
          </div>

          {/* Nutrition Tips */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Nutrition Tips</span>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Increase protein intake (lean meats, eggs, legumes). Stay hydrated. Consider vitamin C and zinc supplements for healing support.
            </p>
          </div>

          {/* Warning Signs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Warning Signs</span>
            </div>
            <ul className="text-sm text-gray-600 ml-10 list-disc list-inside space-y-1">
              <li>Increasing redness or spreading</li>
              <li>Yellow or green discharge</li>
              <li>Fever above 38°C (100.4°F)</li>
              <li>Increased pain or swelling</li>
              <li>Foul odor from wound</li>
            </ul>
          </div>
        </div>
      )}

      {/* AI Detected Features */}
      {analysis && analysis.detectedFeatures.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">AI Detected Features</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.detectedFeatures.map((feature, idx) => (
              <span 
                key={idx} 
                className={`text-xs px-3 py-1.5 rounded-full ${
                  feature.toLowerCase().includes('healthy') || feature.toLowerCase().includes('good') 
                    ? 'bg-green-100 text-green-700'
                    : feature.toLowerCase().includes('warning') || feature.toLowerCase().includes('elevated')
                    ? 'bg-yellow-100 text-yellow-700'
                    : feature.toLowerCase().includes('infection') || feature.toLowerCase().includes('necrotic')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Scan Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[#2F80ED] font-medium">Next suggested scan: {getNextScanTime()}</span>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">
            Not a medical diagnosis. For emergencies consult a doctor immediately.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSaveAndGoHome}
          className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-200"
        >
          Save & Return Home
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className="w-full bg-white hover:bg-gray-50 text-[#2F80ED] py-4 px-6 rounded-2xl font-medium border border-gray-200 transition-all duration-200"
        >
          Ask AI Assistant
        </button>
      </div>
    </div>
  );
}
