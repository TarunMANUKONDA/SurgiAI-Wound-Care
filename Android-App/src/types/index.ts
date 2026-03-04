import { WoundAnalysisResult } from '../services/WoundAnalysisService';

export interface WoundCase {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  status: 'active' | 'archived';
  woundCount: number;
  latestImage?: string;
  startDate?: string;
  lastUpdate?: string;
}

export interface WoundImage {
  id: string;
  caseId?: string;
  url: string;
  date: Date;
  status: 'normal' | 'warning' | 'infected' | 'critical';
  healingStage: HealingStage;
  notes?: string;
  healingProgress?: number; // 0-100 percentage
  analysis?: WoundAnalysisResult; // Full analysis data
}

export interface WoundRecord {
  id: string;
  name: string;
  createdAt: Date;
  images: WoundImage[];
  currentStatus: 'normal' | 'warning' | 'infected' | 'critical';
  overallProgress: number;
}

export type HealingStage = 'hemostasis' | 'inflammatory' | 'proliferative' | 'maturation';

export interface PatientAnswers {
  daysSinceSurgery: number;
  painLevel: 'none' | 'mild' | 'severe';
  discharge: 'no' | 'clear' | 'yellow' | 'green';
  fever: boolean;
  rednessSpread: boolean;
  dressingChanged: boolean;
}

export interface WoundType {
  id: string;
  name: string;
  category: 'classification' | 'type';
  definition: string;
  examples: string[];
  healingTime: string;
  normalAppearance: string;
  dangerSigns: string[];
  careSteps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export type Screen =
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'otp-verify'
  | 'forgot-password'
  | 'home'
  | 'upload'
  | 'questions'
  | 'preview'
  | 'progress'
  | 'advice'
  | 'history'
  | 'chat'
  | 'wound-types'
  | 'wound-detail'
  | 'visual-library'
  | 'healing-levels'
  | 'daily-tips'
  | 'profile'
  | 'wound-progress'
  | 'notification-settings'
  | 'help-support'
  | 'legal';

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  bloodType?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  profileImage?: string;
  createdAt: Date;
}

export interface AppSettings {
  language: 'en' | 'hi' | 'te' | 'ta';
  notifications: {
    push: boolean;
    email: boolean;
    dailyTips: boolean;
    progressReminders: boolean;
  };
}
