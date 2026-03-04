import { useState, useMemo } from 'react';
import { Screen } from '../types';
import { useAppSettings } from '../context/AppSettingsContext';

interface ChatScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  faqs: FAQ[];
}

const FAQ_METADATA = [
  {
    id: 'basic-care',
    nameKey: 'catBasicCare',
    icon: '🩹',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    faqKeys: [
      { q: 'qBasicCare_clean_q', a: 'qBasicCare_clean_a' },
      { q: 'qBasicCare_dressing_q', a: 'qBasicCare_dressing_a' },
      { q: 'qBasicCare_shower_q', a: 'qBasicCare_shower_a' },
      { q: 'qBasicCare_bath_q', a: 'qBasicCare_bath_a' },
      { q: 'qBasicCare_type_q', a: 'qBasicCare_type_a' },
      { q: 'qBasicCare_antiseptic_q', a: 'qBasicCare_antiseptic_a' },
      { q: 'qBasicCare_dry_q', a: 'qBasicCare_dry_a' },
      { q: 'qBasicCare_cream_q', a: 'qBasicCare_cream_a' },
    ]
  },
  {
    id: 'healing-signs',
    nameKey: 'catHealing',
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    faqKeys: [
      { q: 'qHealing_normal_q', a: 'qHealing_normal_a' },
      { q: 'qHealing_stages_q', a: 'qHealing_stages_a' },
      { q: 'qHealing_duration_q', a: 'qHealing_duration_a' },
      { q: 'qHealing_itching_q', a: 'qHealing_itching_a' },
      { q: 'qHealing_color_q', a: 'qHealing_color_a' },
      { q: 'qHealing_scab_q', a: 'qHealing_scab_a' },
      { q: 'qHealing_drainage_stop_q', a: 'qHealing_drainage_stop_a' },
      { q: 'qHealing_permanent_scar_q', a: 'qHealing_permanent_scar_a' },
    ]
  },
  {
    id: 'infection',
    nameKey: 'catInfection',
    icon: '🦠',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    faqKeys: [
      { q: 'qInfection_signs_q', a: 'qInfection_signs_a' },
      { q: 'qInfection_appearance_q', a: 'qInfection_appearance_a' },
      { q: 'qInfection_antibiotics_q', a: 'qInfection_antibiotics_a' },
      { q: 'qInfection_odor_q', a: 'qInfection_odor_a' },
      { q: 'qInfection_pus_q', a: 'qInfection_pus_a' },
      { q: 'qInfection_streaks_q', a: 'qInfection_streaks_a' },
      { q: 'qInfection_heat_q', a: 'qInfection_heat_a' },
      { q: 'qInfection_prevention_q', a: 'qInfection_prevention_a' },
    ]
  },
  {
    id: 'pain',
    nameKey: 'catPain',
    icon: '💊',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    faqKeys: [
      { q: 'qPain_manage_q', a: 'qPain_manage_a' },
      { q: 'qPain_ibuprofen_q', a: 'qPain_ibuprofen_a' },
      { q: 'qPain_worsening_q', a: 'qPain_worsening_a' },
      { q: 'qPain_throbbing_q', a: 'qPain_throbbing_a' },
      { q: 'qPain_night_q', a: 'qPain_night_a' },
      { q: 'qPain_duration_q', a: 'qPain_duration_a' },
      { q: 'qPain_burning_q', a: 'qPain_burning_a' },
      { q: 'qPain_numbing_q', a: 'qPain_numbing_a' },
    ]
  },
  {
    id: 'stitches',
    nameKey: 'catStitches',
    icon: '🧵',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    faqKeys: [
      { q: 'qStitches_removal_q', a: 'qStitches_removal_a' },
      { q: 'qStitches_wet_q', a: 'qStitches_wet_a' },
      { q: 'qStitches_pulling_q', a: 'qStitches_pulling_a' },
      { q: 'qStitches_early_out_q', a: 'qStitches_early_out_a' },
      { q: 'qStitches_vs_staples_q', a: 'qStitches_vs_staples_a' },
      { q: 'qStitches_staple_care_q', a: 'qStitches_staple_care_a' },
      { q: 'qStitches_removal_pain_q', a: 'qStitches_removal_pain_a' },
      { q: 'qStitches_dissolvable_q', a: 'qStitches_dissolvable_a' },
    ]
  },
  {
    id: 'bleeding',
    nameKey: 'catBleeding',
    icon: '🩸',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    faqKeys: [
      { q: 'qBleeding_normal_q', a: 'qBleeding_normal_a' },
      { q: 'qBleeding_oozing_q', a: 'qBleeding_oozing_a' },
      { q: 'qBleeding_types_q', a: 'qBleeding_types_a' },
      { q: 'qBleeding_stop_q', a: 'qBleeding_stop_a' },
      { q: 'qBleeding_rebleed_q', a: 'qBleeding_rebleed_a' },
      { q: 'qBleeding_clotting_q', a: 'qBleeding_clotting_a' },
      { q: 'qBleeding_bandage_q', a: 'qBleeding_bandage_a' },
      { q: 'qBleeding_bruising_q', a: 'qBleeding_bruising_a' },
    ]
  },
  {
    id: 'activity',
    nameKey: 'catActivity',
    icon: '🏃',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    faqKeys: [
      { q: 'qActivity_exercise_q', a: 'qActivity_exercise_a' },
      { q: 'qActivity_work_q', a: 'qActivity_work_a' },
      { q: 'qActivity_drive_q', a: 'qActivity_drive_a' },
      { q: 'qActivity_heavy_lifting_q', a: 'qActivity_heavy_lifting_a' },
      { q: 'qActivity_sleep_q', a: 'qActivity_sleep_a' },
      { q: 'qActivity_sex_q', a: 'qActivity_sex_a' },
      { q: 'qActivity_travel_q', a: 'qActivity_travel_a' },
      { q: 'qActivity_alcohol_q', a: 'qActivity_alcohol_a' },
    ]
  },
  {
    id: 'nutrition',
    nameKey: 'catNutrition',
    icon: '🍎',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    faqKeys: [
      { q: 'qNutrition_foods_q', a: 'qNutrition_foods_a' },
      { q: 'qNutrition_vitamins_q', a: 'qNutrition_vitamins_a' },
      { q: 'qNutrition_protein_q', a: 'qNutrition_protein_a' },
      { q: 'qNutrition_avoid_q', a: 'qNutrition_avoid_a' },
      { q: 'qNutrition_smoking_q', a: 'qNutrition_smoking_a' },
      { q: 'qNutrition_water_q', a: 'qNutrition_water_a' },
      { q: 'qNutrition_diabetes_q', a: 'qNutrition_diabetes_a' },
      { q: 'qNutrition_no_appetite_q', a: 'qNutrition_no_appetite_a' },
    ]
  },
  {
    id: 'scar',
    nameKey: 'catScar',
    icon: '✨',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    faqKeys: [
      { q: 'qScar_minimize_q', a: 'qScar_minimize_a' },
      { q: 'qScar_timing_q', a: 'qScar_timing_a' },
      { q: 'qScar_silicone_q', a: 'qScar_silicone_a' },
      { q: 'qScar_keloid_q', a: 'qScar_keloid_a' },
      { q: 'qScar_massage_q', a: 'qScar_massage_a' },
      { q: 'qScar_fade_q', a: 'qScar_fade_a' },
      { q: 'qScar_sun_q', a: 'qScar_sun_a' },
      { q: 'qScar_doctor_q', a: 'qScar_doctor_a' },
    ]
  },
  {
    id: 'fever',
    nameKey: 'catFever',
    icon: '🌡️',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    faqKeys: [
      { q: 'qFever_normal_q', a: 'qFever_normal_a' },
      { q: 'qFever_chills_q', a: 'qFever_chills_a' },
      { q: 'qFever_weakness_q', a: 'qFever_weakness_a' },
      { q: 'qFever_nausea_q', a: 'qFever_nausea_a' },
      { q: 'qFever_emergency_q', a: 'qFever_emergency_a' },
      { q: 'qFever_night_sweats_q', a: 'qFever_night_sweats_a' },
      { q: 'qFever_headache_q', a: 'qFever_headache_a' },
      { q: 'qFever_dizzy_q', a: 'qFever_dizzy_a' },
    ]
  },
  {
    id: 'emergency',
    nameKey: 'catEmergency',
    icon: '🚨',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    faqKeys: [
      { q: 'qEmergency_signs_q', a: 'qEmergency_signs_a' },
      { q: 'qEmergency_opened_q', a: 'qEmergency_opened_a' },
      { q: 'qEmergency_streaks_q', a: 'qEmergency_streaks_a' },
      { q: 'qEmergency_911_q', a: 'qEmergency_911_a' },
      { q: 'qEmergency_allergic_q', a: 'qEmergency_allergic_a' },
      { q: 'qEmergency_sepsis_q', a: 'qEmergency_sepsis_a' },
      { q: 'qEmergency_blood_clot_q', a: 'qEmergency_blood_clot_a' },
      { q: 'qEmergency_serious_infection_q', a: 'qEmergency_serious_infection_a' },
    ]
  },
  {
    id: 'special',
    nameKey: 'catSpecial',
    icon: '⚕️',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    faqKeys: [
      { q: 'qSpecial_diabetes_q', a: 'qSpecial_diabetes_a' },
      { q: 'qSpecial_blood_thinners_q', a: 'qSpecial_blood_thinners_a' },
      { q: 'qSpecial_age_q', a: 'qSpecial_age_a' },
      { q: 'qSpecial_steroids_q', a: 'qSpecial_steroids_a' },
      { q: 'qSpecial_obesity_q', a: 'qSpecial_obesity_a' },
      { q: 'qSpecial_circulation_q', a: 'qSpecial_circulation_a' },
      { q: 'qSpecial_pregnancy_q', a: 'qSpecial_pregnancy_a' },
      { q: 'qSpecial_stress_q', a: 'qSpecial_stress_a' },
    ]
  }
];

export function ChatScreen({ onNavigate }: ChatScreenProps) {
  const { t } = useAppSettings();
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const faqCategories: FAQCategory[] = useMemo(() => {
    return FAQ_METADATA.map(cat => ({
      id: cat.id,
      name: t(cat.nameKey as any),
      icon: cat.icon,
      color: cat.color,
      bgColor: cat.bgColor,
      faqs: cat.faqKeys.map((faq, index) => ({
        id: `${cat.id}-${index}`,
        question: t(faq.q as any),
        answer: t(faq.a as any)
      }))
    }));
  }, [t]);

  const handleSelectQuestion = (faq: FAQ) => {
    setSelectedFAQ(faq);
  };

  const handleBack = () => {
    if (selectedFAQ) {
      setSelectedFAQ(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleBrowseMore = () => {
    setSelectedFAQ(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => selectedFAQ || selectedCategory ? handleBack() : onNavigate('home')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('faqTitle')}</h1>
            <p className="text-sm text-gray-500">
              {selectedFAQ ? selectedCategory?.name : selectedCategory ? `${selectedCategory.name}` : t('faqSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Show Answer */}
        {selectedFAQ && (
          <div className="animate-fadeIn">
            {/* Question */}
            <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${selectedCategory?.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{selectedCategory?.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('yourQuestion')}</p>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedFAQ.question}</h2>
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2F80ED] to-[#6366f1] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">{t('answerTitle')}</span>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedFAQ.answer}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-800">
                  {t('educationalDisclaimer')}
                </p>
              </div>
            </div>

            {/* Browse More Button */}
            <button
              onClick={handleBrowseMore}
              className="w-full bg-[#2F80ED] text-white py-4 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-[#2563eb] transition-colors"
            >
              {t('browseMore')}
            </button>

            {/* Other Questions in Category */}
            {selectedCategory && selectedCategory.faqs.filter(f => f !== selectedFAQ).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('relatedQuestions')}</h3>
                <div className="space-y-2">
                  {selectedCategory.faqs.filter(f => f !== selectedFAQ).slice(0, 4).map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectQuestion(faq)}
                      className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-[#2F80ED] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{faq.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show Questions in Category */}
        {selectedCategory && !selectedFAQ && (
          <div className="animate-fadeIn">
            {/* Category Header */}
            <div className={`${selectedCategory.bgColor} rounded-2xl p-5 mb-6`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">{selectedCategory.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedCategory.name}</h2>
                  <p className="text-gray-600">{selectedCategory.faqs.length} {t('findAnswers').toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {selectedCategory.faqs.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(faq)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                  <div className={`w-10 h-10 ${selectedCategory.bgColor} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-5 h-5 ${selectedCategory.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-gray-700 font-medium">{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#2F80ED] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show All Categories */}
        {!selectedCategory && !selectedFAQ && (
          <div className="animate-fadeIn">
            {/* Search hint */}
            <div className="bg-gradient-to-r from-[#2F80ED] to-[#6366f1] rounded-2xl p-5 mb-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('findAnswers')}</h2>
                  <p className="text-white/80 text-sm">{t('tapCategoryHint')}</p>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('browseByTopic')}</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{category.name}</h4>
                  <p className="text-xs text-gray-500">{category.faqs.length} {t('findAnswers').toLowerCase()}</p>
                </button>
              ))}
            </div>

            {/* Most Popular Questions */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('mostAsked')}</h3>
            <div className="space-y-3">
              {[
                { category: faqCategories[0], faq: faqCategories[0].faqs[0] },
                { category: faqCategories[2], faq: faqCategories[2].faqs[0] },
                { category: faqCategories[1], faq: faqCategories[1].faqs[0] },
                { category: faqCategories[4], faq: faqCategories[4].faqs[0] },
                { category: faqCategories[3], faq: faqCategories[3].faqs[0] },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedCategory(item.category);
                    setSelectedFAQ(item.faq);
                  }}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4"
                >
                  <div className={`w-10 h-10 ${item.category.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-lg">{item.category.icon}</span>
                  </div>
                  <span className="flex-1 text-gray-700">{item.faq.question}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Emergency Notice */}
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🚨</span>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">{t('emergencyNoticeTitle')}</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {t('emergencyNoticeText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
