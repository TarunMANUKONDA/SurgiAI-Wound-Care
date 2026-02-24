import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { Screen, WoundImage } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import { backendAPI } from '../services/BackendAPIService';
import { woundAnalysisService } from '../services/WoundAnalysisService';

interface WoundProgressScreenProps {
  onNavigate: (screen: Screen) => void;
  onGoBack: () => void;
  woundHistory: WoundImage[];
  onAddNewScan: (image: WoundImage) => void;
  selectedWound?: WoundImage | null;
}

// stageOrder removed due to non-use

export function WoundProgressScreen({ onNavigate, onGoBack, woundHistory, onAddNewScan }: WoundProgressScreenProps) {
  const {
    isAnalyzing,
    analyzeImage,
    compareWithPrevious,
    compareWithSpecificWound,
    woundHistory: contextHistory,
    addWoundToHistory,
    currentCase
  } = useAnalysis();
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedWoundForDetail, setSelectedWoundForDetail] = useState<WoundImage | null>(null);
  const [showWoundDetailModal, setShowWoundDetailModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use context history if available, otherwise use props
  const actualHistory = contextHistory.length > 0 ? contextHistory.map(w => ({
    id: w.id,
    url: w.imageData,
    date: new Date(w.timestamp),
    status: w.analysis.riskLevel as any,
    healingStage: w.analysis.healingStage,
    analysis: w.analysis,
  })) : woundHistory;

  // Sort history by date (newest first)
  const sortedHistory = useMemo(() => {
    if (!actualHistory || actualHistory.length === 0) return [];
    return [...actualHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [actualHistory]);

  // Initialize comparison indices when history changes
  useMemo(() => {
    if (sortedHistory.length >= 2) {
      setBeforeIndex(sortedHistory.length - 1); // oldest
      setAfterIndex(0); // newest
    }
  }, [sortedHistory.length]);

  // Get current healing score (Unified)
  const currentScore = sortedHistory.length > 0 ? (
    sortedHistory[0].analysis?.healingScore ||
    (sortedHistory[0].analysis ? woundAnalysisService.calculateHealingScore(
      sortedHistory[0].analysis.rednessLevel,
      sortedHistory[0].analysis.swellingLevel,
      sortedHistory[0].analysis.edgeQuality,
      sortedHistory[0].analysis.tissueColor,
      sortedHistory[0].analysis.dischargeType
    ) : 0)
  ) : 0;

  // Calculate improvement accurately
  const firstScan = sortedHistory[sortedHistory.length - 1];
  const firstScore = sortedHistory.length > 0 ? (
    firstScan.analysis?.healingScore ||
    (firstScan.analysis ? woundAnalysisService.calculateHealingScore(
      firstScan.analysis.rednessLevel,
      firstScan.analysis.swellingLevel,
      firstScan.analysis.edgeQuality,
      firstScan.analysis.tissueColor,
      firstScan.analysis.dischargeType
    ) : 0)
  ) : 0;
  const improvement = currentScore - firstScore;

  // Generate chart data using unified score
  const chartData = useMemo(() => {
    if (!sortedHistory || sortedHistory.length === 0) return [];

    const chronologicalHistory = [...sortedHistory].reverse();

    return chronologicalHistory.map((scan) => {
      const score = scan.analysis?.healingScore ||
        (scan.analysis ? woundAnalysisService.calculateHealingScore(
          scan.analysis.rednessLevel,
          scan.analysis.swellingLevel,
          scan.analysis.edgeQuality,
          scan.analysis.tissueColor,
          scan.analysis.dischargeType
        ) : 0);
      return {
        date: new Date(scan.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        healingScore: Math.min(100, Math.max(0, score)),
      };
    });
  }, [sortedHistory]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusMessage = (scan: any): string => {
    if (scan.analysis?.statusLabel) return scan.analysis.statusLabel;
    const score = scan.analysis?.healingScore || 0;
    if (score >= 85) return 'Healing excellently — keep it up!';
    if (score >= 70) return 'Healing well — maintain your routine';
    if (score >= 55) return 'Stable — continue treatment as directed';
    if (score >= 40) return 'Needs monitoring — review care steps';
    if (score >= 25) return 'Stalled — consider medical consultation';
    return 'At risk — seek medical attention';
  };

  const handleCompareAnalyze = async () => {
    const beforeScan = sortedHistory[beforeIndex];
    const afterScan = sortedHistory[afterIndex];

    if (beforeScan && afterScan) {
      // Use async comparison (tries backend Gemini first, falls back to local)
      const comparison = await compareWithSpecificWound(beforeScan.id, afterScan.id);

      if (comparison) {
        setComparisonData(comparison);
        setShowComparisonModal(true);

        // Save the comparison result to backend
        if (currentCase) {
          try {
            await backendAPI.saveComparison(
              currentCase.id.toString(),
              beforeScan.id,
              afterScan.id,
              comparison
            );
            console.log("Comparison saved successfully");
          } catch (err) {
            console.error("Failed to save comparison", err);
          }
        }
      }
    }
  };


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        setUploadedImageUrl(imageUrl);
        setShowUploadModal(true);
        setAnalysisComplete(false);

        if (!currentCase) {
          alert("Error: No case selected. Please go back and select a case.");
          setAnalysisComplete(false);
          setShowUploadModal(false);
          return;
        }

        try {
          // 1. Analyze and Upload (simultaneously via service)
          // Passing caseId ensures the upload is linked to the current case
          // The service also handles saving the analysis to the backend
          const analysis = await analyzeImage(imageUrl, currentCase?.id);

          let backendWoundId = Date.now().toString(); // Fallback

          // Extract wound_id from backend results if available
          if (analysis.backendResults?.upload?.wound_id) {
            backendWoundId = analysis.backendResults.upload.wound_id.toString();
          }

          // 3. Compare with most recent scan if available
          let comparison = null;
          if (sortedHistory.length > 0) {
            // Use local comparison for immediate feedback
            comparison = compareWithPrevious(analysis);
          }

          setComparisonData(comparison);
          setAnalysisComplete(true);

          // Define patient answers
          const answers = {
            daysSinceSurgery: 0,
            painLevel: 'none' as const,
            dischargeType: 'no' as const,
            hasFever: false,
            rednessSpread: false,
            dressingChanged: true,
          };

          // 4. Save to history (updates local state)
          // We assume addWoundToHistory handles linking to case based on context
          addWoundToHistory(imageUrl, analysis, answers, comparison);

          // Create and add the new scan
          const newScan: WoundImage = {
            id: backendWoundId,
            caseId: currentCase?.id,
            url: imageUrl,
            date: new Date(),
            status: analysis.riskLevel as any,
            healingStage: analysis.healingStage,
            analysis: analysis,
          };

          onAddNewScan(newScan);
        } catch (error) {
          console.error('Error analyzing image:', error);
          alert("Failed to upload/analyze image. Please checking your connection and try again.");
          setAnalysisComplete(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadReport = () => {
    if (!currentCase || sortedHistory.length === 0) return;

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wound Progress Report - ${currentCase.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #f9fbff; }
          .container { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          h1 { color: #8B5CF6; font-size: 2.25rem; margin-bottom: 0.5rem; }
          .case-header { border-bottom: 2px solid #f3f4f6; margin-bottom: 2rem; padding-bottom: 1.5rem; }
          .case-title { font-size: 1.5rem; font-weight: 700; color: #111827; }
          .case-meta { color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
          .summary-box { background: #8B5CF6; color: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
          .summary-metric { text-align: center; flex: 1; }
          .summary-label { font-size: 0.75rem; text-transform: uppercase; opacity: 0.9; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
          .summary-value { font-size: 1.5rem; font-weight: 700; }
          .section-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem; }
          .scan-card { background: white; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; }
          .scan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .scan-date { font-weight: 600; color: #4b5563; }
          .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: white; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .metric-item { background: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; text-align: center; }
          .metric-label { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; }
          .metric-value { font-size: 1rem; font-weight: 600; color: #111827; }
          .rec-box { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; font-size: 0.875rem; color: #4b5563; }
          @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="case-header">
            <h1>Wound Care Progress</h1>
            <div class="case-title">${currentCase.name}</div>
            <div class="case-meta">Case ID: ${currentCase.id} • Started: ${new Date(currentCase.createdAt).toLocaleDateString()}</div>
          </div>

          <div class="summary-box">
             <div class="summary-metric">
                <div class="summary-label">Current Score</div>
                <div class="summary-value">${currentScore}%</div>
             </div>
             <div class="summary-metric">
                <div class="summary-label">Total Scans</div>
                <div class="summary-value">${sortedHistory.length}</div>
             </div>
             <div class="summary-metric">
                <div class="summary-label">Healing Progress</div>
                <div class="summary-value">${improvement > 0 ? '+' : ''}${improvement}%</div>
             </div>
          </div>

          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem;">
            ${currentCase.description || 'No additional case description provided.'}
          </p>

          <div class="section-title">Timeline & Detailed Analysis</div>
          
          ${sortedHistory.map((scan) => `
            <div class="scan-card">
              <div class="scan-header">
                <div class="scan-date">${new Date(scan.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div class="status-badge" style="background: ${scan.analysis?.statusColor || '#27AE60'}">
                  ${scan.analysis?.statusLabel || 'Healthy'}
                </div>
              </div>
              <div class="metric-grid">
                <div class="metric-item">
                  <div class="metric-label">Healing Score</div>
                  <div class="metric-value">${scan.analysis?.healingScore || 0}%</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">Redness</div>
                  <div class="metric-value">${scan.analysis?.rednessLevel || 0}/10</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">Swelling</div>
                  <div class="metric-value">${scan.analysis?.swellingLevel || 0}/10</div>
                </div>
              </div>
              ${scan.analysis?.backendResults?.recommendation ? `
                <div class="rec-box">
                  <strong>Recommendation:</strong> ${scan.analysis.backendResults.recommendation}
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div style="margin-top: 4rem; text-align: center; color: #9ca3af; font-size: 0.75rem;">
            Generated by WoundCare AI on ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WoundReport_${currentCase.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Empty state
  if (!woundHistory || woundHistory.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] p-4">
        <div className="flex items-center gap-4 pt-4 pb-6">
          <button
            onClick={onGoBack}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2F80ED] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Wound History</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Wound Scans Yet</h2>
          <p className="text-gray-500 text-center mb-6 max-w-xs">
            Upload your first wound image to start tracking your healing progress.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture First Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={onGoBack}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2F80ED] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{currentCase ? currentCase.name : 'Wound History'}</h1>
            {currentCase && <p className="text-sm text-gray-500">Case #{currentCase.id}</p>}
          </div>
        </div>
        {currentCase && sortedHistory.length > 0 && (
          <button
            onClick={handleDownloadReport}
            className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-[#8B5CF6] font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Report</span>
          </button>
        )}
      </div>

      {/* Healing Status Card */}
      <div
        className="bg-white rounded-2xl p-4 shadow-sm mb-4 border-l-4 transition-colors"
        style={{ borderLeftColor: sortedHistory[0]?.analysis?.statusColor || '#27AE60' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: sortedHistory[0]?.analysis?.statusColor || '#27AE60' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold text-lg"
                  style={{ color: sortedHistory[0]?.analysis?.statusColor || '#27AE60' }}
                >
                  {sortedHistory[0]?.analysis?.statusLabel || 'Healing'}
                </span>
                {improvement > 0 && (
                  <span className="bg-[#27AE60] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    +{improvement}%
                  </span>
                )}
                {improvement < 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {improvement}%
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {sortedHistory[0]?.analysis?.riskLevel === 'critical'
                  ? 'Urgent medical attention may be needed.'
                  : sortedHistory[0]?.analysis?.riskLevel === 'infected'
                    ? 'Possible signs of infection detected.'
                    : improvement > 0
                      ? 'Your wound is showing improvement!'
                      : 'Maintain your current care routine.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-3xl font-bold"
              style={{ color: sortedHistory[0]?.analysis?.statusColor || '#27AE60' }}
            >
              {currentScore}%
            </div>
            <p className="text-gray-400 text-xs">Current Score</p>
          </div>
        </div>
      </div>
      {/* Score Grading Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm">Progress Score Guide</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { range: '85–100', label: 'Excellent', color: '#27AE60' },
            { range: '70–84', label: 'Healing Well', color: '#219653' },
            { range: '55–69', label: 'Stable', color: '#2F80ED' },
            { range: '40–54', label: 'Monitor', color: '#F2C94C' },
            { range: '25–39', label: 'Stalled', color: '#F2994A' },
            { range: '0–24', label: 'At Risk', color: '#EB5757' },
          ].map(band => (
            <div
              key={band.range}
              className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-2"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: band.color }} />
              <div>
                <div className="text-xs font-semibold text-gray-700">{band.range}%</div>
                <div className="text-xs text-gray-400">{band.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healing Progress Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Healing Progress</h2>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Healing Score %</span>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  stroke="#E5E7EB"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  stroke="#E5E7EB"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? [`${value}%`, 'Healing Score'] : ['', '']}
                />
                <Area
                  type="monotone"
                  dataKey="healingScore"
                  stroke="none"
                  fill="url(#healingGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="healingScore"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Capture New Image Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-4 rounded-2xl font-medium shadow-lg flex items-center justify-center gap-3 mb-4"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Capture New Image
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image History */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-800">Image History</h2>
          <p className="text-gray-400 text-sm">{sortedHistory.length} captures</p>
        </div>

        <div className="space-y-3">
          {sortedHistory.map((scan, index) => {
            const score = scan.analysis?.healingScore ||
              (scan.analysis ? woundAnalysisService.calculateHealingScore(
                scan.analysis.rednessLevel,
                scan.analysis.swellingLevel,
                scan.analysis.edgeQuality,
                scan.analysis.tissueColor,
                scan.analysis.dischargeType
              ) : 0);

            return (
              <div
                key={scan.id}
                onClick={() => {
                  setSelectedWoundForDetail(scan);
                  setShowWoundDetailModal(true);
                }}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {/* Image with number badge */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img src={scan.url} alt={`Scan ${sortedHistory.length - index}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#27AE60] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{sortedHistory.length - index}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(scan.date)} • {formatTime(scan.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold" style={{ color: scan.analysis?.statusColor || '#gray-500' }}>
                      {score}% <span className="font-normal text-gray-500">Healing Score</span>
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 text-sm">
                      {scan.analysis?.statusLabel || 'Analyzed'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{getStatusMessage(scan)}</p>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Comparison Section */}
      {sortedHistory.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-800">AI Comparison</h2>
            <p className="text-gray-400 text-sm">Compare two images to analyze progress</p>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-500 text-sm mb-2 block">Before (Old)</label>
              <select
                value={beforeIndex}
                onChange={(e) => setBeforeIndex(Number(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              >
                {sortedHistory.map((scan, index) => (
                  <option key={scan.id} value={index}>
                    #{sortedHistory.length - index} - {formatDate(scan.date)} ({scan.analysis?.healingScore || 0}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-2 block">After (New)</label>
              <select
                value={afterIndex}
                onChange={(e) => setAfterIndex(Number(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              >
                {sortedHistory.map((scan, index) => (
                  <option key={scan.id} value={index}>
                    #{sortedHistory.length - index} - {formatDate(scan.date)} ({scan.analysis?.healingScore || 0}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={sortedHistory[beforeIndex].url}
                alt="Before"
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-white text-sm font-medium">
                  Before: {sortedHistory[beforeIndex].analysis?.healingScore || 0}%
                </span>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={sortedHistory[afterIndex].url}
                alt="After"
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-white text-sm font-medium">
                  After: {sortedHistory[afterIndex].analysis?.healingScore || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompareAnalyze}
            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-4 rounded-2xl font-medium shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare & Analyze
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">New Scan Analysis</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImageUrl(null);
                  setAnalysisComplete(false);
                  setComparisonData(null);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Image */}
            {uploadedImageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img src={uploadedImageUrl} alt="New scan" className="w-full h-48 object-cover" />
              </div>
            )}

            {/* Analyzing State */}
            {isAnalyzing && !analysisComplete && (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="w-16 h-16 text-[#8B5CF6] animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-700 font-medium mb-2">Analyzing wound...</p>
                <p className="text-gray-500 text-sm">AI is processing your image</p>
              </div>
            )}

            {/* Analysis Complete */}
            {analysisComplete && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-green-800">Analysis Complete!</h3>
                  </div>
                  <p className="text-sm text-green-700">Your new scan has been analyzed and saved.</p>
                </div>

                {/* Comparison Results */}
                {comparisonData && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Comparison with Previous Scan</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Redness Level</span>
                        <span className={`text-sm font-medium ${comparisonData.rednessChange > 0 ? 'text-green-600' :
                          comparisonData.rednessChange < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {comparisonData.rednessChange > 0 ? '↓' : comparisonData.rednessChange < 0 ? '↑' : '—'}
                          {' '}{Math.abs(comparisonData.rednessChange || 0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wound Size</span>
                        <span className={`text-sm font-medium ${comparisonData.sizeChange > 0 ? 'text-red-600' :
                          comparisonData.sizeChange < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                          {comparisonData.sizeChange > 0 ? '↑' : comparisonData.sizeChange < 0 ? '↓' : '—'}
                          {' '}{Math.abs(comparisonData.sizeChange || 0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Healing Edge</span>
                        <span className={`text-sm font-medium ${comparisonData.edgeHealingChange > 0 ? 'text-green-600' :
                          comparisonData.edgeHealingChange < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {comparisonData.edgeHealingChange > 0 ? '↑' : comparisonData.edgeHealingChange < 0 ? '↓' : '—'}
                          {' '}{comparisonData.edgeHealingChange > 0 ? 'Improving' : comparisonData.edgeHealingChange < 0 ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className={`text-lg font-bold ${comparisonData.improvement > 0 ? 'text-green-600' :
                            comparisonData.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {comparisonData.improvement > 0 ? '+' : ''}{comparisonData.improvement || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedImageUrl(null);
                    setAnalysisComplete(false);
                    setComparisonData(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-3 rounded-xl font-medium shadow-lg"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Results Modal */}
      {showComparisonModal && comparisonData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Comparison Analysis</h2>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Before and After Images */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Before</p>
                <img
                  src={sortedHistory[beforeIndex]?.url}
                  alt="Before"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(sortedHistory[beforeIndex]?.date)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">After</p>
                <img
                  src={sortedHistory[afterIndex]?.url}
                  alt="After"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(sortedHistory[afterIndex]?.date)}
                </p>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Comparison Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Redness Level</span>
                  <span className={`text-sm font-medium ${comparisonData.rednessChange > 0 ? 'text-green-600' :
                    comparisonData.rednessChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {comparisonData.rednessChange > 0 ? '↓' : comparisonData.rednessChange < 0 ? '↑' : '—'}
                    {' '}{Math.abs(comparisonData.rednessChange || 0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wound Size</span>
                  <span className={`text-sm font-medium ${comparisonData.sizeChange > 0 ? 'text-red-600' :
                    comparisonData.sizeChange < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                    {comparisonData.sizeChange > 0 ? '↑' : comparisonData.sizeChange < 0 ? '↓' : '—'}
                    {' '}{Math.abs(comparisonData.sizeChange || 0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Healing Edge</span>
                  <span className={`text-sm font-medium ${comparisonData.edgeHealingChange > 0 ? 'text-green-600' :
                    comparisonData.edgeHealingChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {comparisonData.edgeHealingChange > 0 ? '↑' : comparisonData.edgeHealingChange < 0 ? '↓' : '—'}
                    {' '}{comparisonData.edgeHealingChange > 0 ? 'Improving' : comparisonData.edgeHealingChange < 0 ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className={`rounded-xl p-4 mb-4 ${comparisonData.improvement > 0 ? 'bg-green-50 border-green-200' :
              comparisonData.improvement < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              } border`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className={`text-2xl font-bold ${comparisonData.improvement > 0 ? 'text-green-600' :
                  comparisonData.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  {comparisonData.improvement > 0 ? '+' : ''}{comparisonData.improvement || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {comparisonData.improvement > 0 ? 'Your wound is healing well!' :
                  comparisonData.improvement < 0 ? 'Wound condition has declined. Consider consulting a doctor.' :
                    'Wound condition is stable.'}
              </p>
            </div>

            <button
              onClick={() => setShowComparisonModal(false)}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-3 rounded-xl font-medium shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Wound Detail Modal */}
      {showWoundDetailModal && selectedWoundForDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowWoundDetailModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Wound Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(selectedWoundForDetail.date)} •  {formatTime(selectedWoundForDetail.date)}</p>
                </div>
                <button onClick={() => setShowWoundDetailModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mb-6 rounded-xl overflow-hidden"><img src={selectedWoundForDetail.url} alt="Wound detail" className="w-full h-64 object-cover" /></div>
              {selectedWoundForDetail.analysis && (
                <div className="space-y-4">
                  {selectedWoundForDetail.analysis.backendResults?.classification && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm text-gray-600 mb-1">Classification</p><p className="text-xl font-semibold text-gray-800">{selectedWoundForDetail.analysis.backendResults.classification.wound_type}</p></div>
                        {selectedWoundForDetail.analysis.confidence !== undefined && (
                          <div className="text-right"><p className="text-sm text-gray-600 mb-1">Confidence</p><div className="text-2xl font-bold text-[#8B5CF6]">{Math.round(selectedWoundForDetail.analysis.confidence)}%</div></div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Analysis Results</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedWoundForDetail.analysis.rednessLevel !== undefined && (
                        <div className="bg-gray-50 rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg><p className="text-xs font-medium text-gray-600">Redness Level</p></div><p className="text-lg font-bold text-gray-800">{selectedWoundForDetail.analysis.rednessLevel}%</p></div>
                      )}
                      {selectedWoundForDetail.analysis.edgeQuality !== undefined && (
                        <div className="bg-gray-50 rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><p className="text-xs font-medium text-gray-600">Edge Quality</p></div><p className="text-lg font-bold text-gray-800">{selectedWoundForDetail.analysis.edgeQuality}%</p></div>
                      )}
                      {selectedWoundForDetail.analysis.dischargeDetected !== undefined && (
                        <div className="bg-gray-50 rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg><p className="text-xs font-medium text-gray-600">Discharge</p></div><p className="text-lg font-bold text-gray-800">{selectedWoundForDetail.analysis.dischargeDetected ? 'Detected' : 'None'}</p>{selectedWoundForDetail.analysis.dischargeType && (<p className="text-xs text-gray-500 mt-1">Type: {selectedWoundForDetail.analysis.dischargeType}</p>)}</div>
                      )}
                      {selectedWoundForDetail.analysis.overallHealth !== undefined && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-medium text-gray-600">Healing Score</p>
                          </div>
                          <p className="text-lg font-bold text-gray-800">{selectedWoundForDetail.analysis.overallHealth}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedWoundForDetail.analysis.backendResults?.recommendation && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3"><svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg><h3 className="font-semibold text-green-900">AI Recommendations</h3></div>
                      {selectedWoundForDetail.analysis.backendResults.recommendation.summary && <div className="mb-4"><p className="text-sm text-green-800 leading-relaxed">{selectedWoundForDetail.analysis.backendResults.recommendation.summary}</p></div>}
                      {selectedWoundForDetail.analysis.backendResults.recommendation.cleaning_instructions && <div className="mb-4"><h4 className="font-medium text-green-900 text-sm mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>Cleaning Instructions</h4><ul className="space-y-1.5 ml-6">{(Array.isArray(selectedWoundForDetail.analysis.backendResults.recommendation.cleaning_instructions) ? selectedWoundForDetail.analysis.backendResults.recommendation.cleaning_instructions : [selectedWoundForDetail.analysis.backendResults.recommendation.cleaning_instructions]).map((instruction: any, idx: number) => (<li key={idx} className="text-sm text-green-800 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /><span>{typeof instruction === 'string' ? instruction : instruction.text || JSON.stringify(instruction)}</span></li>))}</ul></div>}
                      {selectedWoundForDetail.analysis.backendResults.recommendation.dressing_recommendations && <div className="mb-4"><h4 className="font-medium text-green-900 text-sm mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>Dressing Recommendations</h4><ul className="space-y-1.5 ml-6">{(Array.isArray(selectedWoundForDetail.analysis.backendResults.recommendation.dressing_recommendations) ? selectedWoundForDetail.analysis.backendResults.recommendation.dressing_recommendations : [selectedWoundForDetail.analysis.backendResults.recommendation.dressing_recommendations]).map((rec: any, idx: number) => (<li key={idx} className="text-sm text-green-800 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /><span>{typeof rec === 'string' ? rec : rec.text || JSON.stringify(rec)}</span></li>))}</ul></div>}
                      {selectedWoundForDetail.analysis.backendResults.recommendation.warning_signs && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><h4 className="font-medium text-yellow-900 text-sm mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Warning Signs</h4><ul className="space-y-1.5 ml-6">{(Array.isArray(selectedWoundForDetail.analysis.backendResults.recommendation.warning_signs) ? selectedWoundForDetail.analysis.backendResults.recommendation.warning_signs : [selectedWoundForDetail.analysis.backendResults.recommendation.warning_signs]).map((sign: any, idx: number) => (<li key={idx} className="text-sm text-yellow-800 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0" /><span>{typeof sign === 'string' ? sign : sign.text || JSON.stringify(sign)}</span></li>))}</ul></div>}
                    </div>
                  )}
                  {!selectedWoundForDetail.analysis.backendResults?.recommendation && <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center"><svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><p className="text-gray-500 text-sm">No AI recommendations available for this wound.</p></div>}
                </div>
              )}
              <button onClick={() => setShowWoundDetailModal(false)} className="w-full mt-6 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-3 rounded-xl font-medium shadow-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
