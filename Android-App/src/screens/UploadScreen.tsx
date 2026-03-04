import { useRef, useState } from 'react';
import { Screen } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import { backendAPI } from '../services/BackendAPIService';
import { useAppSettings } from '../context/AppSettingsContext';

interface UploadScreenProps {
  onNavigate: (screen: Screen) => void;
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
}

interface ValidationResult {
  isValid: boolean;
  isBlur: boolean;
  hasWound: boolean;
  isHealed?: boolean;
  blurScore?: number;
  woundConfidence?: number;
  message: string;
}

export function UploadScreen({ onNavigate, onImageUpload, uploadedImage }: UploadScreenProps) {
  const { t } = useAppSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentImage, analyzeImage, isAnalyzing, currentCase } = useAnalysis();
  const [previewAnalysis, setPreviewAnalysis] = useState<{
    detectedFeatures: string[];
    confidence: number;
    woundLocation?: [number, number, number, number];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        onImageUpload(imageData);
        setCurrentImage(imageData);
        setPreviewAnalysis(null);
        setValidationResult(null);

        // Validate image first
        setIsValidating(true);
        try {
          const validation = await backendAPI.validateImage(imageData);
          console.log('Validation result:', validation);

          setValidationResult({
            isValid: validation.is_valid,
            isBlur: validation.is_blur,
            hasWound: validation.has_wound,
            isHealed: validation.is_healed,
            blurScore: validation.blur_score,
            woundConfidence: validation.wound_confidence,
            message: validation.message
          });

          // Only proceed with analysis if validation passed AND wound is NOT healed
          if (validation.is_valid && !validation.is_healed) {
            try {
              const analysis = await analyzeImage(imageData, currentCase?.id);
              setPreviewAnalysis({
                detectedFeatures: analysis.detectedFeatures.slice(0, 3),
                confidence: analysis.confidence,
                woundLocation: analysis.woundLocation,
              });
            } catch (error) {
              console.error('Preview analysis failed:', error);
            }
          }
          // If healed, we don't run analysis - validation message will inform user
        } catch (error) {
          console.error('Validation failed:', error);
          setValidationResult({
            isValid: false,
            isBlur: false,
            hasWound: false,
            message: '✗ Validation service unavailable. Please try again later.'
          });
        } finally {
          setIsValidating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleClearImage = () => {
    onImageUpload('');
    setCurrentImage(null);
    setPreviewAnalysis(null);
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('uploadWoundImage')}</h1>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instruction */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              {t('photoInstruction')}
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• {t('instructionFocus')}</li>
              <li>• {t('instructionDistance')}</li>
              <li>• {t('instructionLight')}</li>
              <li>• {t('instructionClean')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCameraClick}
          disabled={isAnalyzing}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-[#2F80ED] disabled:opacity-50"
        >
          <div className="w-14 h-14 bg-[#2F80ED] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-800">{t('camera')}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('takePhotoNow')}</p>
        </button>

        <button
          onClick={handleGalleryClick}
          disabled={isAnalyzing}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-[#2F80ED] disabled:opacity-50"
        >
          <div className="w-14 h-14 bg-[#27AE60] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-800">{t('gallery')}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('chooseExisting')}</p>
        </button>
      </div>

      {/* Preview Area */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">{t('imagePreview')}</h3>
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Wound preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            {previewAnalysis?.woundLocation && (
              <div
                className="absolute border-2 border-green-500 bg-green-500/10 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                style={{
                  top: `${previewAnalysis.woundLocation[0] / 10}%`,
                  left: `${previewAnalysis.woundLocation[1] / 10}%`,
                  width: `${(previewAnalysis.woundLocation[3] - previewAnalysis.woundLocation[1]) / 10}%`,
                  height: `${(previewAnalysis.woundLocation[2] - previewAnalysis.woundLocation[0]) / 10}%`,
                }}
              />
            )}
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Validation Overlay */}
            {isValidating && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-white font-medium">{t('validatingImage')}</p>
                </div>
              </div>
            )}

            {/* Validation Result */}
            {validationResult && !isValidating && !validationResult.isValid && (
              <div className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">{t('validationFailed')}</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{validationResult.message}</p>
                  <button
                    onClick={handleClearImage}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {t('retakePhoto')}
                  </button>
                </div>
              </div>
            )}

            {/* Healed Wound Info */}
            {validationResult && !isValidating && validationResult.isValid && validationResult.isHealed && (
              <div className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">{t('healedWound')}</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{validationResult.message}</p>
                  <div className="space-y-2">
                    <button
                      onClick={handleClearImage}
                      className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {t('uploadDifferent')}
                    </button>
                    <button
                      onClick={() => onNavigate('home')}
                      className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {t('backToHome')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-white font-medium">{t('analyzingImage')}</p>
                </div>
              </div>
            )}

            {/* Quick Analysis Results */}
            {previewAnalysis && !isAnalyzing && validationResult?.isValid && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">✓ {t('validatedAnalyzed')}</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {t('confidenceLevel', { confidence: previewAnalysis.confidence })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {previewAnalysis.detectedFeatures.map((feature, idx) => (
                    <span key={idx} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">{t('noImageSelected')}</p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={() => uploadedImage && validationResult?.isValid && !validationResult?.isHealed && onNavigate('questions')}
        disabled={!uploadedImage || isAnalyzing || isValidating || !validationResult?.isValid || validationResult?.isHealed}
        className={`w-full py-4 px-6 rounded-2xl font-medium text-lg transition-all duration-200 flex items-center justify-center gap-3 ${uploadedImage && validationResult?.isValid && !validationResult?.isHealed && !isAnalyzing && !isValidating
          ? 'bg-[#2F80ED] hover:bg-[#2563eb] text-white shadow-lg shadow-blue-200'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {isValidating
          ? t('validating')
          : validationResult?.isHealed
            ? t('healedWoundNoAnalysis')
            : validationResult?.isValid
              ? t('continueToQuestions')
              : t('validationRequired')}
      </button>

      {/* Safety Note */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">
            {t('safetyNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
