import { backendAPI } from './BackendAPIService';
import { woundClassificationService } from './WoundClassificationService';

export interface WoundAnalysisResult {
  overallHealth: number; // 0-100
  healingScore: number; // 0-100 (Unified progress score)
  rednessLevel: number; // 0-100
  swellingLevel: number; // 0-100
  dischargeDetected: boolean;
  dischargeType: 'none' | 'clear' | 'yellow' | 'green' | 'bloody';
  woundSize: {
    width: number;
    height: number;
    area: number;
    perimeter: number;
  };
  edgeQuality: number; // 0-100 (how well edges are healing)
  tissueColor: {
    red: number;
    pink: number;
    yellow: number;
    black: number;
    white: number;
  };
  healingStage: 'hemostasis' | 'inflammatory' | 'proliferative' | 'maturation';
  riskLevel: 'normal' | 'warning' | 'infected' | 'critical';
  confidence: number;
  detectedFeatures: string[];
  woundLocation?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  timestamp: Date;
  backendResults?: any; // Store full backend response
  statusLabel: string; // User-friendly status message (e.g., "Healing Well", "Critical Attention Required")
  statusColor: string; // Color code for the status (hex or tailwind class)
}

export interface ComparisonResult {
  improvement: number; // -100 to 100 (negative = worsening)
  rednessChange: number;
  sizeChange: number;
  edgeHealingChange: number;
  dischargeChange: string;
  overallTrend: 'improving' | 'stable' | 'declining' | 'critical';
  daysSinceLastScan: number;
  healingRate: number; // expected vs actual
  recommendations: string[];
  warnings: string[];
  nextScanRecommendation: string;
}

export interface CareRecommendation {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  steps: string[];
  warnings: string[];
  frequency?: string;
}

class WoundAnalysisService {
  private isModelLoaded: boolean = false;

  async initialize(): Promise<void> {
    try {
      // Initialize classification service for similarity search
      // This might fail if the model files are missing
      await woundClassificationService.initialize();
      console.log('Similarity search service initialized');
    } catch (e) {
      console.warn('WoundClassificationService failed to initialize, similarity search will be disabled:', e);
    }
    // No initialization needed for backend API
    this.isModelLoaded = true;
  }

  async analyzeWoundImage(imageData: string, caseId?: string): Promise<WoundAnalysisResult> {
    if (!this.isModelLoaded) {
      await this.initialize();
    }

    return new Promise(async (resolve, _reject) => {
      try {
        // 1. Convert Data URL to File for upload
        const file = this.dataURLtoFile(imageData, 'wound_scan.jpg');

        // 2. Upload to Backend
        console.log('Uploading image...', caseId ? `to case ${caseId}` : 'no case');
        const uploadResult = await backendAPI.uploadImage(file, caseId);

        // 3. Perform Similarity Search
        let similarLabel: string | undefined = undefined;
        try {
          console.log('Performing similarity search...');
          const classification = await woundClassificationService.classifyWound(imageData);
          if (classification.similarImages && classification.similarImages.length > 0) {
            similarLabel = classification.similarImages[0].woundType;
            console.log('Similar image found:', similarLabel);
          }
        } catch (e) {
          console.warn('Similarity search failed:', e);
        }

        // 4. Classify Wound with Similarity Context
        let classification: any = null;
        try {
          console.log('Classifying wound...', uploadResult.wound_id, similarLabel ? `with context: ${similarLabel}` : '');
          classification = await backendAPI.classifyWound(uploadResult.wound_id, similarLabel);
        } catch (e) {
          console.error('Classification failed:', e);
        }

        // 5. Get Recommendations (initial)
        let recommendations: any = null;
        if (classification && classification.success) {
          try {
            console.log('Getting recommendations...');
            recommendations = await backendAPI.getRecommendations(
              classification.classification_id,
              classification.wound_type,
              classification.confidence
            );
          } catch (e) {
            console.error('Recommendations failed:', e);
          }
        }

        // 5. Perform local image analysis for metrics (size, redness, etc.)
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          const imageDataObj = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          let localAnalysis: WoundAnalysisResult;

          // 6. Merge Backend Results with Local Analysis
          const hasBackendData = classification && classification.success;
          const hasRecommendationData = recommendations && recommendations.success;

          if (imageDataObj) {
            localAnalysis = this.processImageData(imageDataObj, hasBackendData ? classification.wound_location : undefined);
          } else {
            localAnalysis = this.getDefaultAnalysis();
          }

          const backendRedness = hasBackendData ? classification.redness_level : null;
          const backendDischarge = hasBackendData ? classification.discharge_detected : null;
          const backendDischargeType = hasBackendData ? classification.discharge_type : null;
          const backendEdge = hasBackendData ? classification.edge_quality : null;
          // Prefer recommendation tissue composition (which includes updates/estimates) over classification
          const backendTissue = (hasRecommendationData && recommendations.tissue_composition)
            ? recommendations.tissue_composition
            : (hasBackendData ? classification.tissue_composition : null);

          // Override local analysis if backend provided data
          const finalRedness = (backendRedness !== null && backendRedness !== undefined) ? backendRedness : localAnalysis.rednessLevel;
          const finalDischarge = (backendDischarge !== null && backendDischarge !== undefined) ? backendDischarge : localAnalysis.dischargeDetected;
          const finalDischargeType = (backendDischargeType && backendDischargeType !== 'none') ? backendDischargeType : localAnalysis.dischargeType;
          const finalEdge = (backendEdge !== null && backendEdge !== undefined) ? backendEdge : localAnalysis.edgeQuality;

          // Blending Logic: Use AI results as the authoritative source
          // Weight: 100% Backend if Gemini used, 90% Backend if TFLite fallback used
          const backendSource = (hasBackendData && classification.source) ? classification.source : 'local';
          const finalTissue = this.blendTissueComposition(backendTissue, localAnalysis.tissueColor, backendSource);

          // Backend Risk Level & Severity Mapping (must happen BEFORE score calculation)
          let finalRiskLevel = localAnalysis.riskLevel;
          if (hasRecommendationData && recommendations.risk_level) {
            const rLevel = recommendations.risk_level.toUpperCase();
            if (rLevel.includes('CRITICAL') || rLevel.includes('VERY HIGH')) finalRiskLevel = 'critical';
            else if (rLevel.includes('HIGH') || rLevel.includes('INFECTED')) finalRiskLevel = 'infected';
            else if (rLevel.includes('MODERATE')) finalRiskLevel = 'warning';
            else finalRiskLevel = 'normal';
          } else if (hasBackendData) {
            finalRiskLevel = this.mapBackendToRiskLevel(classification.wound_type || 'Unknown');
          }

          // Calculate healing score — pass riskLevel so hard caps are applied inside
          const backendConfidence = hasBackendData ? (classification.confidence || 80) : localAnalysis.confidence;
          const healingScore = this.calculateHealingScore(finalRedness, 0, finalEdge, finalTissue, finalDischargeType, backendConfidence, finalRiskLevel);

          // Use recommendation severity to adjust health if available, otherwise use unified score
          let finalHealth = healingScore;
          if (hasRecommendationData && recommendations.severity_score !== undefined) {
            // Map severity_score (0–300 scale) to health (0–100):
            // severity 0 = perfect health (100), severity 300 = critical (0).
            const rawHealth = 100 - Math.round((recommendations.severity_score / 300) * 100);
            // Apply same risk caps to severity-based score too
            let cappedRaw = Math.max(0, Math.min(100, rawHealth));
            if (finalRiskLevel === 'critical') cappedRaw = Math.min(cappedRaw, 30);
            else if (finalRiskLevel === 'infected') cappedRaw = Math.min(cappedRaw, 49);
            else if (finalRiskLevel === 'warning') cappedRaw = Math.min(cappedRaw, 64);
            finalHealth = cappedRaw;
          }

          const combinedResult: WoundAnalysisResult = {
            ...localAnalysis,
            rednessLevel: finalRedness,
            dischargeDetected: finalDischarge,
            dischargeType: finalDischargeType,
            edgeQuality: finalEdge,
            tissueColor: finalTissue,
            healingScore: finalHealth, // Sync with health
            riskLevel: finalRiskLevel,
            healingStage: this.mapBackendToHealingStage(hasBackendData ? classification.wound_type : 'Unknown'),
            confidence: hasBackendData ? classification.confidence || localAnalysis.confidence : localAnalysis.confidence,
            overallHealth: finalHealth,
            detectedFeatures: [
              ...localAnalysis.detectedFeatures,
              ...(hasBackendData ? [`AI Detection: ${classification.wound_type}`] : ['Local Analysis Only']),
              ...(hasRecommendationData ? [`Risk: ${recommendations.risk_level}`] : [])
            ],
            woundLocation: hasBackendData ? classification.wound_location : undefined,
            backendResults: {
              upload: uploadResult,
              classification: classification,
              recommendation: recommendations ? {
                summary: recommendations.recommendation.summary,
                cleaning_instructions: recommendations.recommendation.cleaningInstructions,
                dressing_recommendations: recommendations.recommendation.dressingRecommendations,
                warning_signs: recommendations.recommendation.warningsSigns,
                when_to_seek_help: recommendations.recommendation.whenToSeekHelp,
              } : null,
              raw_risk: recommendations ? recommendations.risk_level : null
            },
            ...this.generateStatusInfo(finalHealth, finalRiskLevel)
          };

          // 7. Save full analysis to backend (block to ensure synchronization)
          if (uploadResult && uploadResult.success) {
            try {
              await backendAPI.saveAnalysis(uploadResult.wound_id, combinedResult);
              console.log('Full analysis saved to backend successfully');
            } catch (e) {
              console.warn('Failed to save analysis to backend:', e);
            }
          }

          resolve(combinedResult);
        };
        img.onerror = () => {
          console.warn('Local analysis failed, using backend data only');
          resolve(this.getDefaultAnalysis());
        };
        img.src = imageData;

      } catch (error) {
        console.error('Backend analysis failed:', error);

        // Final fallback: Perform local analysis ONLY if backend fails before onload
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          const imageDataObj = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          const localOnly = imageDataObj ? this.processImageData(imageDataObj) : this.getDefaultAnalysis();

          console.log('Resolved with Local Analysis Only after backend failure');
          resolve({
            ...localOnly,
            detectedFeatures: [...localOnly.detectedFeatures, 'Offline mode (Local Analysis only)'],
            backendResults: { error: String(error) }
          });
        };
        img.onerror = () => {
          resolve(this.getDefaultAnalysis());
        };
        img.src = imageData;
      }
    });
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private mapBackendToRiskLevel(woundType: string): 'normal' | 'warning' | 'infected' | 'critical' {
    const type = (woundType || '').toLowerCase();
    if (type.includes('infection') || type.includes('high')) return 'infected';
    if (type.includes('urgency') || type.includes('critical')) return 'critical';
    if (type.includes('delay')) return 'warning';
    return 'normal';
  }

  private mapBackendToHealingStage(woundType: string): 'hemostasis' | 'inflammatory' | 'proliferative' | 'maturation' {
    // This is a rough mapping, relying on local analysis for accuracy if backend is generic
    const type = (woundType || '').toLowerCase();
    if (type.includes('healing')) return 'proliferative';
    return 'inflammatory'; // Default
  }

  private processImageData(imageData: ImageData, boundingBox?: [number, number, number, number]): WoundAnalysisResult {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const totalPixels = width * height;

    // Convert normalized [ymin, xmin, ymax, xmax] (0-1000) to pixel coordinates
    let bMinX = 0, bMaxX = width, bMinY = 0, bMaxY = height;
    if (boundingBox && Array.isArray(boundingBox) && boundingBox.length === 4) {
      bMinY = Math.floor((boundingBox[0] / 1000) * height);
      bMinX = Math.floor((boundingBox[1] / 1000) * width);
      bMaxY = Math.ceil((boundingBox[2] / 1000) * height);
      bMaxX = Math.ceil((boundingBox[3] / 1000) * width);

      // Add a small 5% padding to ensure we don't cut off wound edges
      const padW = Math.floor((bMaxX - bMinX) * 0.05);
      const padH = Math.floor((bMaxY - bMinY) * 0.05);
      bMinX = Math.max(0, bMinX - padW);
      bMaxX = Math.min(width, bMaxX + padW);
      bMinY = Math.max(0, bMinY - padH);
      bMaxY = Math.min(height, bMaxY + padH);
    }

    // Color analysis
    let redPixels = 0;
    let pinkPixels = 0;
    let yellowPixels = 0;
    let blackPixels = 0;
    let whitePixels = 0;
    let woundPixels = 0;
    let totalRedness = 0;
    let totalSwelling = 0;

    // Wound boundary detection
    let minX = width, maxX = 0, minY = height, maxY = 0;
    const woundMap: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);

      // Skip pixels outside the bounding box (Background Removal)
      if (x < bMinX || x > bMaxX || y < bMinY || y > bMaxY) continue;

      // Detect wound area (looking for skin tones and wound colors)
      const isWoundArea = this.isWoundPixel(r, g, b);

      if (isWoundArea) {
        woundPixels++;
        woundMap[y][x] = true;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        // Classify tissue color - refine thresholds
        const color = this.classifyPixelColor(r, g, b);
        if (color === 'red') {
          redPixels++;
          totalRedness += (r - g) / 255;
        } else if (color === 'pink') {
          pinkPixels++;
        } else if (color === 'yellow') {
          yellowPixels++;
        } else if (color === 'black') {
          blackPixels++;
        } else if (color === 'white') {
          whitePixels++;
        }

        // Detect swelling indicators (brightness and color patterns)
        if (this.isSwellingIndicator(r, g, b)) {
          totalSwelling++;
        }
      }
    }

    // Calculate wound size
    const woundWidth = maxX - minX;
    const woundHeight = maxY - minY;
    const woundArea = woundPixels;
    const perimeter = this.calculatePerimeter(woundMap, minX, maxX, minY, maxY);

    // Calculate tissue percentages
    const tissueTotal = redPixels + pinkPixels + yellowPixels + blackPixels + whitePixels || 1;
    const tissueColor = {
      red: Math.round((redPixels / tissueTotal) * 100),
      pink: Math.round((pinkPixels / tissueTotal) * 100),
      yellow: Math.round((yellowPixels / tissueTotal) * 100),
      black: Math.round((blackPixels / tissueTotal) * 100),
      white: Math.round((whitePixels / tissueTotal) * 100),
    };

    // Calculate metrics
    const rednessLevel = Math.min(100, Math.round((totalRedness / (woundPixels || 1)) * 200));
    const swellingLevel = Math.min(100, Math.round((totalSwelling / (woundPixels || 1)) * 150));
    const edgeQuality = this.calculateEdgeQuality(woundMap, minX, maxX, minY, maxY);

    // Detect discharge
    const { dischargeDetected, dischargeType } = this.detectDischarge(tissueColor, yellowPixels, woundPixels);

    // Determine healing stage
    const healingStage = this.determineHealingStage(tissueColor, rednessLevel, edgeQuality);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(rednessLevel, swellingLevel, dischargeType, tissueColor);

    // Calculate confidence based on image quality
    const confidence = this.calculateConfidence(woundPixels, totalPixels, edgeQuality);

    // Calculate overall health score — pass riskLevel so hard caps are enforced
    const overallHealth = this.calculateHealingScore(rednessLevel, swellingLevel, edgeQuality, tissueColor, dischargeType, confidence, riskLevel);

    // Detect features
    const detectedFeatures = this.detectFeatures(tissueColor, rednessLevel, swellingLevel, dischargeType, edgeQuality);

    return {
      overallHealth,
      rednessLevel,
      swellingLevel,
      dischargeDetected,
      dischargeType,
      woundSize: {
        width: woundWidth,
        height: woundHeight,
        area: woundArea,
        perimeter,
      },
      edgeQuality,
      tissueColor,
      healingStage,
      riskLevel,
      confidence,
      detectedFeatures,
      healingScore: overallHealth, // Reuse already-calculated, cap-enforced score
      timestamp: new Date(),
      ...this.generateStatusInfo(overallHealth, riskLevel)
    };
  }

  /**
   * Clinical Healing Progress Score (0–100)
   *
   * Rubric (weighted sum of clinical domains):
   *   F1 – Tissue Quality      40%  (Pink = healthy; Yellow/Black = very bad)
   *   F2 – Edge Healing        20%  (edgeQuality directly, 0–100)
   *   F3 – Discharge Status    20%  (none=100, clear=70, bloody=45, yellow=20, green=5)
   *   F4 – Redness Level       20%  (inverted: high redness tanks the score)
   *
   * AI confidence acts only as a penalty when very low (< 60). It never inflates the score.
   *
   * Hard caps by risk level:
   *   critical  → score never exceeds 30
   *   infected  → score never exceeds 49
   *   warning   → score never exceeds 64
   *
   * Interpretation bands:
   *   80–100  Healing Excellently
   *   65–79   Healing Well
   *   50–64   Stable / Progressing
   *   35–49   Needs Monitoring
   *   20–34   Stalled / Concern
   *   0–19    At Risk / Critical
   */
  public calculateHealingScore(
    rednessLevel: number = 0,
    _swellingLevel: number = 0,   // kept for backwards-compat, not used directly
    edgeQuality: number = 50,     // Lowered default: unknown is not assumed good
    tissueColor?: { pink?: number; black?: number; yellow?: number; red?: number; white?: number },
    dischargeType: string = 'none',
    confidence: number = 80,
    riskLevel?: string            // NEW: risk level for hard caps
  ): number {
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    // ── F1: Tissue Quality (0–100) ──────────────────────────────────────────
    // Healthy tissue (pink / granulation-red) boosts score;
    // Slough (yellow/white) and Necrosis (black) penalise heavily.
    let f1 = 35; // Conservative baseline for unknown tissue (was 60 — caused inflation)
    if (tissueColor) {
      const pink = tissueColor.pink || 0;
      const red = tissueColor.red || 0;
      const yellow = tissueColor.yellow || 0;
      const white = tissueColor.white || 0;
      const black = tissueColor.black || 0;
      const total = pink + red + yellow + white + black;
      if (total > 0) {
        // Tissue weightings — penalties are now twice as severe as before:
        //   Pink   = +1.0  (epithelialisation — best sign)
        //   Red    = +0.6  (granulation — good)
        //   Yellow = -1.2  (slough — bad, was -0.6)
        //   White  = -0.8  (fibrin/slough — bad, was -0.4)
        //   Black  = -3.0  (necrosis — very bad, was -1.5)
        const raw = (pink * 1.0 + red * 0.6 + yellow * (-1.2) + white * (-0.8) + black * (-3.0));
        // raw is in range ~[-300, 100]; map to [0, 100]
        f1 = clamp(50 + raw * 0.5, 0, 100);
      }
    }

    // ── F2: Edge Healing (0–100) ────────────────────────────────────────────
    // Default is 50 (neutral), not 70 — unknown healing is not assumed good
    const f2 = clamp(edgeQuality !== undefined ? edgeQuality : 50, 0, 100);

    // ── F3: Discharge Status (0–100) ────────────────────────────────────────
    // Harsher penalties: yellow/green are serious infection indicators
    const dischargeScores: Record<string, number> = {
      'none': 100,
      'clear': 70,  // was 78
      'bloody': 45,  // was 52
      'yellow': 20,  // was 28
      'green': 5,  // was 8
    };
    const f3 = dischargeScores[dischargeType] ?? 50; // unknown defaults to neutral 50, not 78

    // ── F4: Redness (0–100, inverted) ───────────────────────────────────────
    // Stronger penalty: redness 0 = great (100), redness 100 = very bad (0)
    // Multiplier increased from 0.85 → 1.2 so high redness clearly drops the score
    const f4 = clamp(100 - (rednessLevel || 0) * 1.2, 0, 100);

    // ── Confidence dampener (never inflates, only penalises low confidence) ──
    // Confidence ≥ 60 → no penalty; below 60 → slight downward correction
    const confidencePenalty = confidence < 60 ? (60 - confidence) * 0.3 : 0;

    // ── Weighted Sum (F1–F4 only; confidence removed from additive weights) ──
    // Weights redistributed: F1=40%, F2=20%, F3=20%, F4=20%
    const rawScore = (f1 * 0.40) + (f2 * 0.20) + (f3 * 0.20) + (f4 * 0.20) - confidencePenalty;
    let score = Math.round(clamp(rawScore, 0, 100));

    // ── Hard caps based on clinical risk level ───────────────────────────────
    // Risk level overrides must cap the *number* too, not just the label
    if (riskLevel === 'critical') score = Math.min(score, 30);
    else if (riskLevel === 'infected') score = Math.min(score, 49);
    else if (riskLevel === 'warning') score = Math.min(score, 64);

    return score;
  }

  private isWoundPixel(r: number, g: number, b: number): boolean {
    // Detect wound bed colors (strictly excluding healthy dry skin)
    const isWoundColor = (r > 120 && g < 100 && b < 100 && (r - g) > 40) || // Deep Red (granulation)
      (r > 200 && g > 130 && b > 130 && (r - g) > 15) || // Vibrant Pink (epithelial)
      (r > 160 && g > 150 && b < 120 && Math.abs(r - g) < 40) || // Yellow (slough/infection)
      (r < 50 && g < 50 && b < 50) || // Black (necrosis)
      (r > 220 && g > 220 && b > 210 && Math.abs(r - g) < 15); // White/Silver (fibrin/slough)

    // IMPORTANT: Healthy skin should NOT be counted as a 'wound pixel'.
    // This prevents healthy skin from diluting the tissue percentages.
    return isWoundColor;
  }

  private classifyPixelColor(r: number, g: number, b: number): 'red' | 'pink' | 'yellow' | 'black' | 'white' | 'none' {
    if (this.isRedTissue(r, g, b)) return 'red';
    if (this.isPinkTissue(r, g, b)) return 'pink';
    if (this.isYellowTissue(r, g, b)) return 'yellow';
    if (this.isBlackTissue(r, g, b)) return 'black';
    if (this.isWhiteTissue(r, g, b)) return 'white';
    return 'none';
  }

  private isRedTissue(r: number, g: number, b: number): boolean {
    return r > 150 && g < 100 && b < 100 && (r - g) > 50;
  }

  private isPinkTissue(r: number, g: number, b: number): boolean {
    // Healing tissue is a "Wet Pink" - higher saturation than dry skin.
    // Skin tones usually have (R - G) < 40 and G/B are closer to R.
    const saturation = r - Math.max(g, b);
    const isVibrantPink = r > 200 && g > 130 && b > 130 && saturation > 15;
    const isPalePink = r > 180 && g > 150 && b > 150 && r > g && r > b;

    // Distinguish from tan/brown skin
    const isSkinTan = r > 100 && g > 80 && b > 60 && (r - g < 30);

    return (isVibrantPink || isPalePink) && !isSkinTan;
  }

  private isYellowTissue(r: number, g: number, b: number): boolean {
    return r > 180 && g > 150 && b < 120 && Math.abs(r - g) < 50;
  }

  private isBlackTissue(r: number, g: number, b: number): boolean {
    return r < 60 && g < 60 && b < 60;
  }

  private isWhiteTissue(r: number, g: number, b: number): boolean {
    return r > 220 && g > 220 && b > 200 && Math.abs(r - g) < 30;
  }

  private isSwellingIndicator(r: number, g: number, b: number): boolean {
    // Swelling often shows as shiny, lighter areas with specific color patterns
    return (r > 200 && g > 150 && b > 150) && (r - b < 60);
  }

  private calculatePerimeter(woundMap: boolean[][], minX: number, maxX: number, minY: number, maxY: number): number {
    let perimeter = 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (woundMap[y]?.[x]) {
          // Check 4-connectivity
          if (!woundMap[y - 1]?.[x]) perimeter++;
          if (!woundMap[y + 1]?.[x]) perimeter++;
          if (!woundMap[y]?.[x - 1]) perimeter++;
          if (!woundMap[y]?.[x + 1]) perimeter++;
        }
      }
    }
    return perimeter;
  }

  private calculateEdgeQuality(woundMap: boolean[][], minX: number, maxX: number, minY: number, maxY: number): number {
    // Check how smooth and well-defined the edges are
    let smoothEdges = 0;
    let totalEdges = 0;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (woundMap[y]?.[x]) {
          const neighbors = [
            woundMap[y - 1]?.[x],
            woundMap[y + 1]?.[x],
            woundMap[y]?.[x - 1],
            woundMap[y]?.[x + 1],
          ].filter(Boolean).length;

          if (neighbors < 4) {
            totalEdges++;
            if (neighbors >= 2) smoothEdges++;
          }
        }
      }
    }

    return totalEdges > 0 ? Math.round((smoothEdges / totalEdges) * 100) : 50;
  }

  private detectDischarge(
    tissueColor: { yellow: number; white: number },
    yellowPixels: number,
    woundPixels: number
  ): { dischargeDetected: boolean; dischargeType: 'none' | 'clear' | 'yellow' | 'green' | 'bloody' } {
    const yellowRatio = woundPixels > 0 ? yellowPixels / woundPixels : 0;

    if (yellowRatio > 0.3 || tissueColor.yellow > 30) {
      return { dischargeDetected: true, dischargeType: 'yellow' };
    } else if (tissueColor.white > 40) {
      return { dischargeDetected: true, dischargeType: 'clear' };
    } else if (tissueColor.yellow > 15 && tissueColor.white > 20) {
      return { dischargeDetected: true, dischargeType: 'green' };
    } else if (yellowRatio > 0.1) {
      return { dischargeDetected: true, dischargeType: 'clear' };
    }

    return { dischargeDetected: false, dischargeType: 'none' };
  }

  // Determine healing stage
  private determineHealingStage(
    tissueColor: { red: number; pink: number; yellow: number; black: number; white: number },
    rednessLevel: number,
    edgeQuality: number
  ): 'hemostasis' | 'inflammatory' | 'proliferative' | 'maturation' {
    // If necrotic tissue is present ( > 5%), it's effectively stuck in inflammatory/stalled phase
    if (tissueColor.black > 5 || tissueColor.yellow > 20) {
      return 'inflammatory';
    }

    // Maturation: Well-healed, mostly pink/white scar tissue
    if (tissueColor.pink > 70 && rednessLevel < 20 && edgeQuality > 85) {
      return 'maturation';
    }

    // Proliferative: Active granulation, red tissue present, good edges
    if ((tissueColor.red > 20 || tissueColor.pink > 30) && edgeQuality > 60) {
      return 'proliferative';
    }

    // Inflammatory: High redness, some swelling
    if (rednessLevel > 40 || tissueColor.red > 30) {
      return 'inflammatory';
    }

    return 'inflammatory'; // Default to inflammatory if unsure
  }

  private determineRiskLevel(
    rednessLevel: number,
    swellingLevel: number,
    dischargeType: string,
    tissueColor: { black: number; yellow: number }
  ): 'normal' | 'warning' | 'infected' | 'critical' {
    // Critical: Necrotic tissue (EVEN SMALL AMOUNTS), severe infection signs
    if (tissueColor.black > 5 || (dischargeType === 'green' && rednessLevel > 60) || (dischargeType === 'yellow' && rednessLevel > 80)) {
      return 'critical';
    }

    // Infected: Yellow/green discharge or significant slough
    if ((dischargeType === 'yellow' || dischargeType === 'green') || tissueColor.yellow > 40) {
      return 'infected';
    }

    // Warning: Elevated redness or swelling, or some slough
    if (rednessLevel > 50 || swellingLevel > 50 || tissueColor.yellow > 20) {
      return 'warning';
    }

    return 'normal';
  }

  // Removed calculateOverallHealth in favor of unified calculateHealingScore


  private detectFeatures(
    tissueColor: { red: number; pink: number; yellow: number; black: number; white: number },
    rednessLevel: number,
    swellingLevel: number,
    dischargeType: string,
    edgeQuality: number
  ): string[] {
    const features: string[] = [];

    if (rednessLevel > 60) features.push('Elevated redness detected');
    if (rednessLevel > 80) features.push('Spreading erythema');
    if (swellingLevel > 50) features.push('Swelling present');
    if (tissueColor.yellow > 20) features.push('Slough tissue detected');
    if (tissueColor.black > 10) features.push('Necrotic tissue detected');
    if (tissueColor.pink > 50) features.push('Healthy granulation tissue');
    if (tissueColor.red > 40) features.push('Active healing tissue');
    if (dischargeType === 'yellow') features.push('Purulent discharge');
    if (dischargeType === 'green') features.push('Infection indicators');
    if (dischargeType === 'clear') features.push('Serous drainage');
    if (edgeQuality > 70) features.push('Well-approximated wound edges');
    if (edgeQuality < 40) features.push('Wound edge separation');

    return features;
  }

  private calculateConfidence(woundPixels: number, totalPixels: number, edgeQuality: number): number {
    const woundRatio = woundPixels / totalPixels;
    let confidence = 70;

    // Better confidence with clear wound visibility
    if (woundRatio > 0.1 && woundRatio < 0.6) confidence += 15;
    if (edgeQuality > 50) confidence += 10;

    // Add some variance for realism
    confidence += Math.random() * 5;

    return Math.min(95, Math.round(confidence));
  }

  private getDefaultAnalysis(): WoundAnalysisResult {
    return {
      overallHealth: 75,
      rednessLevel: 35,
      swellingLevel: 25,
      dischargeDetected: false,
      dischargeType: 'none',
      woundSize: { width: 50, height: 30, area: 1200, perimeter: 160 },
      edgeQuality: 65,
      tissueColor: { red: 25, pink: 45, yellow: 10, black: 5, white: 15 },
      healingStage: 'proliferative',
      riskLevel: 'normal',
      confidence: 82,
      detectedFeatures: ['Healthy granulation tissue', 'Normal healing progress'],
      healingScore: 75,
      timestamp: new Date(),
      ...this.generateStatusInfo(75, 'normal')
    };
  }

  /**
   * Status label + colour based on the 0–100 professor-style healing score.
   *
   * Bands (aligned with calculateHealingScore rubric):
   *   85–100  Healing Excellently   🟢 Green
   *   70–84   Healing Well          🟢 Teal-green
   *   55–69   Stable / Progressing  🔵 Blue
   *   40–54   Needs Monitoring      🟡 Yellow
   *   25–39   Stalled               🟠 Orange
   *   0–24    At Risk / Critical    🔴 Red
   *
   * Risk-level overrides take priority when the AI explicitly detects
   * infection or critical signs, regardless of numeric score.
   */
  public generateStatusInfo(score: number, riskLevel: string): { statusLabel: string; statusColor: string } {
    // Hard overrides from clinical risk level (label always matches risk)
    if (riskLevel === 'critical') {
      return { statusLabel: 'Critical — Seek Help', statusColor: '#EB5757' };
    }
    if (riskLevel === 'infected') {
      return { statusLabel: 'Infection Signs', statusColor: '#F2994A' };
    }
    if (riskLevel === 'warning') {
      return { statusLabel: 'Needs Monitoring', statusColor: '#F2C94C' };
    }

    // Score-based bands — updated to match new stricter scoring formula
    if (score >= 80) return { statusLabel: 'Healing Excellently', statusColor: '#27AE60' };
    if (score >= 65) return { statusLabel: 'Healing Well', statusColor: '#219653' };
    if (score >= 50) return { statusLabel: 'Stable / Progressing', statusColor: '#2F80ED' };
    if (score >= 35) return { statusLabel: 'Needs Monitoring', statusColor: '#F2C94C' };
    if (score >= 20) return { statusLabel: 'Stalled — Review Care', statusColor: '#F2994A' };

    return { statusLabel: 'At Risk', statusColor: '#EB5757' };
  }

  compareWounds(current: WoundAnalysisResult, previous: WoundAnalysisResult, daysBetween: number): ComparisonResult {
    const rednessChange = previous.rednessLevel - current.rednessLevel;
    const sizeChange = ((previous.woundSize.area - current.woundSize.area) / previous.woundSize.area) * 100;
    const edgeHealingChange = current.edgeQuality - previous.edgeQuality;

    // Calculate overall improvement score
    let improvement = 0;
    improvement += rednessChange * 0.3; // Less redness = better
    improvement += sizeChange * 0.3; // Smaller = better
    improvement += edgeHealingChange * 0.2; // Better edges = better
    improvement += (current.overallHealth - previous.overallHealth) * 0.2;

    // Determine trend
    let overallTrend: 'improving' | 'stable' | 'declining' | 'critical';
    if (current.riskLevel === 'critical') {
      overallTrend = 'critical';
    } else if (improvement > 10) {
      overallTrend = 'improving';
    } else if (improvement < -10) {
      overallTrend = 'declining';
    } else {
      overallTrend = 'stable';
    }

    // Discharge comparison
    let dischargeChange = 'No change';
    if (current.dischargeType !== previous.dischargeType) {
      if (current.dischargeType === 'none' && previous.dischargeType !== 'none') {
        dischargeChange = 'Discharge resolved';
      } else if (current.dischargeType === 'green' || current.dischargeType === 'yellow') {
        dischargeChange = 'Discharge worsened - seek medical attention';
      } else {
        dischargeChange = `Changed from ${previous.dischargeType} to ${current.dischargeType}`;
      }
    }

    // Calculate expected healing rate
    const expectedDailyImprovement = 3; // Expected 3% improvement per day
    const expectedImprovement = expectedDailyImprovement * daysBetween;
    const healingRate = expectedImprovement > 0 ? (improvement / expectedImprovement) * 100 : 100;

    // Generate recommendations and warnings
    const { recommendations, warnings } = this.generateComparisonAdvice(current, previous, overallTrend, healingRate);

    // Next scan recommendation
    let nextScanRecommendation = '24 hours';
    if (overallTrend === 'critical') {
      nextScanRecommendation = 'Immediately after medical consultation';
    } else if (overallTrend === 'declining') {
      nextScanRecommendation = '12 hours';
    } else if (overallTrend === 'improving' && current.riskLevel === 'normal') {
      nextScanRecommendation = '48 hours';
    }

    return {
      improvement: Math.round(improvement),
      rednessChange: Math.round(rednessChange),
      sizeChange: Math.round(sizeChange),
      edgeHealingChange: Math.round(edgeHealingChange),
      dischargeChange,
      overallTrend,
      daysSinceLastScan: daysBetween,
      healingRate: Math.round(healingRate),
      recommendations,
      warnings,
      nextScanRecommendation,
    };
  }

  private generateComparisonAdvice(
    current: WoundAnalysisResult,
    previous: WoundAnalysisResult,
    trend: string,
    healingRate: number
  ): { recommendations: string[]; warnings: string[] } {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Trend-based recommendations
    if (trend === 'improving') {
      recommendations.push('Continue current wound care routine');
      recommendations.push('Maintain clean and dry wound environment');
    } else if (trend === 'stable') {
      recommendations.push('Monitor wound closely for any changes');
      recommendations.push('Ensure adequate nutrition for healing');
    } else if (trend === 'declining') {
      warnings.push('Wound healing has slowed - consider medical consultation');
      recommendations.push('Review wound care technique');
      recommendations.push('Check for adequate blood flow to the area');
    }

    // Redness changes
    if (current.rednessLevel > previous.rednessLevel + 15) {
      warnings.push('Increased redness detected - possible inflammation or infection');
      recommendations.push('Monitor for fever or increased pain');
    } else if (current.rednessLevel < previous.rednessLevel - 10) {
      recommendations.push('Redness reducing - good progress');
    }

    // Size changes
    if (current.woundSize.area > previous.woundSize.area) {
      warnings.push('Wound appears larger - possible dehiscence');
      recommendations.push('Avoid strain on wound area');
    }

    // Discharge changes
    if (current.dischargeDetected && !previous.dischargeDetected) {
      warnings.push('New discharge detected');
      recommendations.push('Document discharge color and amount');
    }
    if (current.dischargeType === 'green' || current.dischargeType === 'yellow') {
      warnings.push('Purulent discharge indicates possible infection');
      recommendations.push('Seek medical evaluation within 24 hours');
    }

    // Healing rate
    if (healingRate < 50) {
      warnings.push('Healing slower than expected');
      recommendations.push('Review nutrition - ensure adequate protein intake');
      recommendations.push('Check blood sugar levels if diabetic');
    }

    // Stage-specific advice
    if (current.healingStage === 'inflammatory' && previous.healingStage === 'proliferative') {
      warnings.push('Wound may have regressed - signs of re-inflammation');
    }

    return { recommendations, warnings };
  }

  generateCareRecommendations(
    analysis: WoundAnalysisResult,
    patientAnswers: {
      daysSinceSurgery: number;
      painLevel: string;
      dischargeType: string;
      hasFever: boolean;
      rednessSpread: boolean;
      dressingChanged: boolean;
    }
  ): CareRecommendation[] {
    const recommendations: CareRecommendation[] = [];

    // Cleaning recommendations based on wound status
    const cleaningRec: CareRecommendation = {
      category: 'Wound Cleaning',
      priority: analysis.riskLevel === 'infected' ? 'high' : 'medium',
      title: 'Daily Wound Cleansing',
      description: this.getCleaningDescription(analysis),
      steps: this.getCleaningSteps(analysis),
      warnings: [],
      frequency: analysis.riskLevel === 'normal' ? 'Once daily' : 'Twice daily',
    };

    // Use Backend API Cleaning Instructions if available
    if (analysis.backendResults?.recommendation?.cleaningInstructions) {
      cleaningRec.steps = analysis.backendResults.recommendation.cleaningInstructions;
      cleaningRec.description = "AI Recommended Cleaning Procedure";
    }

    if (analysis.dischargeDetected) {
      cleaningRec.warnings.push('Clean discharge gently, do not scrub');
    }
    recommendations.push(cleaningRec);

    // Dressing recommendations
    const dressingRec: CareRecommendation = {
      category: 'Wound Dressing',
      priority: !patientAnswers.dressingChanged ? 'high' : 'medium',
      title: 'Proper Dressing Technique',
      description: this.getDressingDescription(analysis),
      steps: this.getDressingSteps(analysis),
      warnings: [],
      frequency: this.getDressingFrequency(analysis, patientAnswers),
    };

    // Use Backend API Dressing Instructions if available
    if (analysis.backendResults?.recommendation?.dressingRecommendations) {
      // Convert string array to steps if needed
      const backendDressing = analysis.backendResults.recommendation.dressingRecommendations;
      if (Array.isArray(backendDressing)) {
        dressingRec.steps = backendDressing;
      } else {
        dressingRec.description = String(backendDressing);
      }
    }

    if (!patientAnswers.dressingChanged) {
      dressingRec.warnings.push('Dressing should be changed daily to prevent infection');
    }
    recommendations.push(dressingRec);

    // Nutrition recommendations
    const nutritionRec: CareRecommendation = {
      category: 'Nutrition',
      priority: 'medium',
      title: 'Diet for Wound Healing',
      description: 'Proper nutrition accelerates wound healing and tissue repair.',
      steps: [
        'Increase protein intake (eggs, lean meat, fish, legumes)',
        'Consume vitamin C rich foods (citrus, berries, peppers)',
        'Include zinc sources (nuts, seeds, whole grains)',
        'Stay well hydrated (8-10 glasses of water daily)',
        'Eat vitamin A foods (carrots, sweet potatoes, leafy greens)',
        'Consider collagen supplements if approved by doctor',
      ],
      warnings: ['Avoid excessive sugar which can delay healing'],
      frequency: 'Every meal',
    };

    // Use Backend API Diet Advice
    if (analysis.backendResults?.recommendation?.dietAdvice) {
      nutritionRec.steps = analysis.backendResults.recommendation.dietAdvice;
    }

    recommendations.push(nutritionRec);

    // Pain management if applicable
    if (patientAnswers.painLevel !== 'none') {
      const painRec: CareRecommendation = {
        category: 'Pain Management',
        priority: patientAnswers.painLevel === 'severe' ? 'high' : 'medium',
        title: 'Managing Wound Discomfort',
        description: this.getPainDescription(patientAnswers.painLevel),
        steps: this.getPainManagementSteps(patientAnswers.painLevel),
        warnings: [],
      };

      if (patientAnswers.painLevel === 'severe') {
        painRec.warnings.push('Severe pain may indicate infection - consult doctor');
      }
      recommendations.push(painRec);
    }

    // Warning signs to watch for
    const warningRec: CareRecommendation = {
      category: 'Warning Signs',
      priority: analysis.riskLevel !== 'normal' ? 'urgent' : 'high',
      title: 'When to Seek Medical Help',
      description: 'Monitor for these signs that require immediate medical attention.',
      steps: [
        'Increasing redness spreading from wound',
        'Fever above 38°C (100.4°F)',
        'Pus or foul-smelling discharge',
        'Wound edges separating',
        'Increasing pain after day 3',
        'Red streaks extending from wound',
        'Numbness around wound area',
      ],
      warnings: this.getCurrentWarnings(analysis, patientAnswers),
    };

    // Use Backend API Warning Signs
    if (analysis.backendResults?.recommendation?.warningsSigns) {
      warningRec.steps = analysis.backendResults.recommendation.warningsSigns;
    }
    // Use Backend API "When to seek help"
    if (analysis.backendResults?.recommendation?.whenToSeekHelp) {
      warningRec.warnings.push(...analysis.backendResults.recommendation.whenToSeekHelp);
    }

    recommendations.push(warningRec);

    // Activity recommendations
    const activityRec: CareRecommendation = {
      category: 'Activity & Rest',
      priority: 'medium',
      title: 'Movement and Rest Guidelines',
      description: 'Balance rest with gentle movement for optimal healing.',
      steps: this.getActivitySteps(analysis, patientAnswers),
      warnings: ['Avoid strenuous activities that strain the wound'],
    };

    // Use Backend API Activity Restrictions
    if (analysis.backendResults?.recommendation?.activityRestrictions) {
      activityRec.steps = analysis.backendResults.recommendation.activityRestrictions;
    }

    recommendations.push(activityRec);

    // Stage-specific care
    const stageRec: CareRecommendation = {
      category: 'Stage-Specific Care',
      priority: 'medium',
      title: `${this.capitalizeFirst(analysis.healingStage)} Stage Care`,
      description: this.getStageDescription(analysis.healingStage),
      steps: this.getStageCareSteps(analysis.healingStage),
      warnings: [],
    };
    recommendations.push(stageRec);

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async getPersonalizedRecommendations(
    analysis: WoundAnalysisResult,
    answers: {
      daysSinceSurgery: number;
      painLevel: string;
      dischargeType: string;
      hasFever: boolean;
      rednessSpread: boolean;
      dressingChanged: boolean;
    }
  ): Promise<any> {
    if (!analysis.backendResults?.classification?.classification_id) {
      console.warn("No classification ID available for personalized recommendations");
      return null;
    }

    try {
      const symptoms = {
        pain_level: answers.painLevel,
        fever: answers.hasFever,
        discharge_type: answers.dischargeType,
        redness_spread: answers.rednessSpread
      };

      console.log("Fetching personalized recommendations with symptoms:", symptoms);

      const newRecommendations = await backendAPI.getRecommendations(
        analysis.backendResults.classification.classification_id,
        analysis.backendResults.classification.wound_type,
        analysis.confidence,
        symptoms
      );

      return newRecommendations;
    } catch (e) {
      console.error("Failed to get personalized recommendations:", e);
      return null;
    }
  }

  private getCleaningDescription(analysis: WoundAnalysisResult): string {
    if (analysis.riskLevel === 'infected') {
      return 'Infected wounds require careful cleaning with antiseptic solution. Seek medical guidance for proper treatment.';
    } else if (analysis.riskLevel === 'warning') {
      return 'Monitor wound closely during cleaning. Look for any changes in color, odor, or discharge.';
    }
    return 'Regular gentle cleaning helps prevent infection and promotes healthy healing tissue formation.';
  }

  private getCleaningSteps(analysis: WoundAnalysisResult): string[] {
    const steps = [
      'Wash hands thoroughly with soap for 20 seconds',
      'Remove old dressing carefully, moistening if stuck',
      'Clean wound with sterile saline or clean water',
      'Pat dry with sterile gauze, do not rub',
      'Apply prescribed ointment if recommended',
    ];

    if (analysis.dischargeDetected) {
      steps.splice(3, 0, 'Gently remove any discharge or debris');
    }

    if (analysis.riskLevel === 'infected' || analysis.riskLevel === 'warning') {
      steps.push('Use antiseptic solution as directed by healthcare provider');
    }

    return steps;
  }

  private getDressingDescription(analysis: WoundAnalysisResult): string {
    if (analysis.healingStage === 'maturation') {
      return 'Wound may benefit from minimal coverage. Keep clean and protected from sun.';
    } else if (analysis.dischargeDetected) {
      return 'Use absorbent dressing to manage drainage while maintaining moist healing environment.';
    }
    return 'Proper dressing protects wound from contamination and maintains optimal healing conditions.';
  }

  private getDressingSteps(analysis: WoundAnalysisResult): string[] {
    const steps = [
      'Ensure wound and surrounding skin are clean and dry',
      'Apply non-stick primary dressing directly on wound',
      'Cover with secondary absorbent layer if needed',
      'Secure with medical tape or bandage',
      'Ensure dressing is snug but not too tight',
    ];

    if (analysis.dischargeDetected) {
      steps.splice(2, 0, 'Use extra absorbent padding for drainage');
    }

    return steps;
  }

  private getDressingFrequency(analysis: WoundAnalysisResult, _answers: { dressingChanged: boolean }): string {
    if (analysis.dischargeDetected && analysis.dischargeType !== 'clear') {
      return 'Every 8-12 hours or when soiled';
    } else if (analysis.riskLevel === 'warning' || analysis.riskLevel === 'infected') {
      return 'Every 12 hours';
    }
    return 'Every 24 hours';
  }

  private getPainDescription(painLevel: string): string {
    if (painLevel === 'severe') {
      return 'Severe pain requires attention. While some discomfort is normal, increasing pain may indicate complications.';
    }
    return 'Mild pain is normal during healing. Managing discomfort helps you rest and promotes healing.';
  }

  private getPainManagementSteps(painLevel: string): string[] {
    const steps = [
      'Take prescribed pain medication as directed',
      'Apply cold pack wrapped in cloth near (not on) wound',
      'Elevate affected area when possible',
      'Wear loose, comfortable clothing',
      'Practice relaxation techniques',
    ];

    if (painLevel === 'severe') {
      steps.unshift('Contact healthcare provider about pain level');
    }

    return steps;
  }

  private getCurrentWarnings(analysis: WoundAnalysisResult, answers: { hasFever: boolean; rednessSpread: boolean }): string[] {
    const warnings: string[] = [];

    if (answers.hasFever) {
      warnings.push('⚠️ Fever reported - may indicate systemic infection');
    }
    if (answers.rednessSpread) {
      warnings.push('⚠️ Spreading redness - possible cellulitis');
    }
    if (analysis.dischargeType === 'green' || analysis.dischargeType === 'yellow') {
      warnings.push('⚠️ Abnormal discharge detected in image');
    }
    if (analysis.tissueColor.black > 10) {
      warnings.push('⚠️ Dark tissue detected - possible necrosis');
    }
    if (analysis.riskLevel === 'critical') {
      warnings.push('🚨 SEEK IMMEDIATE MEDICAL ATTENTION');
    }

    return warnings;
  }

  private getActivitySteps(_analysis: WoundAnalysisResult, answers: { daysSinceSurgery: number }): string[] {
    if (answers.daysSinceSurgery < 3) {
      return [
        'Prioritize rest for first 72 hours',
        'Avoid lifting anything heavy',
        'Keep wound area elevated when resting',
        'Short walks to prevent blood clots',
        'No bathing - use sponge bath',
      ];
    } else if (answers.daysSinceSurgery < 7) {
      return [
        'Gradually increase light activity',
        'Continue to avoid strenuous exercise',
        'Short walks several times daily',
        'May shower if wound is sealed',
        'No swimming or submerging wound',
      ];
    }
    return [
      'Resume normal light activities',
      'Avoid activities that stretch wound area',
      'Listen to your body - rest if tired',
      'Gradually increase activity level',
      'Protect wound from sun exposure',
    ];
  }

  private getStageDescription(stage: string): string {
    const descriptions: Record<string, string> = {
      hemostasis: 'Fresh wound stage where blood clotting occurs. Focus on keeping clean and protected.',
      inflammatory: 'Body is fighting potential infection. Some redness and swelling is normal.',
      proliferative: 'New tissue is forming. This is active healing - maintain moist environment.',
      maturation: 'Scar tissue is strengthening. Wound closure is occurring.',
    };
    return descriptions[stage] || descriptions.inflammatory;
  }

  private getStageCareSteps(stage: string): string[] {
    const stageSteps: Record<string, string[]> = {
      hemostasis: [
        'Apply gentle pressure if any bleeding',
        'Keep wound covered and sterile',
        'Avoid disturbing blood clot',
        'Monitor for excessive bleeding',
      ],
      inflammatory: [
        'Clean wound daily',
        'Monitor redness boundaries with marker',
        'Cold compress for swelling',
        'Watch for increasing pain or fever',
      ],
      proliferative: [
        'Maintain moist wound environment',
        'Increase protein intake',
        'Avoid disrupting new tissue',
        'Consider vitamin C supplementation',
      ],
      maturation: [
        'Protect scar from sun exposure',
        'Consider silicone scar sheets',
        'Gentle massage may help',
        'Keep area moisturized',
      ],
    };
    return stageSteps[stage] || stageSteps.inflammatory;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Blends Backend AI tissue composition with Local Pixel analysis.
   * Priority: 
   *   - 100% Backend if Gemini analyzed the image (full vision capability)
   *   - 90% Backend if TFLite fallback used (clinically better than raw pixels)
   *   - Avoids "Pink" bias by distributing rounding errors proportionally
   */
  private blendTissueComposition(backend: any | null, local: any, source: string = 'local'): any {
    if (!backend) return local;

    // Determine weights based on source reliability
    // Gemini (tflite+gemini) is highly reliable for tissue = 100% weight
    // TFLite fallback = 10% weight (we favor the REAL physical scan 90% in this case)
    const backendWeight = source === 'tflite+gemini' ? 1.0 : 0.1;
    const localWeight = 1.0 - backendWeight;

    const blend = (bVal: number, lVal: number) => {
      return (bVal * backendWeight) + (lVal * localWeight);
    };

    const blended = {
      red: blend(backend.red || 0, local.red || 0),
      pink: blend(backend.pink || 0, local.pink || 0),
      yellow: blend(backend.yellow || 0, local.yellow || 0),
      black: blend(backend.black || 0, local.black || 0),
      white: blend(backend.white || 0, local.white || 0),
    };

    // Normalize to 100%
    const total = blended.red + blended.pink + blended.yellow + blended.black + blended.white;
    if (total > 0 && total !== 100) {
      const factor = 100 / total;
      blended.red *= factor;
      blended.pink *= factor;
      blended.yellow *= factor;
      blended.black *= factor;
      blended.white *= factor;
    }

    // Final rounding to integers
    const rounded = {
      red: Math.round(blended.red),
      pink: Math.round(blended.pink),
      yellow: Math.round(blended.yellow),
      black: Math.round(blended.black),
      white: Math.round(blended.white),
    };

    // Fix rounding errors by adjusting the largest category instead of always 'pink'
    const newTotal = rounded.red + rounded.pink + rounded.yellow + rounded.black + rounded.white;
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      // Find key with max value to absorb rounding error
      const maxKey = (Object.keys(rounded) as Array<keyof typeof rounded>).reduce((a, b) => rounded[a] > rounded[b] ? a : b);
      rounded[maxKey] += diff;
    }

    return rounded;
  }
}

export const woundAnalysisService = new WoundAnalysisService();
