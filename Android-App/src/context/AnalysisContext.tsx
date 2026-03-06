import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { backendAPI } from '../services/BackendAPIService';
import { woundAnalysisService, WoundAnalysisResult, ComparisonResult, CareRecommendation } from '../services/WoundAnalysisService';
import { WoundCase } from '../types';

interface PatientAnswers {
  daysSinceSurgery: number;
  painLevel: 'none' | 'mild' | 'severe';
  dischargeType: 'no' | 'clear' | 'yellow' | 'green';
  hasFever: boolean;
  rednessSpread: boolean;
  dressingChanged: boolean;
}

interface StoredWoundData {
  id: string;
  imageData: string;
  analysis: WoundAnalysisResult;
  patientAnswers: PatientAnswers;
  timestamp: Date;
  comparison?: ComparisonResult;
  notes?: string;
  caseId?: string;
}

interface AnalysisContextType {
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;
  currentAnalysis: WoundAnalysisResult | null;
  setCurrentAnalysis: (analysis: WoundAnalysisResult | null) => void;
  patientAnswers: PatientAnswers | null;
  setPatientAnswers: (answers: PatientAnswers) => void;
  comparisonResult: ComparisonResult | null;
  setComparisonResult: (result: ComparisonResult | null) => void;
  recommendations: CareRecommendation[];
  setRecommendations: (recs: CareRecommendation[]) => void;
  woundHistory: StoredWoundData[];
  selectedWoundId: string | null;
  setSelectedWoundId: (id: string | null) => void;

  // Case Management
  woundCases: WoundCase[];
  currentCase: WoundCase | null;
  setCurrentCase: (woundCase: WoundCase | null) => void;
  createNewCase: (name: string, description?: string) => Promise<WoundCase>;
  refreshCases: () => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;
  deleteWound: (woundId: string) => Promise<void>;
  persistAdjustedAnalysis: (woundId: string, analysis: WoundAnalysisResult) => Promise<void>;

  // Analysis functions
  analyzeImage: (imageData: string, caseId?: string) => Promise<WoundAnalysisResult>;
  compareWithPrevious: (currentAnalysis: WoundAnalysisResult) => ComparisonResult | null;
  compareWithSpecificWound: (baseWoundId: string, currentWoundId: string) => Promise<ComparisonResult | null>;
  generateRecommendations: () => CareRecommendation[];
  saveToHistory: () => void;
  getWoundById: (id: string) => StoredWoundData | undefined;
  addNewScanToWound: (woundId: string, imageData: string) => Promise<{ analysis: WoundAnalysisResult; comparison: ComparisonResult | null }>;
  addWoundToHistory: (imageData: string, analysis: WoundAnalysisResult, patientAnswers: PatientAnswers, comparison?: ComparisonResult | null) => void;
  isAnalyzing: boolean;
}

const defaultAnswers: PatientAnswers = {
  daysSinceSurgery: 0,
  painLevel: 'none',
  dischargeType: 'no',
  hasFever: false,
  rednessSpread: false,
  dressingChanged: true,
};

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

// Load wound history from localStorage
const loadHistory = (): StoredWoundData[] => {
  try {
    const saved = localStorage.getItem('woundHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: StoredWoundData) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        analysis: {
          ...item.analysis,
          timestamp: new Date(item.analysis.timestamp),
        },
      }));
    }
  } catch (e) {
    console.error('Failed to load wound history:', e);
  }
  return [];
};

// Save wound history to localStorage


export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<WoundAnalysisResult | null>(null);
  const [patientAnswers, setPatientAnswers] = useState<PatientAnswers | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [recommendations, setRecommendations] = useState<CareRecommendation[]>([]);
  const [woundHistory, setWoundHistory] = useState<StoredWoundData[]>(loadHistory);
  const [selectedWoundId, setSelectedWoundId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Case State
  const [woundCases, setWoundCases] = useState<WoundCase[]>([]);
  const [currentCase, setCurrentCase] = useState<WoundCase | null>(null);

  // Fetch Cases on mount
  useEffect(() => {
    refreshCases();
  }, []);

  const refreshWoundHistory = useCallback(async () => {
    if (!currentCase) return;

    try {
      const data = await backendAPI.getHistory(1, currentCase.id);
      if (data.success && Array.isArray(data.wounds)) {
        console.log('Fetched remote history:', data.wounds);

        const remoteHistory: StoredWoundData[] = data.wounds.map((w: any) => {
          // Backend returns either full absolute URLs (production) or relative paths (local)
          const apiHost = (import.meta.env.VITE_API_HOST || 'http://localhost:8000').replace(/\/+$/, '');
          let imageUrl = w.image_path;

          if (imageUrl && !imageUrl.startsWith('http')) {
            const cleanPath = imageUrl.replace(/^\/+/, '');
            imageUrl = `${apiHost}/${cleanPath}`;
          }
          console.log('Wound image mapping:', { original: w.image_path, final: imageUrl });

          // Use persisted analysis if available (Fixes "score not updating" issue)
          if (w.analysis) {
            const persistedAnalysis = w.analysis;
            return {
              id: w.wound_id.toString(),
              caseId: w.case_id?.toString(),
              imageData: imageUrl,
              patientAnswers: defaultAnswers,
              timestamp: new Date(w.upload_date),
              analysis: {
                ...persistedAnalysis,
                timestamp: new Date(w.upload_date),
                backendResults: {
                  ...persistedAnalysis.backendResults,
                  classification: w.classification,
                  recommendation: w.recommendation
                }
              }
            };
          }

          // Fallback: Default mapping if no analysis saved
          let riskLevel: 'normal' | 'warning' | 'infected' | 'critical' = 'normal';
          let healingStage: 'hemostasis' | 'inflammatory' | 'proliferative' | 'maturation' = 'inflammatory';

          if (w.classification?.wound_type) {
            const type = w.classification.wound_type.toLowerCase();
            if (type.includes('infection') || type.includes('high')) riskLevel = 'infected';
            else if (type.includes('urgency') || type.includes('critical')) riskLevel = 'critical';
            else if (type.includes('delay')) riskLevel = 'warning';
            if (type.includes('healing')) healingStage = 'proliferative';
          }

          return {
            id: w.wound_id.toString(),
            caseId: w.case_id?.toString(),
            imageData: imageUrl,
            patientAnswers: defaultAnswers,
            timestamp: new Date(w.upload_date),
            analysis: {
              overallHealth: w.analysis?.overallHealth || 70,
              rednessLevel: w.redness_level ?? 0,
              swellingLevel: w.analysis?.swellingLevel ?? 0,
              dischargeDetected: !!w.discharge_detected,
              dischargeType: w.discharge_type || 'none',
              woundSize: w.analysis?.woundSize || { width: 0, height: 0, area: 0, perimeter: 0 },
              edgeQuality: w.edge_quality ?? 0,
              tissueColor: w.tissue_composition || { red: 0, pink: 0, yellow: 0, black: 0, white: 0 },
              healingStage: healingStage,
              riskLevel: riskLevel,
              confidence: w.classification ? w.classification.confidence : 0,
              detectedFeatures: w.classification ? [`AI Detection: ${w.classification.wound_type}`] : [],
              timestamp: new Date(w.upload_date),
              backendResults: {
                classification: w.classification,
                recommendation: w.recommendation,
                rawAnalysis: w.analysis
              },
              ...woundAnalysisService.generateStatusInfo(w.analysis?.overallHealth || 70, riskLevel)
            }
          };
        });

        setWoundHistory(remoteHistory);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [currentCase]);

  // Fetch history when case changes
  useEffect(() => {
    refreshWoundHistory();
  }, [refreshWoundHistory]);

  const refreshCases = async () => {
    try {
      const data = await backendAPI.getCases();
      if (data.success && Array.isArray(data.cases)) {
        const mappedCases = data.cases.map((c: any) => {
          // Backend returns either full absolute URLs (production) or relative paths (local)
          const apiHost = (import.meta.env.VITE_API_HOST || 'http://localhost:8000').replace(/\/+$/, '');
          let imageUrl = c.latest_image;

          if (imageUrl && !imageUrl.startsWith('http')) {
            const cleanPath = imageUrl.replace(/^\/+/, '');
            imageUrl = `${apiHost}/${cleanPath}`;
          }
          console.log('Case image mapping:', { original: c.latest_image, final: imageUrl });
          return {
            ...c,
            id: c.id.toString(),
            woundCount: parseInt(c.wound_count),
            latestImage: imageUrl
          };
        });
        setWoundCases(mappedCases);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const createNewCase = async (name: string, description?: string): Promise<WoundCase> => {
    const data = await backendAPI.createCase(name, description);
    await refreshCases();
    return {
      ...data.case,
      id: data.case.id.toString(),
      woundCount: 0
    };
  };

  const deleteCase = async (caseId: string): Promise<void> => {
    await backendAPI.deleteCase(caseId);
    await refreshCases();
    if (currentCase?.id === caseId) setCurrentCase(null);
  };

  const deleteWound = async (woundId: string): Promise<void> => {
    await backendAPI.deleteWound(woundId);
    setWoundHistory(prev => prev.filter(w => w.id !== woundId));
    await refreshCases();
  };

  const analyzeImage = useCallback(async (imageData: string, caseId?: string): Promise<WoundAnalysisResult> => {
    setIsAnalyzing(true);
    try {
      const result = await woundAnalysisService.analyzeWoundImage(imageData, caseId);
      setCurrentAnalysis(result);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const compareWithPrevious = useCallback((current: WoundAnalysisResult): ComparisonResult | null => {
    if (woundHistory.length === 0) return null;

    // Get the most recent wound in the current case history
    const previousScan = woundHistory[0];
    const daysBetween = Math.ceil(
      (current.timestamp.getTime() - new Date(previousScan.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );

    const comparison = woundAnalysisService.compareWounds(
      current,
      previousScan.analysis,
      Math.max(1, daysBetween)
    );

    setComparisonResult(comparison);
    return comparison;
  }, [woundHistory]);

  const compareWithSpecificWound = useCallback(async (baseWoundId: string, currentWoundId: string): Promise<ComparisonResult | null> => {
    // Check if we have both wounds in history
    const baseWound = woundHistory.find(w => w.id === baseWoundId);
    const currentWound = woundHistory.find(w => w.id === currentWoundId);

    if (baseWound && currentWound) {
      // Try local comparison first if analysis data is rich enough
      // But the user requested Gemini API comparison specifically for accuracy
      try {
        console.log(`Requesting AI comparison for wounds ${baseWoundId} vs ${currentWoundId}`);
        const result = await backendAPI.compareWounds(baseWoundId, currentWoundId);
        if (result.success && result.comparison) {
          console.log("AI comparison successful:", result.comparison);
          return result.comparison;
        }
      } catch (e) {
        console.error("API comparison failed, falling back to local:", e);
      }

      // Fallback to local comparison
      console.log("Using local comparison fallback");
      const daysBetween = Math.ceil(
        (currentWound.timestamp.getTime() - new Date(baseWound.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );

      return woundAnalysisService.compareWounds(
        currentWound.analysis,
        baseWound.analysis,
        Math.max(1, daysBetween)
      );
    }
    return null;
  }, [woundHistory]);


  const generateRecommendations = useCallback((): CareRecommendation[] => {
    if (!currentAnalysis || !patientAnswers) return [];

    const recs = woundAnalysisService.generateCareRecommendations(
      currentAnalysis,
      patientAnswers
    );

    setRecommendations(recs);
    return recs;
  }, [currentAnalysis, patientAnswers]);

  const saveToHistory = useCallback(() => {
    // Refresh cases to update counts/stats from backend
    refreshCases();
    // Also refresh history for the current case to see the new upload
    refreshWoundHistory();
  }, [refreshCases, refreshWoundHistory]);

  const getWoundById = useCallback((id: string): StoredWoundData | undefined => {
    return woundHistory.find(w => w.id === id);
  }, [woundHistory]);

  const addNewScanToWound = useCallback(async (
    _woundId: string,
    _imageData: string
  ): Promise<{ analysis: WoundAnalysisResult; comparison: ComparisonResult | null }> => {
    // Deprecated in favor of Case-based flow, but keeping for compatibility
    return { analysis: {} as any, comparison: null };
  }, []);

  const addWoundToHistory = useCallback((
    imageData: string,
    analysis: WoundAnalysisResult,
    answers: PatientAnswers,
    comparison?: ComparisonResult | null
  ) => {
    // This updates LOCAL state immediately for UI 
    const newEntry: StoredWoundData = {
      id: Date.now().toString(), // Temporary ID until refresh
      imageData,
      analysis,
      patientAnswers: answers,
      timestamp: new Date(),
      comparison: comparison || undefined,
      caseId: currentCase?.id
    };

    const updatedHistory = [newEntry, ...woundHistory];
    setWoundHistory(updatedHistory);
    // disable local storage sync strictly when using backend
    // saveHistory(updatedHistory); 

    // Trigger remote refresh to ensure data persistence check
    saveToHistory();
  }, [woundHistory, currentCase, saveToHistory]);

  const persistAdjustedAnalysis = useCallback(async (woundId: string, analysis: WoundAnalysisResult) => {
    try {
      await backendAPI.saveAnalysis(woundId, analysis);
      // Refresh to ensure all views (Home/History) have the new data
      await refreshCases();
      await refreshWoundHistory();
    } catch (error) {
      console.error("Failed to persist adjusted analysis:", error);
    }
  }, [refreshCases, refreshWoundHistory]);

  return (
    <AnalysisContext.Provider
      value={{
        currentImage,
        setCurrentImage,
        currentAnalysis,
        setCurrentAnalysis,
        patientAnswers,
        setPatientAnswers,
        comparisonResult,
        setComparisonResult,
        recommendations,
        setRecommendations,
        woundHistory,
        selectedWoundId,
        setSelectedWoundId,

        woundCases,
        currentCase,
        setCurrentCase,
        createNewCase,
        refreshCases,
        deleteCase,
        deleteWound,

        analyzeImage,
        compareWithPrevious,
        compareWithSpecificWound,
        generateRecommendations,
        saveToHistory,
        getWoundById,
        addNewScanToWound,
        addWoundToHistory,
        persistAdjustedAnalysis,
        isAnalyzing,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};
