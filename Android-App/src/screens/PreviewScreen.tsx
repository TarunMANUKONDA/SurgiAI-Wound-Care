import { Screen } from '../types';
import { WoundAnalysisResult, ComparisonResult } from '../services/WoundAnalysisService';

interface PreviewScreenProps {
  onNavigate: (screen: Screen) => void;
  currentImage: string | null;
  previousImage: string | null;
  compareMode: boolean;
  onToggleCompare: () => void;
  analysis?: WoundAnalysisResult | null;
  comparison?: ComparisonResult | null;
}

export function PreviewScreen({
  onNavigate,
  currentImage,
  previousImage,
  compareMode,
  onToggleCompare,
  analysis,
  comparison
}: PreviewScreenProps) {

  const getRednessStatus = () => {
    if (!analysis) return { text: 'Analyzing...', change: '...', color: 'gray' };

    if (comparison) {
      const change = comparison.rednessChange;
      if (change > 10) return { text: 'Redness decreasing', change: `-${change}%`, color: 'green' };
      if (change < -10) return { text: 'Redness increasing', change: `+${Math.abs(change)}%`, color: 'red' };
      return { text: 'Redness stable', change: '~0%', color: 'yellow' };
    }

    if (analysis.rednessLevel > 60) return { text: 'Elevated redness detected', change: `${analysis.rednessLevel}%`, color: 'red' };
    if (analysis.rednessLevel > 40) return { text: 'Moderate redness', change: `${analysis.rednessLevel}%`, color: 'yellow' };
    return { text: 'Normal redness level', change: `${analysis.rednessLevel}%`, color: 'green' };
  };

  const getDischargeStatus = () => {
    if (!analysis) return { text: 'Analyzing...', status: '...', color: 'gray' };

    if (!analysis.dischargeDetected) {
      return { text: 'No discharge detected', status: 'Clear', color: 'green' };
    }

    switch (analysis.dischargeType) {
      case 'clear':
        return { text: 'Serous drainage present', status: 'Monitor', color: 'yellow' };
      case 'yellow':
        return { text: 'Purulent discharge detected', status: 'Warning', color: 'red' };
      case 'green':
        return { text: 'Infection indicators present', status: 'Urgent', color: 'red' };
      default:
        return { text: 'No significant discharge', status: 'Clear', color: 'green' };
    }
  };

  const getHealingEdgeStatus = () => {
    if (!analysis) return { text: 'Analyzing...', status: '...', color: 'gray' };

    if (comparison) {
      const change = comparison.edgeHealingChange;
      if (change > 10) return { text: 'Edge healing improving', status: 'Good', color: 'green' };
      if (change < -10) return { text: 'Edge healing declining', status: 'Monitor', color: 'red' };
      return { text: 'Edges stable', status: 'Stable', color: 'yellow' };
    }

    if (analysis.edgeQuality > 70) return { text: 'Well-approximated edges', status: 'Good', color: 'green' };
    if (analysis.edgeQuality > 50) return { text: 'Edges healing normally', status: 'Normal', color: 'yellow' };
    return { text: 'Edge separation detected', status: 'Monitor', color: 'red' };
  };

  const rednessStatus = getRednessStatus();
  const dischargeStatus = getDischargeStatus();
  const healingEdgeStatus = getHealingEdgeStatus();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-800', subtext: 'text-green-600', badge: 'text-green-600' };
      case 'red': return { bg: 'bg-red-50', icon: 'bg-red-100', text: 'text-red-800', subtext: 'text-red-600', badge: 'text-red-600' };
      case 'yellow': return { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-800', subtext: 'text-yellow-600', badge: 'text-yellow-600' };
      default: return { bg: 'bg-gray-50', icon: 'bg-gray-100', text: 'text-gray-800', subtext: 'text-gray-600', badge: 'text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('questions')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Image Preview</h1>
          <p className="text-sm text-gray-500">Review and compare</p>
        </div>
      </div>

      {/* Compare Toggle */}
      {previousImage && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Compare with last scan</span>
            <button
              onClick={onToggleCompare}
              className={`w-14 h-8 rounded-full transition-colors ${compareMode ? 'bg-[#2F80ED]' : 'bg-gray-300'
                }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${compareMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Image Display */}
      {compareMode && previousImage ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-md">
            <p className="text-sm font-medium text-gray-500 mb-2">Previous</p>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img src={previousImage} alt="Previous wound" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {comparison ? `${comparison.daysSinceLastScan} days ago` : 'Previous scan'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-md">
            <p className="text-sm font-medium text-gray-500 mb-2">Current</p>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {currentImage ? (
                <img src={currentImage} alt="Current wound" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Today</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <p className="text-sm font-medium text-gray-500 mb-2">Current Image</p>
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
            {currentImage ? (
              <>
                <img src={currentImage} alt="Current wound" className="w-full h-full object-cover" />
                {analysis?.woundLocation && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/10 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-start justify-start"
                    style={{
                      top: `${analysis.woundLocation[0] / 10}%`,
                      left: `${analysis.woundLocation[1] / 10}%`,
                      width: `${(analysis.woundLocation[3] - analysis.woundLocation[1]) / 10}%`,
                      height: `${(analysis.woundLocation[2] - analysis.woundLocation[0]) / 10}%`,
                    }}
                  >
                    <div className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-br-lg font-bold uppercase tracking-wider">
                      Wound Area
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image uploaded
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Trend (if comparison available) */}
      {comparison && (
        <div className={`rounded-2xl p-4 shadow-md mb-4 ${comparison.overallTrend === 'improving' ? 'bg-green-50 border border-green-200' :
          comparison.overallTrend === 'declining' ? 'bg-red-50 border border-red-200' :
            comparison.overallTrend === 'critical' ? 'bg-red-100 border border-red-300' :
              'bg-yellow-50 border border-yellow-200'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${comparison.overallTrend === 'improving' ? 'bg-green-200' :
              comparison.overallTrend === 'declining' ? 'bg-red-200' :
                comparison.overallTrend === 'critical' ? 'bg-red-300' :
                  'bg-yellow-200'
              }`}>
              {comparison.overallTrend === 'improving' ? (
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : comparison.overallTrend === 'declining' || comparison.overallTrend === 'critical' ? (
                <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${comparison.overallTrend === 'improving' ? 'text-green-800' :
                comparison.overallTrend === 'declining' || comparison.overallTrend === 'critical' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                {comparison.overallTrend === 'improving' ? 'Healing Progress Detected' :
                  comparison.overallTrend === 'declining' ? 'Healing Has Slowed' :
                    comparison.overallTrend === 'critical' ? 'Urgent Attention Needed' :
                      'Wound Status Stable'}
              </p>
              <p className={`text-sm ${comparison.overallTrend === 'improving' ? 'text-green-600' :
                comparison.overallTrend === 'declining' || comparison.overallTrend === 'critical' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                Healing rate: {comparison.healingRate}% of expected
              </p>
            </div>
            <div className={`text-2xl font-bold ${comparison.improvement > 0 ? 'text-green-600' :
              comparison.improvement < 0 ? 'text-red-600' : 'text-yellow-600'
              }`}>
              {comparison.improvement > 0 ? '+' : ''}{comparison.improvement}%
            </div>
          </div>
        </div>
      )}

      {/* Difference Highlights */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">AI Detection Analysis</h3>
        <div className="space-y-3">
          {/* Redness */}
          {(() => {
            const colors = getColorClasses(rednessStatus.color);
            return (
              <div className={`flex items-center gap-3 p-3 ${colors.bg} rounded-xl`}>
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${colors.badge}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${colors.text}`}>Red Area Detection</p>
                  <p className={`text-sm ${colors.subtext}`}>{rednessStatus.text}</p>
                </div>
                <span className={`text-sm font-bold ${colors.badge}`}>{rednessStatus.change}</span>
              </div>
            );
          })()}

          {/* Discharge */}
          {(() => {
            const colors = getColorClasses(dischargeStatus.color);
            return (
              <div className={`flex items-center gap-3 p-3 ${colors.bg} rounded-xl`}>
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${colors.badge}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${colors.text}`}>Discharge Detection</p>
                  <p className={`text-sm ${colors.subtext}`}>{dischargeStatus.text}</p>
                </div>
                <span className={`text-sm font-bold ${colors.badge}`}>{dischargeStatus.status}</span>
              </div>
            );
          })()}

          {/* Healing Edge */}
          {(() => {
            const colors = getColorClasses(healingEdgeStatus.color);
            return (
              <div className={`flex items-center gap-3 p-3 ${colors.bg} rounded-xl`}>
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${colors.badge}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${colors.text}`}>Healing Edge</p>
                  <p className={`text-sm ${colors.subtext}`}>{healingEdgeStatus.text}</p>
                </div>
                <span className={`text-sm font-bold ${colors.badge}`}>{healingEdgeStatus.status}</span>
              </div>
            );
          })()}
        </div>

        {/* Detected Features */}
        {analysis && analysis.detectedFeatures.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Detected Features:</p>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedFeatures.map((feature, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tissue Composition */}
      {analysis && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Tissue Composition Analysis</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-20">Pink (Healthy)</span>
              <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-pink-400 h-full rounded-full transition-all"
                  style={{ width: `${analysis.tissueColor.pink}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-12 text-right">{analysis.tissueColor.pink}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-20">Red (Active)</span>
              <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-red-400 h-full rounded-full transition-all"
                  style={{ width: `${analysis.tissueColor.red}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-12 text-right">{analysis.tissueColor.red}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-20">Yellow (Slough)</span>
              <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all"
                  style={{ width: `${analysis.tissueColor.yellow + (analysis.tissueColor.white || 0)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {analysis.tissueColor.yellow + (analysis.tissueColor.white || 0)}%
              </span>
            </div>
            {analysis.tissueColor.black > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-20">Black (Necrotic)</span>
                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gray-800 h-full rounded-full transition-all"
                    style={{ width: `${analysis.tissueColor.black}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">{analysis.tissueColor.black}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Healing Score Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-blue-800 font-semibold text-lg">Wound Healing Score:</span>
            <p className="text-blue-600 text-xs mt-0.5">Unified AI progress metric</p>
          </div>
          <div className="text-right">
            <span className="text-blue-800 text-3xl font-bold">{analysis?.healingScore || 0}%</span>
          </div>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 font-medium">AI confidence:</span>
          <span className="text-blue-800 font-bold">{analysis?.confidence || 87}%</span>
        </div>
        {comparison && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
            <span className="text-blue-700 text-sm">Next suggested scan:</span>
            <span className="text-blue-700 text-sm font-medium">{comparison.nextScanRecommendation}</span>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {analysis?.backendResults?.recommendation && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4 border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI Care Recommendations
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">Summary:</p>
              <p className="text-sm text-gray-700">{analysis.backendResults.recommendation.summary}</p>
            </div>
            {analysis.backendResults.recommendation.cleaning_instructions?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">Cleaning:</p>
                <p className="text-sm text-gray-700">
                  {analysis.backendResults.recommendation.cleaning_instructions[0]}
                </p>
              </div>
            )}
            {analysis.backendResults.recommendation.dressing_recommendations?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">Dressing:</p>
                <p className="text-sm text-gray-700">
                  {analysis.backendResults.recommendation.dressing_recommendations[0]}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('advice')}
            className="mt-4 w-full py-2 text-sm font-medium text-[#2F80ED] border border-[#2F80ED] rounded-xl hover:bg-blue-50 transition-colors"
          >
            View Full Detailed Plan
          </button>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={() => onNavigate('advice')}
        className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3"
      >
        View Care Advice
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
