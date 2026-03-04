import { WoundType } from '../types';

export const woundTypes: WoundType[] = [
  {
    id: 'clean',
    name: 'Clean Wound',
    category: 'classification',
    definition: 'A surgical wound made under sterile conditions with no entry into the respiratory, gastrointestinal, or genitourinary tract.',
    examples: ['Hernia repair', 'Thyroidectomy', 'Joint replacement'],
    healingTime: '7-14 days',
    normalAppearance: 'Minimal redness along incision line, no swelling after 48 hours',
    dangerSigns: ['Increasing redness', 'Warmth', 'Swelling after day 3', 'Any discharge'],
    careSteps: ['Keep dry', 'Simple dressing', 'No antibiotics unless prescribed']
  },
  {
    id: 'clean-contaminated',
    name: 'Clean-Contaminated',
    category: 'classification',
    definition: 'Surgical wounds entering the respiratory, GI, or genitourinary tract under controlled conditions without unusual contamination.',
    examples: ['Appendectomy', 'Cholecystectomy', 'Cesarean section'],
    healingTime: '10-21 days',
    normalAppearance: 'Slight redness, minimal clear drainage first 24-48 hours',
    dangerSigns: ['Yellow/green discharge', 'Fever', 'Increasing pain after day 2'],
    careSteps: ['Clean with saline', 'Change dressing daily', 'Monitor for signs of infection']
  },
  {
    id: 'contaminated',
    name: 'Contaminated',
    category: 'classification',
    definition: 'Fresh open wounds, operations with major breaks in sterile technique, or gross spillage from the GI tract.',
    examples: ['Trauma wounds', 'Bowel surgery with spillage', 'Bite wounds'],
    healingTime: '21-42 days',
    normalAppearance: 'May have controlled redness, granulation tissue forming',
    dangerSigns: ['Spreading redness', 'Foul odor', 'Fever', 'Green discharge'],
    careSteps: ['Daily saline wash', 'Antiseptic application', 'Watch for discharge', 'May require antibiotics']
  },
  {
    id: 'infected',
    name: 'Infected',
    category: 'classification',
    definition: 'Wounds with clinical infection present, including old traumatic wounds with devitalized tissue.',
    examples: ['Abscess drainage', 'Perforated viscus', 'Old trauma wounds'],
    healingTime: '42-90+ days',
    normalAppearance: 'Gradual reduction in redness, healthy granulation tissue',
    dangerSigns: ['Worsening despite treatment', 'Systemic symptoms', 'Necrotic tissue'],
    careSteps: ['Do not self-treat', 'Visit doctor immediately', 'Antibiotics mandatory', 'May need debridement']
  },
  {
    id: 'incision',
    name: 'Incision',
    category: 'type',
    definition: 'A clean cut made by a sharp surgical instrument creating a defined wound edge.',
    examples: ['Surgical cuts', 'Scalpel wounds', 'Laparotomy'],
    healingTime: '7-14 days',
    normalAppearance: 'Clean edges, minimal gap, slight redness along suture line',
    dangerSigns: ['Wound separation', 'Bulging', 'Drainage after day 3'],
    careSteps: ['Keep clean and dry', 'Protect from trauma', 'Follow suture care instructions']
  },
  {
    id: 'excision',
    name: 'Excision',
    category: 'type',
    definition: 'Removal of tissue creating a larger wound area requiring healing from the base up.',
    examples: ['Mole removal', 'Tumor excision', 'Skin cancer removal'],
    healingTime: '14-28 days',
    normalAppearance: 'Pink/red wound bed, gradual tissue filling',
    dangerSigns: ['Dark tissue', 'Foul smell', 'No progress after 2 weeks'],
    careSteps: ['Keep moist', 'Non-adherent dressing', 'Protect from sun']
  },
  {
    id: 'puncture',
    name: 'Puncture',
    category: 'type',
    definition: 'A deep wound caused by a pointed object with a small surface opening.',
    examples: ['Drain insertion sites', 'Trocar wounds', 'Laparoscopic ports'],
    healingTime: '7-21 days',
    normalAppearance: 'Small surface wound, may have deeper healing',
    dangerSigns: ['Deep pain', 'Swelling around site', 'Red streaks'],
    careSteps: ['Watch for deep infection', 'Keep surface clean', 'Monitor for abscess formation']
  },
  {
    id: 'drain-site',
    name: 'Drain Site',
    category: 'type',
    definition: 'Wound created for surgical drain placement requiring special care during and after drain removal.',
    examples: ['Jackson-Pratt drain', 'Penrose drain', 'Chest tube site'],
    healingTime: '14-28 days after drain removal',
    normalAppearance: 'Clear/serosanguinous drainage while drain present, closing after removal',
    dangerSigns: ['Purulent drainage', 'Skin breakdown', 'Drain falling out'],
    careSteps: ['Keep dressing around drain', 'Empty collection as directed', 'Note output volume and color']
  },
  {
    id: 'graft-site',
    name: 'Graft Site',
    category: 'type',
    definition: 'Area where skin or tissue has been transplanted requiring specialized care for graft survival.',
    examples: ['Skin graft', 'Flap surgery', 'Burn reconstruction'],
    healingTime: '21-42 days',
    normalAppearance: 'Pink graft, adherent to base, gradual color change',
    dangerSigns: ['Dark/black coloring', 'Lifting of graft', 'Foul smell'],
    careSteps: ['No pressure on graft', 'Minimize movement', 'Moist dressing', 'Follow surgeon instructions exactly']
  }
];

export const healingStages = [
  {
    stage: 'hemostasis',
    name: 'Hemostasis',
    level: 1,
    icon: '🩸',
    description: 'Immediate response - blood clotting and wound sealing (0-4 hours)',
    care: 'Compression, sterile cover, stop bleeding',
    appearance: 'Fresh wound, active or recent bleeding, clot forming'
  },
  {
    stage: 'inflammatory',
    name: 'Inflammatory',
    level: 2,
    icon: '🔥',
    description: 'Body fights infection, brings healing cells (1-4 days)',
    care: 'Clean daily, pain control, watch for infection signs',
    appearance: 'Redness, warmth, swelling, possible clear drainage'
  },
  {
    stage: 'proliferative',
    name: 'Proliferative',
    level: 3,
    icon: '🌱',
    description: 'New tissue formation, wound filling (4-21 days)',
    care: 'Protein diet, moist dressing, protect new tissue',
    appearance: 'Pink/red granulation tissue, wound edges contracting'
  },
  {
    stage: 'maturation',
    name: 'Maturation',
    level: 4,
    icon: '✨',
    description: 'Scar strengthening and remodeling (21 days - 2 years)',
    care: 'Scar gel application, sunscreen, gentle massage',
    appearance: 'Scar forming, pink then fading to white/pale'
  }
];

export const careMatrix = [
  { stage: 'Hemostasis', care: 'Compression, sterile cover' },
  { stage: 'Inflammatory', care: 'Clean daily, pain control' },
  { stage: 'Proliferative', care: 'Protein diet, moist dressing' },
  { stage: 'Maturation', care: 'Scar gel, sunscreen' }
];

export const visualCategories = [
  {
    id: 'normal',
    name: 'Normal Healing',
    label: 'Normal',
    color: '#27AE60',
    description: 'Healthy healing progression',
    images: [
      { day: 'Day 1', description: 'Fresh incision, slight redness around edges, clean suture line', imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 3', description: 'Mild swelling subsiding, edges intact, minimal bruising', imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 5', description: 'Redness fading, no discharge, healthy pink tissue', imageUrl: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 7', description: 'Sutures ready for removal, well-approximated edges', imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 14', description: 'Healing line visible, new tissue formation complete', imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 30', description: 'Mature scar forming, flat and fading to pink', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&auto=format' }
    ]
  },
  {
    id: 'delayed',
    name: 'Delayed Healing',
    label: 'Warning',
    color: '#F2994A',
    description: 'Slower than expected progress',
    images: [
      { day: 'Day 3', description: 'Excessive swelling persists, prolonged inflammation', imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 7', description: 'Wound edges not closing properly, gap visible', imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 10', description: 'Minimal granulation tissue, pale wound bed', imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 14', description: 'Still inflamed, persistent redness around margins', imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 21', description: 'Partial healing only, wound still open in areas', imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 30', description: 'May need intervention, consider specialist consult', imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400&fit=crop&auto=format' }
    ]
  },
  {
    id: 'infected',
    name: 'Infected',
    label: 'Infected',
    color: '#EB5757',
    description: 'Signs of wound infection',
    images: [
      { day: 'Day 2', description: 'Increasing redness spreading beyond wound edges', imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 3', description: 'Purulent discharge present, yellow-green color', imageUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 5', description: 'Wound breakdown, tissue necrosis beginning', imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 7', description: 'Spreading cellulitis, increased warmth and pain', imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 10', description: 'Requires antibiotic treatment, wound culture needed', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 14', description: 'Healing with intervention, infection controlled', imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&auto=format' }
    ]
  },
  {
    id: 'critical',
    name: 'Critical',
    label: 'Critical',
    color: '#9B2C2C',
    description: 'Requires immediate medical attention',
    images: [
      { day: 'Acute', description: 'Severe infection signs, systemic illness present', imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 2', description: 'Tissue necrosis visible, black/grey discoloration', imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 3', description: 'Systemic symptoms: fever, chills, malaise', imageUrl: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 5', description: 'Wound dehiscence, complete separation of edges', imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=400&fit=crop&auto=format' },
      { day: 'Day 7', description: 'Requires surgical intervention, debridement needed', imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=400&fit=crop&auto=format' },
      { day: 'Recovery', description: 'Post-intervention healing, close monitoring required', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop&auto=format' }
    ]
  }
];

export const dailyCareTips = [
  "Keep your wound clean and dry unless otherwise instructed",
  "Change dressings at least once daily or when wet/soiled",
  "Wash hands before and after touching your wound",
  "Eat protein-rich foods to support healing",
  "Stay hydrated - aim for 8 glasses of water daily",
  "Avoid smoking - it significantly delays wound healing",
  "Get adequate rest - healing requires energy",
  "Watch for signs of infection: increased redness, warmth, swelling",
  "Take prescribed medications as directed",
  "Attend all follow-up appointments"
];

export const chatResponses: Record<string, string> = {
  'normal': "Based on typical healing patterns, what you're describing sounds within normal range for post-surgical healing. However, always trust your instincts - if something feels wrong, contact your healthcare provider.",
  'bathe': "Generally, you should keep surgical wounds dry for 24-48 hours. After that, brief showers are usually okay, but avoid soaking in baths, pools, or hot tubs until fully healed. Always pat dry gently and apply fresh dressing. Check with your surgeon for specific instructions.",
  'stitches': "Suture removal timing depends on the wound location: Face: 5-7 days, Scalp: 7-10 days, Body: 10-14 days, Joints: 14+ days. Your surgeon will advise based on your specific procedure. Never remove stitches yourself.",
  'default': "I understand your concern. For specific medical advice, please consult your healthcare provider. I can provide general wound care guidance based on clinical guidelines."
};
