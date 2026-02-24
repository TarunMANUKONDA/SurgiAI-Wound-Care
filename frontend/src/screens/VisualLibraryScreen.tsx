import { useState } from 'react';
import { Screen } from '../types';
import { CheckCircle, Clock, AlertTriangle, ShieldAlert, ChevronLeft, ArrowRightLeft } from 'lucide-react';

interface VisualLibraryScreenProps {
  onNavigate: (screen: Screen) => void;
}

type WoundType = 'normal' | 'delayed' | 'infected' | 'critical';

interface WoundCategory {
  id: WoundType;
  title: string;
  description: string;
  takeaway: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
  imageUrl: string;
  moreImages: string[];
}

interface WoundCategory {
  id: WoundType;
  title: string;
  description: string;
  takeaway: string;
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
    title: 'Normal Healing',
    description: 'Pink or light red tissue, closed edges, no pus or bad smell.',
    takeaway: 'This is the ideal healing pattern.',
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
      'Color Changes: Transition from bright red to pink as it heals. Light purple or deep pink edges are common.',
      'Mild Inflammation: Slight redness, warmth, and swelling (normal for the first 2–5 days).',
      'Drainage: Small amounts of clear or slightly yellow (serous) fluid.',
      'Sensations: Itching, mild "electric shock", or tingling as new nerves and tissue develop.',
      'Wound Texture: Beefy red or "bumpy" (granulation) tissue. A thin protective scab may form.'
    ]
  },
  {
    id: 'delayed',
    title: 'Delayed Healing',
    description: 'Healing is slow, wound looks unchanged, pale or dry tissue.',
    takeaway: 'Healing needs better care and monitoring.',
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
      'Lack of Change: The wound looks the same after 1–2 weeks with no visible signs of closure.',
      'Wound Gaping: The edges of the incision begin to pull apart or separate rather than knitting together.',
      'Darkened Tissue: Edges that turn dark red, purple, or black (necrosis) indicate poor blood supply.',
      'Persistent Swelling: Inflammation that continues to worsen after the first 72 hours post-surgery.',
      'Pale or Dry Wound Bed: Insufficient blood flow may cause the wound to appear pale or lack healthy granulation tissue.',
      'Minimal Drainage: Very little or no wound drainage when some is expected during normal healing.'
    ]
  },
  {
    id: 'infected',
    title: 'Infected',
    description: 'Yellow or green fluid, spreading redness, pain or bad smell.',
    takeaway: 'Infections require medical attention.',
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
      'Purulent Discharge: Thick, cloudy, milky, or yellow/green pus.',
      'Foul Odor: A noticeable or pungent smell coming from the incision site.',
      'Spreading Redness: Redness extending significantly beyond edges or featuring red streaks.',
      'Persistent Fever: Body temperature higher than 101°F (38.4°C) with chills or sweats.',
      'Worsening Pain: Pain that increases after initially improving, or localized "hardness" (induration).'
    ]
  },
  {
    id: 'critical',
    title: 'Critical',
    description: 'Open wound, black tissue, heavy bleeding or severe pain.',
    takeaway: 'This is a medical emergency.',
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
      'Evisceration: Internal tissues or organs protruding through an opened incision.',
      'Rapidly Spreading Discoloration: Redness with greyish "dishwater" fluid (Necrotizing Fasciitis).',
      'Systemic Distress: Sudden confusion, severe muscle pain, or extreme shortness of breath (Sepsis).',
      'Uncontrollable Bleeding: Bright red blood that soaks through a dressing within an hour.'
    ]
  }
];

export function VisualLibraryScreen({ onNavigate }: VisualLibraryScreenProps) {
  const [selectedType, setSelectedType] = useState<WoundCategory | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTypes, setCompareTypes] = useState<[WoundType, WoundType]>(['normal', 'infected']);

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
            <h1 className="text-xl font-semibold text-gray-800">{selectedType.title}</h1>
            <p className="text-sm text-gray-500">Detailed View</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
            <img
              src={selectedType.imageUrl}
              alt={selectedType.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {selectedType.icon}
                <span className="font-bold text-lg" style={{ color: selectedType.color }}>
                  {selectedType.title}
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {selectedType.description}
              </p>
              <div className={`p-4 rounded-xl border-l-4 ${selectedType.bgColor} ${selectedType.borderColor}`}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Learning Takeaway</p>
                <p className="text-gray-800 font-medium">{selectedType.takeaway}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">More Reference Examples</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedType.moreImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100">
                  <img src={img} alt={`${selectedType.title} example ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Symptoms & Signs:</h3>
            <ul className="space-y-4">
              {selectedType.detailedSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedType.color }} />
                  </div>
                  <span className="text-sm leading-relaxed">{sign}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-gray-600 pt-2 border-t border-gray-50">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <span className="text-sm font-medium text-blue-700">Always consult your surgeon or doctor if you notice any changes or are unsure.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setSelectedType(null)}
            className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold shadow-sm"
          >
            Back to All Types
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
            <h1 className="text-xl font-semibold text-gray-800">Compare Types</h1>
            <p className="text-sm text-gray-500">Visual comparison</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {compareTypes.map((typeId, idx) => {
            const type = WOUND_TYPES.find(t => t.id === typeId)!;
            return (
              <div key={idx} className="space-y-3">
                <select
                  value={typeId}
                  onChange={(e) => {
                    const newTypes = [...compareTypes] as [WoundType, WoundType];
                    newTypes[idx] = e.target.value as WoundType;
                    setCompareTypes(newTypes);
                  }}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                >
                  {WOUND_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2" style={{ borderColor: type.color }}>
                  <img src={type.imageUrl} alt={type.title} className="w-full h-full object-cover" />
                </div>
                <div className={`p-3 rounded-xl ${type.bgColor} border ${type.borderColor}`}>
                  <p className="text-xs font-bold uppercase mb-1" style={{ color: type.color }}>{type.title}</p>
                  <p className="text-[11px] text-gray-600 leading-tight">{type.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setCompareMode(false)}
          className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold shadow-sm"
        >
          Exit Compare Mode
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
          <h1 className="text-xl font-semibold text-gray-800">Wound Visual Reference</h1>
          <p className="text-sm text-gray-500">Educational Learning Guide</p>
        </div>
      </div>

      {/* Instruction text */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-blue-700 text-sm leading-relaxed text-center">
          Compare your wound with these examples to understand different healing conditions.
          <span className="font-semibold"> This page is for learning purposes only.</span>
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCompareMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600 text-sm font-semibold"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Compare Mode
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {WOUND_TYPES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedType(category)}
            className="w-full text-left bg-white rounded-[24px] shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="h-48 relative overflow-hidden">
              <img
                src={category.imageUrl}
                alt={category.title}
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
                  {category.title}
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-snug mb-4">
                {category.description}
              </p>

              <div className={`p-4 rounded-2xl ${category.bgColor} border ${category.borderColor}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Takeaway</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <p className="mt-1 font-semibold text-gray-800">
                  {category.takeaway}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center text-blue-600 font-semibold text-sm">
                Tap to see more examples & details
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-100 rounded-3xl text-center">
        <p className="text-gray-500 text-xs italic">
          Not a medical diagnosis. For emergencies consult a doctor immediately.
        </p>
      </div>
    </div>
  );
}
