// Type definitions for wound classification and AI recommendations

export interface WoundClassificationResult {
    // Classification results
    predictedClass: string;
    classLabel: string; // Human-readable label (e.g., "Surgical Incision", "Pressure Ulcer")
    confidence: number; // 0-100
    probabilities: {
        className: string;
        probability: number;
    }[];

    // Similar images from reference dataset
    similarImages: SimilarWound[];

    // Extracted features for similarity search
    features?: number[];

    timestamp: Date;
}

export interface SimilarWound {
    id: string;
    imageUrl: string;
    woundType: string;
    similarity: number; // 0-1 (cosine similarity)
    metadata?: {
        healingStage?: string;
        daysSinceInjury?: number;
    };
}

export interface AIRecommendation {
    // AI-generated recommendations
    summary: string;
    detailedAdvice: string[];

    // Care instructions
    cleaningInstructions: string[];
    dressingRecommendations: string[];
    medicationSuggestions?: string[];

    // Timeline
    expectedHealingTime: string;
    followUpSchedule: string[];

    // Warnings
    warningsSigns: string[];
    whenToSeekHelp: string[];

    // Lifestyle recommendations
    dietAdvice?: string[];
    activityRestrictions?: string[];

    // Confidence and source
    confidence: number;
    source: 'openai' | 'gemini' | 'custom';
    timestamp: Date;
}

export interface AIAPIRequest {
    woundType: string;
    classification: WoundClassificationResult;
    patientContext?: {
        daysSinceSurgery?: number;
        painLevel?: string;
        hasFever?: boolean;
        otherSymptoms?: string[];
    };
    existingAnalysis?: any; // Color-based analysis from WoundAnalysisService
}

export interface AIAPIResponse {
    success: boolean;
    recommendation?: AIRecommendation;
    error?: string;
}

// Configuration
export interface ClassificationConfig {
    modelPath: string;
    inputSize: number;
    labels: string[];
    similarityThreshold: number; // Minimum similarity to show
    maxSimilarImages: number;
}

export interface AIAPIConfig {
    provider: 'openai' | 'gemini' | 'custom';
    apiKey: string;
    model?: string; // e.g., 'gpt-4', 'gemini-pro'
    temperature?: number;
    maxTokens?: number;
}
