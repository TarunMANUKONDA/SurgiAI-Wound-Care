import { useState } from 'react';
import { Screen } from '../types';

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const slides = [
  {
    id: 1,
    icon: '🩹',
    title: 'Track Your Healing',
    description: 'Monitor your surgical wound recovery with AI-powered image analysis that detects changes over time.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    icon: '📸',
    title: 'Smart Image Analysis',
    description: 'Take photos of your wound and get instant AI analysis including redness levels, tissue health, and healing stage.',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 3,
    icon: '📊',
    title: 'Compare Progress',
    description: 'View side-by-side comparisons of your wound over time to track improvement or detect concerning changes early.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 4,
    icon: '💊',
    title: 'Personalized Care Advice',
    description: 'Receive tailored care recommendations based on your wound analysis and symptoms to support optimal healing.',
    color: 'from-orange-500 to-red-600',
  },
];

export function OnboardingScreen({ onNavigate }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onNavigate('login');
    }
  };

  const handleSkip = () => {
    onNavigate('login');
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
          Skip
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
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
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </button>

        {currentSlide === slides.length - 1 && (
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#2F80ED] font-medium"
            >
              Sign In
            </button>
          </p>
        )}
      </div>

      {/* App References */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-xs text-gray-400 text-center mb-3">Trusted by Healthcare Professionals</p>
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2F80ED]">50K+</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#27AE60]">95%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">4.8★</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
