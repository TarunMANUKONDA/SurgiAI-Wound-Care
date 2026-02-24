import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { Screen, PatientAnswers, WoundImage } from '../types';
import { healingStages } from '../data/woundData';
import { WoundAnalysisResult } from '../services/WoundAnalysisService';

interface ProgressScreenProps {
  onNavigate: (screen: Screen) => void;
  patientAnswers: PatientAnswers | null;
  analysis?: WoundAnalysisResult | null;
}

interface ProgressDataPoint {
  day: string;
  health: number;
  redness: number;
  swelling: number;
  healing: number;
  date: string;
}

export function ProgressScreen({ onNavigate, patientAnswers, analysis }: ProgressScreenProps) {
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'health' | 'redness' | 'healing'>('all');
  const [showDetails, setShowDetails] = useState(false);

  // Load historical data and generate progress chart
  useEffect(() => {
    const loadProgressData = () => {
      const savedHistory = localStorage.getItem('woundHistory');
      const history: WoundImage[] = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Generate progress data from history
      const data: ProgressDataPoint[] = history.map((wound, index) => {
        const woundDate = new Date(wound.date);
        return {
          day: `Day ${index + 1}`,
          health: wound.analysis?.overallHealth || Math.min(100, 50 + index * 10),
          redness: wound.analysis?.rednessLevel || Math.max(0, 70 - index * 15),
          swelling: wound.analysis?.swellingLevel || Math.max(0, 60 - index * 12),
          healing: wound.analysis?.edgeQuality || Math.min(100, 40 + index * 15),
          date: woundDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });

      // Add current analysis if available
      if (analysis) {
        data.push({
          day: `Day ${data.length + 1}`,
          health: analysis.overallHealth,
          redness: analysis.rednessLevel,
          swelling: analysis.swellingLevel,
          healing: analysis.edgeQuality,
          date: 'Today'
        });
      }

      // If no data, create sample data for demonstration
      if (data.length === 0) {
        const sampleData = [
          { day: 'Day 1', health: 45, redness: 75, swelling: 65, healing: 30, date: 'Jan 1' },
          { day: 'Day 3', health: 52, redness: 68, swelling: 55, healing: 40, date: 'Jan 3' },
          { day: 'Day 5', health: 61, redness: 55, swelling: 42, healing: 52, date: 'Jan 5' },
          { day: 'Day 7', health: 70, redness: 42, swelling: 30, healing: 65, date: 'Jan 7' },
          { day: 'Day 10', health: 78, redness: 28, swelling: 18, healing: 78, date: 'Jan 10' },
          { day: 'Day 14', health: 85, redness: 15, swelling: 8, healing: 88, date: 'Jan 14' },
        ];
        setProgressData(sampleData);
      } else {
        setProgressData(data);
      }
    };

    loadProgressData();
  }, [analysis]);

  // Determine current stage based on analysis or days since surgery
  const days = patientAnswers?.daysSinceSurgery || 5;
  
  let currentStageIndex = 0;
  if (analysis) {
    switch (analysis.healingStage) {
      case 'hemostasis': currentStageIndex = 0; break;
      case 'inflammatory': currentStageIndex = 1; break;
      case 'proliferative': currentStageIndex = 2; break;
      case 'maturation': currentStageIndex = 3; break;
    }
  } else {
    if (days > 21) currentStageIndex = 3;
    else if (days > 4) currentStageIndex = 2;
    else if (days > 0) currentStageIndex = 1;
  }

  const getProgressValue = () => {
    if (!analysis) return 25;
    if (analysis.riskLevel === 'normal') return 15 + (analysis.overallHealth / 5);
    if (analysis.riskLevel === 'warning') return 35 + ((100 - analysis.overallHealth) / 3);
    if (analysis.riskLevel === 'infected') return 55 + ((100 - analysis.overallHealth) / 4);
    return 80 + ((100 - analysis.overallHealth) / 5);
  };

  const progressValue = getProgressValue();
  const progressLabels = ['Healing', 'Delayed', 'Infected', 'Critical'];

  const getRiskColor = () => {
    if (!analysis) return 'from-[#27AE60] to-[#2F80ED]';
    switch (analysis.riskLevel) {
      case 'normal': return 'from-[#27AE60] to-[#2F80ED]';
      case 'warning': return 'from-[#F2C94C] to-[#F2994A]';
      case 'infected': return 'from-[#F2994A] to-[#EB5757]';
      case 'critical': return 'from-[#EB5757] to-[#9B2C2C]';
    }
  };

  const getProgressLabelStyle = (index: number) => {
    if (!analysis) return index === 0 ? 'text-[#27AE60] font-bold' : 'text-gray-400';
    
    const riskToIndex: Record<string, number> = {
      'normal': 0, 'warning': 1, 'infected': 2, 'critical': 3
    };
    
    const currentIndex = riskToIndex[analysis.riskLevel];
    if (index === currentIndex) {
      switch (analysis.riskLevel) {
        case 'normal': return 'text-[#27AE60] font-bold';
        case 'warning': return 'text-[#F2994A] font-bold';
        case 'infected': return 'text-[#EB5757] font-bold';
        case 'critical': return 'text-[#9B2C2C] font-bold';
      }
    }
    return 'text-gray-400';
  };

  // Calculate trends
  const calculateTrend = (key: 'health' | 'redness' | 'swelling' | 'healing') => {
    if (progressData.length < 2) return { value: 0, direction: 'stable' };
    const latest = progressData[progressData.length - 1][key];
    const previous = progressData[progressData.length - 2][key];
    const diff = latest - previous;
    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
    };
  };

  const healthTrend = calculateTrend('health');
  const rednessTrend = calculateTrend('redness');
  const healingTrend = calculateTrend('healing');

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('preview')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Healing Progress</h1>
          <p className="text-sm text-gray-500">Day {days} post-surgery</p>
        </div>
      </div>

      {/* Analysis Summary Card */}
      {analysis && (
        <div className={`rounded-2xl p-4 shadow-md mb-4 ${
          analysis.riskLevel === 'normal' ? 'bg-green-50 border border-green-200' :
          analysis.riskLevel === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
          analysis.riskLevel === 'infected' ? 'bg-red-50 border border-red-200' :
          'bg-red-100 border border-red-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">AI Analysis Summary</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysis.riskLevel === 'normal' ? 'bg-green-200 text-green-800' :
              analysis.riskLevel === 'warning' ? 'bg-yellow-200 text-yellow-800' :
              analysis.riskLevel === 'infected' ? 'bg-red-200 text-red-800' :
              'bg-red-300 text-red-900'
            }`}>
              {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500">Overall Health</p>
              <p className="text-lg font-bold text-gray-800">{analysis.overallHealth}%</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500">Edge Quality</p>
              <p className="text-lg font-bold text-gray-800">{analysis.edgeQuality}%</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500">Redness Level</p>
              <p className={`text-lg font-bold ${
                analysis.rednessLevel > 60 ? 'text-red-600' :
                analysis.rednessLevel > 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>{analysis.rednessLevel}%</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500">Swelling</p>
              <p className={`text-lg font-bold ${
                analysis.swellingLevel > 50 ? 'text-red-600' :
                analysis.swellingLevel > 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>{analysis.swellingLevel}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Healing Progress Line Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Healing Progress Chart</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-[#2F80ED] font-medium"
          >
            {showDetails ? 'Simple View' : 'Detailed View'}
          </button>
        </div>

        {/* Metric Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Metrics' },
            { key: 'health', label: 'Health', color: '#27AE60' },
            { key: 'redness', label: 'Redness', color: '#EB5757' },
            { key: 'healing', label: 'Healing', color: '#2F80ED' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedMetric(tab.key as typeof selectedMetric)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedMetric === tab.key
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {showDetails ? (
              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#27AE60" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHealing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2F80ED" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRedness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EB5757" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EB5757" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedMetric === 'all' || selectedMetric === 'health') && (
                  <Area 
                    type="monotone" 
                    dataKey="health" 
                    name="Health"
                    stroke="#27AE60" 
                    fillOpacity={1} 
                    fill="url(#colorHealth)" 
                    strokeWidth={2}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'healing') && (
                  <Area 
                    type="monotone" 
                    dataKey="healing" 
                    name="Healing"
                    stroke="#2F80ED" 
                    fillOpacity={1} 
                    fill="url(#colorHealing)" 
                    strokeWidth={2}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'redness') && (
                  <Area 
                    type="monotone" 
                    dataKey="redness" 
                    name="Redness"
                    stroke="#EB5757" 
                    fillOpacity={1} 
                    fill="url(#colorRedness)" 
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedMetric === 'all' || selectedMetric === 'health') && (
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    name="Health"
                    stroke="#27AE60" 
                    strokeWidth={3}
                    dot={{ fill: '#27AE60', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'healing') && (
                  <Line 
                    type="monotone" 
                    dataKey="healing" 
                    name="Healing"
                    stroke="#2F80ED" 
                    strokeWidth={3}
                    dot={{ fill: '#2F80ED', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'redness') && (
                  <Line 
                    type="monotone" 
                    dataKey="redness" 
                    name="Redness"
                    stroke="#EB5757" 
                    strokeWidth={3}
                    dot={{ fill: '#EB5757', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Trend Indicators */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Health</span>
              <div className={`flex items-center gap-1 ${
                healthTrend.direction === 'up' ? 'text-green-600' : 
                healthTrend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {healthTrend.direction === 'up' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {healthTrend.direction === 'down' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className="text-xs font-medium">{healthTrend.value}%</span>
              </div>
            </div>
            <p className="text-lg font-bold text-green-600 mt-1">
              {progressData.length > 0 ? progressData[progressData.length - 1].health : 0}%
            </p>
          </div>

          <div className="bg-red-50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Redness</span>
              <div className={`flex items-center gap-1 ${
                rednessTrend.direction === 'down' ? 'text-green-600' : 
                rednessTrend.direction === 'up' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {rednessTrend.direction === 'up' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {rednessTrend.direction === 'down' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className="text-xs font-medium">{rednessTrend.value}%</span>
              </div>
            </div>
            <p className="text-lg font-bold text-red-600 mt-1">
              {progressData.length > 0 ? progressData[progressData.length - 1].redness : 0}%
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Healing</span>
              <div className={`flex items-center gap-1 ${
                healingTrend.direction === 'up' ? 'text-green-600' : 
                healingTrend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {healingTrend.direction === 'up' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {healingTrend.direction === 'down' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className="text-xs font-medium">{healingTrend.value}%</span>
              </div>
            </div>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {progressData.length > 0 ? progressData[progressData.length - 1].healing : 0}%
            </p>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-2">Understanding the chart:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#27AE60]"></div>
              <span className="text-gray-600">Health ↑ = Better</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#EB5757]"></div>
              <span className="text-gray-600">Redness ↓ = Better</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#2F80ED]"></div>
              <span className="text-gray-600">Healing ↑ = Better</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Overall Status</h3>
        <div className="relative mb-2">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRiskColor()} rounded-full transition-all`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <div
            className="absolute top-0 w-4 h-4 bg-white border-2 border-[#2F80ED] rounded-full transform -translate-y-0.5"
            style={{ left: `calc(${progressValue}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2">
          {progressLabels.map((label, index) => (
            <span key={label} className={getProgressLabelStyle(index)}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Current Healing Stage */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">Healing Stages</h3>
        <div className="space-y-3">
          {healingStages.map((stage, index) => (
            <div
              key={stage.stage}
              className={`p-4 rounded-xl border-2 transition-all ${
                index === currentStageIndex
                  ? 'border-[#2F80ED] bg-blue-50'
                  : index < currentStageIndex
                  ? 'border-[#27AE60] bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    index === currentStageIndex
                      ? 'bg-[#2F80ED] text-white'
                      : index < currentStageIndex
                      ? 'bg-[#27AE60] text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  {index < currentStageIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{stage.name}</h4>
                    {index === currentStageIndex && (
                      <span className="text-xs bg-[#2F80ED] text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  {index === currentStageIndex && (
                    <div className="mt-2 p-2 bg-white rounded-lg">
                      <p className="text-xs text-[#2F80ED] font-medium">
                        Care: {stage.care}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healing Care Matrix */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Healing Care Matrix</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700">Stage</th>
                <th className="text-left p-3 font-medium text-gray-700">Recommended Care</th>
              </tr>
            </thead>
            <tbody>
              {healingStages.map((stage, index) => (
                <tr
                  key={stage.stage}
                  className={`border-t border-gray-200 ${
                    index === currentStageIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{stage.icon}</span>
                      <span className={index === currentStageIndex ? 'font-medium text-[#2F80ED]' : ''}>
                        {stage.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{stage.care}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detected Features */}
      {analysis && analysis.detectedFeatures.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">AI Detected Features</h3>
          <div className="space-y-2">
            {analysis.detectedFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Scan Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[#2F80ED] font-medium">
            Next suggested scan: {
              analysis?.riskLevel === 'critical' ? 'Immediately after medical consultation' :
              analysis?.riskLevel === 'infected' ? '12 hours' :
              analysis?.riskLevel === 'warning' ? '12-24 hours' :
              '24 hours'
            }
          </span>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">AI Confidence:</span>
          <span className="font-bold text-gray-800">{analysis?.confidence || 87}%</span>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => onNavigate('advice')}
        className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3"
      >
        Get Care Recommendations
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
