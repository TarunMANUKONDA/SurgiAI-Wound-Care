import { useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useAppSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      icon: '🩹',
      title: t('onboardingSlide1Title'),
      description: t('onboardingSlide1Desc'),
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 2,
      icon: '📸',
      title: t('onboardingSlide2Title'),
      description: t('onboardingSlide2Desc'),
      color: 'from-green-500 to-teal-600',
    },
    {
      id: 3,
      icon: '📊',
      title: t('onboardingSlide3Title'),
      description: t('onboardingSlide3Desc'),
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 4,
      icon: '💊',
      title: t('onboardingSlide4Title'),
      description: t('onboardingSlide4Desc'),
      color: 'from-orange-500 to-red-600',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
        >
          {t('skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl mb-8`}>
          <span className="text-6xl">{slide.icon}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-center text-lg max-w-sm leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-[#2F80ED] w-8'
                : 'bg-gray-300'
                }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={handleNext}
          className="w-full bg-[#2F80ED] hover:bg-[#2563eb] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all duration-200"
        >
          {currentSlide < slides.length - 1 ? t('next') : t('getStarted')}
        </button>

        {currentSlide === slides.length - 1 && (
          <p className="text-center text-gray-400 text-sm mt-4">
            {t('alreadyHaveAccount')}{' '}
            <button
              onClick={() => onComplete()}
              className="text-[#2F80ED] font-medium"
            >
              {t('signIn')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
