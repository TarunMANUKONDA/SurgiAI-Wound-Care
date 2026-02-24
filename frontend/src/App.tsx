import { useState, useCallback, useEffect } from 'react';
import { Screen, WoundImage, PatientAnswers, WoundType } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { QuestionsScreen } from './screens/QuestionsScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { CareAdviceScreen } from './screens/CareAdviceScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ChatAssistantScreen } from './screens/ChatAssistantScreen';
import { WoundTypesScreen } from './screens/WoundTypesScreen';
import { WoundDetailScreen } from './screens/WoundDetailScreen';
import { VisualLibraryScreen } from './screens/VisualLibraryScreen';
import { HealingLevelsScreen } from './screens/HealingLevelsScreen';
import { DailyTipsScreen } from './screens/DailyTipsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WoundProgressScreen } from './screens/WoundProgressScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { OTPVerificationScreen } from './screens/OTPVerificationScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { woundAnalysisService, CareRecommendation } from './services/WoundAnalysisService';
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';
import { LegalScreen } from './screens/LegalScreen';
import { App as CapacitorApp } from '@capacitor/app';
import { AlertBanner } from './screens/AlertBanner';
import { notificationService } from './services/NotificationService';

// Onboarding helper functions
const hasSeenOnboarding = (): boolean => {
  return localStorage.getItem('hasSeenOnboarding') === 'true';
};

const markOnboardingSeen = () => {
  localStorage.setItem('hasSeenOnboarding', 'true');
};

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { settings } = useAppSettings();
  const [hasOnboarded, setHasOnboarded] = useState(hasSeenOnboarding);

  // ── Initialise notification service once on mount ──────────────────────
  useEffect(() => {
    notificationService.init();
  }, []);

  // ── Check scan reminder whenever user logs in / app reopens ───────────
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.checkScanReminder(settings.notifications.progressReminders);
    }
  }, [isAuthenticated, settings.notifications.progressReminders]);

  // ── Sync daily-tip schedule when setting changes ───────────────────────
  useEffect(() => {
    notificationService.scheduleDailyTipNotif(settings.notifications.dailyTips);
  }, [settings.notifications.dailyTips]);

  // Determine initial screen based on auth state
  const getInitialScreen = (): Screen => {
    if (!hasOnboarded) return 'onboarding';
    if (!isAuthenticated) return 'login';
    return 'home';
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);
  const [history, setHistory] = useState<Screen[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [patientAnswers, setPatientAnswers] = useState<PatientAnswers | null>(null);
  const [selectedWoundType, setSelectedWoundType] = useState<WoundType | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedWoundForProgress, setSelectedWoundForProgress] = useState<WoundImage | null>(null);
  const [careRecommendations, setCareRecommendations] = useState<CareRecommendation[]>([]);
  const [otpEmail, setOtpEmail] = useState<string>('');
  const [otpInitialMessage, setOtpInitialMessage] = useState<string | undefined>();
  const [legalType, setLegalType] = useState<'privacy' | 'terms'>('privacy');

  const {
    woundHistory,
    currentAnalysis,
    setCurrentAnalysis,
    comparisonResult,
    setCurrentImage,
    compareWithPrevious,
    saveToHistory,
    persistAdjustedAnalysis
  } = useAnalysis();

  // Convert context wound history to WoundImage format for components
  const convertedHistory: WoundImage[] = woundHistory.map(w => ({
    id: w.id,
    url: w.imageData,
    date: new Date(w.timestamp),
    status: w.analysis.riskLevel,
    healingStage: w.analysis.healingStage,
    notes: w.notes,
  }));

  const navigate = useCallback((screen: Screen, options?: { replace?: boolean }) => {
    // Basic routing for legal screen types
    let targetScreen = screen;
    if (screen.startsWith('legal-')) {
      const type = screen.split('-')[1] as 'privacy' | 'terms';
      setLegalType(type);
      targetScreen = 'legal';
    }

    if (!options?.replace) {
      setHistory(prev => [...prev, currentScreen]);
    }
    setCurrentScreen(targetScreen);
  }, [currentScreen]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousScreen = newHistory.pop();
      if (previousScreen) {
        setHistory(newHistory);
        setCurrentScreen(previousScreen);
      }
    } else {
      // Exit app if on home/login and no history
      if (['home', 'login'].includes(currentScreen)) {
        CapacitorApp.exitApp();
      }
    }
  }, [history, currentScreen]);

  // Handle hardware back button
  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      goBack();
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [goBack]);

  // Auth handlers
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('login', { replace: true });
    setHistory([]); // Clear history on logout
  }, [logout, navigate]);
  // Handle onboarding completion
  useEffect(() => {
    if (currentScreen === 'login' && !hasOnboarded) {
      markOnboardingSeen();
      setHasOnboarded(true);
    }
  }, [currentScreen, hasOnboarded]);

  // Redirect to login if not authenticated (and not on auth screens)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasOnboarded) {
      if (!['onboarding', 'login', 'signup', 'forgot-password'].includes(currentScreen)) {
        navigate('login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, currentScreen, hasOnboarded, navigate]);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl);
    setCurrentImage(imageUrl);
  }, [setCurrentImage]);

  const handleAnswersSubmit = useCallback(async (answers: PatientAnswers) => {
    setPatientAnswers(answers);

    // Map answers to service format
    const serviceAnswers = {
      daysSinceSurgery: answers.daysSinceSurgery,
      painLevel: answers.painLevel,
      dischargeType: answers.discharge,
      hasFever: answers.fever,
      rednessSpread: answers.rednessSpread,
      dressingChanged: answers.dressingChanged
    };

    // If we have an image, perform full analysis
    if (uploadedImage && currentAnalysis) {
      let analysisToUse = currentAnalysis;

      // 1. Fetch Personalized Recommendations from Backend
      try {
        const personalized = await woundAnalysisService.getPersonalizedRecommendations(currentAnalysis, serviceAnswers);

        if (personalized && personalized.success) {
          // 2. Merge new data into analysis
          const backendRisk = personalized.risk_level || 'Normal';
          let mappedRisk: 'normal' | 'warning' | 'infected' | 'critical' = 'normal';

          if (backendRisk.includes('Critical')) mappedRisk = 'critical';
          else if (backendRisk.includes('High') || backendRisk.includes('Infected')) mappedRisk = 'infected';
          else if (backendRisk.includes('Moderate')) mappedRisk = 'warning';

          const finalHealth = personalized.severity_score
            ? Math.max(0, Math.min(100, 100 - Math.round((personalized.severity_score / 300) * 100)))
            : currentAnalysis.overallHealth;

          analysisToUse = {
            ...currentAnalysis,
            riskLevel: mappedRisk,
            overallHealth: finalHealth,
            healingScore: finalHealth,
            backendResults: {
              ...currentAnalysis.backendResults,
              recommendation: personalized.recommendation,
              raw_risk: personalized.risk_level
            },
            detectedFeatures: [
              ...currentAnalysis.detectedFeatures.filter(f => !f.startsWith('Risk:')),
              `Risk: ${personalized.risk_level} (Symptom Adjusted)`
            ]
          };

          // Update context
          setCurrentAnalysis(analysisToUse);

          // PERSIST: Save the symptomatic-adjusted analysis back to the backend
          const woundId = currentAnalysis.backendResults.upload?.wound_id;
          if (woundId) {
            persistAdjustedAnalysis(woundId, analysisToUse);
          }

          // ── FIRE NOTIFICATION based on final risk ──────────────────────
          const nextScanHours = mappedRisk === 'critical' ? 6
            : mappedRisk === 'infected' ? 12
              : mappedRisk === 'warning' ? 24
                : 48;
          notificationService.onAnalysisComplete(
            mappedRisk,
            finalHealth,
            nextScanHours,
            settings.notifications.push
          );
          notificationService.recordScan(mappedRisk);
        }
      } catch (e) {
        console.error("Error fetching personalized recs:", e);
      }

      // 3. Generate local care cards (now using updated backend data)
      const recs = woundAnalysisService.generateCareRecommendations(analysisToUse, {
        daysSinceSurgery: answers.daysSinceSurgery,
        painLevel: answers.painLevel,
        dischargeType: answers.discharge,
        hasFever: answers.fever,
        rednessSpread: answers.rednessSpread,
        dressingChanged: answers.dressingChanged,
      });
      setCareRecommendations(recs);

      // 4. Compare with previous if exists (using updated analysis)
      if (woundHistory.length > 0) {
        compareWithPrevious(analysisToUse);
      }
    }

    navigate('preview');
  }, [navigate, uploadedImage, currentAnalysis, woundHistory, compareWithPrevious, settings.notifications.push]);

  const handleAddToHistory = useCallback(() => {
    saveToHistory();
  }, [saveToHistory]);

  const handleSelectWoundType = useCallback((woundType: WoundType) => {
    setSelectedWoundType(woundType);
    navigate('wound-detail');
  }, [navigate]);

  const handleSelectWound = useCallback((wound: WoundImage) => {
    setSelectedWoundForProgress(wound);
    navigate('wound-progress');
  }, [navigate]);

  const handleAddNewScan = useCallback(async (_newImage: WoundImage) => {
    // Refresh history to reflect the newly added scan
    saveToHistory();
  }, [saveToHistory]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onNavigate={navigate} />;
      case 'login':
        return <LoginScreen onNavigate={navigate} />;
      case 'signup':
        return (
          <SignUpScreen
            onNavigate={navigate}
            onSignupSuccess={(email, message) => {
              setOtpEmail(email);
              setOtpInitialMessage(message);
              navigate('otp-verify');
            }}
          />
        );
      case 'otp-verify':
        return (
          <OTPVerificationScreen
            email={otpEmail}
            initialMessage={otpInitialMessage}
            onNavigate={navigate}
            onVerified={() => navigate('login', { replace: true })}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordScreen onNavigate={navigate} />;
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'upload':
        return (
          <UploadScreen
            onNavigate={navigate}
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
          />
        );
      case 'questions':
        return (
          <QuestionsScreen
            onNavigate={navigate}
            onSubmit={handleAnswersSubmit}
          />
        );
      case 'preview':
        return (
          <PreviewScreen
            onNavigate={navigate}
            currentImage={uploadedImage}
            previousImage={convertedHistory[0]?.url || null}
            compareMode={compareMode}
            onToggleCompare={() => setCompareMode(!compareMode)}
            analysis={currentAnalysis}
            comparison={comparisonResult}
          />
        );
      case 'progress':
        return (
          <ProgressScreen
            onNavigate={navigate}
            patientAnswers={patientAnswers}
            analysis={currentAnalysis}
          />
        );
      case 'advice':
        return (
          <CareAdviceScreen
            onNavigate={navigate}
            patientAnswers={patientAnswers}
            onSaveToHistory={handleAddToHistory}
            analysis={currentAnalysis}
            recommendations={careRecommendations}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onNavigate={navigate}
            onGoBack={goBack}
            history={convertedHistory}
            onSelectWound={handleSelectWound}
          />
        );
      case 'wound-progress':
        return (
          <WoundProgressScreen
            onNavigate={navigate}
            onGoBack={goBack}
            woundHistory={convertedHistory}
            onAddNewScan={handleAddNewScan}
            selectedWound={selectedWoundForProgress}
          />
        );
      case 'chat':
        return (
          <ChatAssistantScreen
            onNavigate={navigate}
          />
        );
      case 'wound-types':
        return (
          <WoundTypesScreen
            onNavigate={navigate}
            onSelectType={handleSelectWoundType}
          />
        );
      case 'wound-detail':
        return (
          <WoundDetailScreen
            onNavigate={navigate}
            woundType={selectedWoundType}
          />
        );
      case 'visual-library':
        return <VisualLibraryScreen onNavigate={navigate} />;
      case 'healing-levels':
        return <HealingLevelsScreen onNavigate={navigate} />;
      case 'daily-tips':
        return <DailyTipsScreen onNavigate={navigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigate} onLogout={handleLogout} currentUser={user} />;
      case 'notification-settings':
        return <NotificationSettingsScreen onNavigate={navigate} />;
      case 'help-support':
        return <HelpSupportScreen onNavigate={navigate} />;
      case 'legal':
        return <LegalScreen onNavigate={navigate} type={legalType} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2F80ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-colors duration-200">
      {/* Global alert overlay — appears above all screens */}
      <AlertBanner onNavigate={navigate} />
      {renderScreen()}
    </div>
  );
}

export function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <AnalysisProvider>
          <AppContent />
        </AnalysisProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
