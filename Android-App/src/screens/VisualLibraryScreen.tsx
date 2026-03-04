import { useState } from 'react';
import { Screen } from '../types';
import { CheckCircle, Clock, AlertTriangle, ShieldAlert, ChevronLeft, ArrowRightLeft } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

interface VisualLibraryScreenProps {
  onNavigate: (screen: Screen) => void;
}

type WoundType = 'normal' | 'delayed' | 'infected' | 'critical';

interface WoundCategory {
  id: WoundType;
  titleKey: string;
  descriptionKey: string;
  takeawayKey: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
  imageUrl: string;
  moreImages: string[];
  detailedSigns: string[];
}

const WOUND_TYPES: WoundCategory[] = [
  {
    id: 'normal',
    titleKey: 'normalHealing',
    descriptionKey: 'proliferativeAppearance',
    takeawayKey: 'normalHealingTakeaway',
    color: '#27AE60',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    imageUrl: '/images/healing 1.jpg',
    moreImages: [
      '/images/healing progress 3.png',
      '/images/healing 4 (1).jpg'
    ],
    detailedSigns: [
      'signNormal1',
      'signNormal2',
      'signNormal3',
      'signNormal4',
      'signNormal5'
    ]
  },
  {
    id: 'delayed',
    titleKey: 'delayedHealing',
    descriptionKey: 'hemostasisAppearance',
    takeawayKey: 'delayedHealingTakeaway',
    color: '#F2C94C',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: <Clock className="w-6 h-6 text-yellow-500" />,
    imageUrl: '/images/healing delay 1.jpeg',
    moreImages: [
      '/images/delay 2.jpeg',
      '/images/healing delay 1.jpeg'
    ],
    detailedSigns: [
      'signDelayed1',
      'signDelayed2',
      'signDelayed3',
      'signDelayed4',
      'signDelayed5',
      'signDelayed6'
    ]
  },
  {
    id: 'infected',
    titleKey: 'infectedWound',
    descriptionKey: 'inflammatoryAppearance',
    takeawayKey: 'infectedTakeaway',
    color: '#F2994A',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
    imageUrl: '/images/infected-896.jpg',
    moreImages: [
      '/images/infected-110.jpg',
      '/images/infected 2.webp'
    ],
    detailedSigns: [
      'signInfected1',
      'signInfected2',
      'signInfected3',
      'signInfected4',
      'signInfected5'
    ]
  },
  {
    id: 'critical',
    titleKey: 'critical',
    descriptionKey: 'maturationAppearance',
    takeawayKey: 'criticalTakeaway',
    color: '#EB5757',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
    imageUrl: '/images/critical-62.jpg',
    moreImages: [
      '/images/critical-57.jpg',
      '/images/critical 2.jpeg'
    ],
    detailedSigns: [
      'signCritical1',
      'signCritical2',
      'signCritical3',
      'signCritical4'
    ]
  }
];

export function VisualLibraryScreen({ onNavigate }: VisualLibraryScreenProps) {
  const { t } = useAppSettings();
  const [selectedType, setSelectedType] = useState<WoundCategory | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTypeIds, setCompareTypeIds] = useState<[WoundType, WoundType]>(['normal', 'infected']);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWoundTypes = WOUND_TYPES.filter(type =>
    t(type.titleKey as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t(type.descriptionKey as any).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedType) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
        <div className="flex items-center gap-4 pt-4 pb-6">
          <button
            onClick={() => setSelectedType(null)}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t(selectedType.titleKey as any)}</h1>
            <p className="text-sm text-gray-500">{t('educationalGuide')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
            <img
              src={selectedType.imageUrl}
              alt={t(selectedType.titleKey as any)}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {selectedType.icon}
                <span className="font-bold text-lg" style={{ color: selectedType.color }}>
                  {t(selectedType.titleKey as any)}
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {t(selectedType.descriptionKey as any)}
              </p>
              <div className={`p-4 rounded-xl border-l-4 ${selectedType.bgColor} ${selectedType.borderColor}`}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">{t('takeaway')}</p>
                <p className="text-gray-800 font-medium">{t(selectedType.takeawayKey as any)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">{t('tapForMore')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedType.moreImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100">
                  <img src={img} alt={`${t(selectedType.titleKey as any)} example ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{t('symptomsSigns')}:</h3>
            <ul className="space-y-4">
              {selectedType.detailedSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedType.color }} />
                  </div>
                  <span className="text-sm leading-relaxed">{t(sign as any)}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-gray-600 pt-2 border-t border-gray-50">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <span className="text-sm font-medium text-blue-700">{t('emergencyContactDoc')}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setSelectedType(null)}
            className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold shadow-sm"
          >
            {t('woundTypes')}
          </button>
        </div>
      </div>
    );
  }

  if (compareMode) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
        <div className="flex items-center gap-4 pt-4 pb-6">
          <button
            onClick={() => setCompareMode(false)}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('compareTypes')}</h1>
            <p className="text-sm text-gray-500">{t('visualGallery')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {compareTypeIds.map((typeId, idx) => {
            const type = WOUND_TYPES.find(w => w.id === typeId)!;
            return (
              <div key={idx} className="space-y-3">
                <select
                  value={typeId}
                  onChange={(e) => {
                    const newTypes = [...compareTypeIds] as [WoundType, WoundType];
                    newTypes[idx] = e.target.value as WoundType;
                    setCompareTypeIds(newTypes);
                  }}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                >
                  {WOUND_TYPES.map(w => (
                    <option key={w.id} value={w.id}>{t(w.titleKey as any)}</option>
                  ))}
                </select>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2" style={{ borderColor: type.color }}>
                  <img src={type.imageUrl} alt={t(type.titleKey as any)} className="w-full h-full object-cover" />
                </div>
                <div className={`p-3 rounded-xl ${type.bgColor} border ${type.borderColor}`}>
                  <p className="text-xs font-bold uppercase mb-1" style={{ color: type.color }}>{t(type.titleKey as any)}</p>
                  <p className="text-[11px] text-gray-600 leading-tight">{t(type.descriptionKey as any)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setCompareMode(false)}
          className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold shadow-sm"
        >
          {t('exitCompare')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{t('visualGallery')}</h1>
          <p className="text-sm text-gray-500">{t('educationalGuide')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchCases' as any) || 'Search...'}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent shadow-sm transition-shadow"
        />
      </div>

      {/* Instruction text */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-blue-700 text-sm leading-relaxed text-center">
          {t('compareWounds')}
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCompareMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600 text-sm font-semibold"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {t('compareTypes')}
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {filteredWoundTypes.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedType(category)}
            className="w-full text-left bg-white rounded-[24px] shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="h-48 relative overflow-hidden">
              <img
                src={category.imageUrl}
                alt={t(category.titleKey as any)}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                {category.icon}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold" style={{ color: category.color }}>
                  {t(category.titleKey as any)}
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-snug mb-4">
                {t(category.descriptionKey as any)}
              </p>

              <div className={`p-4 rounded-2xl ${category.bgColor} border ${category.borderColor}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('takeaway')}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <p className="mt-1 font-semibold text-gray-800">
                  {t(category.takeawayKey as any)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {t('tapForMore')}
              </div>
            </div>
          </button>
        ))}
        {filteredWoundTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('noMatchingCases' as any)}</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-6 bg-gray-100 rounded-3xl text-center">
        <p className="text-gray-500 text-xs italic">
          {t('safetyNote')}
        </p>
      </div>
    </div>
  );
}
