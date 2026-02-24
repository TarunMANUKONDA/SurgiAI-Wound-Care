import { useState } from 'react';
import { Screen } from '../types';

interface ChatScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface FAQ {
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

const faqCategories: FAQCategory[] = [
  {
    id: 'basic-care',
    name: 'Basic Wound Care',
    icon: '🩹',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    faqs: [
      {
        question: 'How do I clean my surgical wound?',
        answer: 'Clean your wound gently with mild soap and water or saline solution. Use a clean gauze pad to pat dry. Avoid scrubbing or using harsh chemicals like hydrogen peroxide or alcohol directly on the wound, as they can damage healing tissue. Clean once or twice daily unless your doctor advises otherwise.'
      },
      {
        question: 'How often should I change my dressing?',
        answer: 'Change your dressing once daily or when it becomes wet, dirty, or loose. Always wash your hands before and after changing dressings. If your wound has heavy drainage, you may need to change it more frequently. Follow your surgeon\'s specific instructions.'
      },
      {
        question: 'Can I shower with my wound?',
        answer: 'Most surgical wounds can be gently showered 24-48 hours after surgery. Let water run over the wound briefly, pat dry gently with a clean towel, and apply a fresh dressing. Avoid direct water pressure on the wound. Do not soak in baths, pools, or hot tubs until fully healed.'
      },
      {
        question: 'When can I take a bath or swim?',
        answer: 'Avoid baths, swimming pools, hot tubs, and natural bodies of water until your wound is completely healed and any stitches are removed. This typically takes 2-4 weeks. Soaking can soften the wound and increase infection risk.'
      },
      {
        question: 'What type of dressing should I use?',
        answer: 'Use the dressing recommended by your surgeon. Common options include sterile gauze with tape, waterproof bandages, or specialized wound dressings. Keep the wound moist but not wet. Non-stick dressings are best to avoid disturbing the healing tissue when changing.'
      },
      {
        question: 'Should I use antiseptic on my wound?',
        answer: 'Only use antiseptics if prescribed by your doctor. Mild soap and water or saline solution are usually sufficient. Strong antiseptics like hydrogen peroxide, iodine, or alcohol can damage healthy tissue and delay healing.'
      },
      {
        question: 'How do I keep my wound dry?',
        answer: 'Cover your wound with a waterproof dressing when showering. Pat the area dry immediately if it gets wet. Avoid swimming or soaking. If the dressing becomes wet, change it promptly to prevent bacterial growth.'
      },
      {
        question: 'Can I apply cream or lotion to my wound?',
        answer: 'Do not apply any creams, lotions, or ointments unless specifically prescribed by your doctor. Some products can trap bacteria or interfere with healing. Once the wound is fully closed, you may use vitamin E oil or silicone-based scar treatments as recommended.'
      }
    ]
  },
  {
    id: 'healing-signs',
    name: 'Signs of Healing',
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    faqs: [
      {
        question: 'Is my wound healing normally?',
        answer: 'Normal healing signs include: slight redness around edges (decreasing over time), mild swelling that reduces daily, clear or slightly yellow drainage, scab formation, and gradual wound closure. The wound should feel less painful each day and show no spreading redness or foul odor.'
      },
      {
        question: 'What are the stages of wound healing?',
        answer: '1. HEMOSTASIS (0-2 days): Blood clotting and scab formation.\n2. INFLAMMATORY (2-5 days): Redness, swelling, warmth as immune cells clean the wound.\n3. PROLIFERATIVE (5-21 days): New tissue grows, wound contracts and closes.\n4. MATURATION (21 days-2 years): Scar strengthens and fades. Each stage is essential for proper healing.'
      },
      {
        question: 'How long will my wound take to heal?',
        answer: 'Healing time varies by wound type and individual factors:\n• Minor cuts: 1-2 weeks\n• Surgical incisions: 2-6 weeks\n• Deep wounds: 6-12 weeks\n• Full maturation: Up to 2 years\n\nFactors affecting healing: age, nutrition, blood supply, diabetes, smoking, and wound location.'
      },
      {
        question: 'Is itching a good sign?',
        answer: 'Yes! Itching often indicates healing. As new skin cells form and collagen rebuilds, nerve endings can become irritated, causing itchiness. Avoid scratching as it can damage new tissue or introduce bacteria. Apply a cool compress or ask your doctor about anti-itch solutions.'
      },
      {
        question: 'Why is my wound changing color?',
        answer: 'Color changes are normal during healing:\n• Red/Pink: Active healing, good blood flow\n• Light pink: Healthy new tissue forming\n• Purple/Blue: Bruising (normal after surgery)\n• White/Silver: Scar tissue forming\n\nConcerning colors: Dark red/black (tissue death), bright red spreading (infection), green/yellow pus.'
      },
      {
        question: 'Is scab formation normal?',
        answer: 'Yes, scabs are a normal part of healing. They protect the wound while new tissue forms underneath. Do not pick or remove scabs as this can cause scarring and infection. Let them fall off naturally when the skin beneath has healed.'
      },
      {
        question: 'When will my wound stop draining?',
        answer: 'Light, clear or slightly yellow drainage is normal for the first few days. Drainage should decrease and stop within 2-5 days for most surgical wounds. If drainage increases, changes color (green/brown), or has a foul odor, contact your doctor immediately.'
      },
      {
        question: 'Is my scar permanent?',
        answer: 'All wounds that penetrate the dermis layer leave some scarring. However, scars fade significantly over 1-2 years. You can minimize scarring by: keeping the wound moist, protecting from sun, using silicone scar sheets, and avoiding tension on the wound. Some scars may require professional treatment.'
      }
    ]
  },
  {
    id: 'infection',
    name: 'Infection Warning Signs',
    icon: '🦠',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    faqs: [
      {
        question: 'What are signs of wound infection?',
        answer: '⚠️ WARNING SIGNS OF INFECTION:\n• Increasing redness spreading from wound\n• Swelling that worsens after day 3\n• Yellow, green, or brown discharge\n• Foul or unusual odor\n• Increasing pain after initial days\n• Fever above 100.4°F (38°C)\n• Red streaks extending from wound\n• Wound feels hot to touch\n\nContact your doctor immediately if you notice these signs.'
      },
      {
        question: 'What does an infected wound look like?',
        answer: 'Infected wounds typically show:\n• Spreading redness beyond wound edges\n• Swollen, puffy tissue\n• Thick pus (yellow, green, or brown)\n• Wound edges separating\n• Dark or dead tissue\n• Increasing pain and tenderness\n\nThe surrounding skin may feel warm or hot. Take a photo to track changes and show your doctor.'
      },
      {
        question: 'Do I need antibiotics for my wound?',
        answer: 'Not all wounds need antibiotics. Antibiotics are prescribed when:\n• Signs of infection are present\n• The wound was contaminated\n• You have diabetes or immune issues\n• The wound is deep or involves bone/joint\n\nNever take antibiotics without a prescription. Overuse creates resistant bacteria.'
      },
      {
        question: 'What is the smell coming from my wound?',
        answer: 'Wound odors can indicate:\n• Mild/no odor: Normal healing\n• Sweet or musty: Possible infection\n• Foul/rotten smell: Bacterial infection (urgent)\n• Strong ammonia: Possible protein breakdown\n\nAny new or worsening odor should be evaluated by a doctor within 24 hours.'
      },
      {
        question: 'I see pus - is this normal?',
        answer: 'Small amounts of clear or slightly yellow drainage are normal. However, TRUE PUS indicates infection:\n• Thick, creamy consistency\n• Yellow, green, or brown color\n• Foul odor\n• Increasing amount\n\nIf you see pus, contact your doctor. Do not squeeze the wound to express it.'
      },
      {
        question: 'What are red streaks near my wound?',
        answer: '🚨 URGENT: Red streaks extending from a wound are a sign of lymphangitis (spreading infection through lymph vessels). This is a medical emergency requiring immediate antibiotic treatment. Go to the emergency room or urgent care immediately. Do not wait to see if it improves.'
      },
      {
        question: 'Is it normal for my wound to feel hot?',
        answer: 'Mild warmth around a wound is normal during the inflammatory phase (first 3-5 days). However, increasing heat or warmth spreading beyond the wound edges after day 3-5 may indicate infection. Compare to the same area on the opposite side of your body.'
      },
      {
        question: 'How can I prevent wound infection?',
        answer: 'To prevent infection:\n• Keep the wound clean and dry\n• Change dressings regularly\n• Wash hands before touching wound\n• Don\'t pick at scabs or stitches\n• Take prescribed antibiotics fully\n• Eat a nutritious diet\n• Don\'t smoke\n• Avoid touching wound unnecessarily\n• Keep follow-up appointments'
      }
    ]
  },
  {
    id: 'pain',
    name: 'Pain & Discomfort',
    icon: '💊',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    faqs: [
      {
        question: 'How can I manage wound pain?',
        answer: 'Pain management options:\n1. Take prescribed pain medication on schedule\n2. Use over-the-counter pain relievers (acetaminophen/ibuprofen) as directed\n3. Apply ice packs wrapped in cloth (not directly on wound)\n4. Elevate the wounded area above heart level\n5. Avoid activities that strain the wound\n6. Use relaxation techniques\n\nPain should decrease each day. Increasing pain may indicate a problem.'
      },
      {
        question: 'Can I take ibuprofen for wound pain?',
        answer: 'Ibuprofen (Advil, Motrin) is generally safe for wound pain UNLESS your doctor advises otherwise. It may increase bleeding risk immediately after surgery. Acetaminophen (Tylenol) is often preferred in the first 24-48 hours. Always follow your surgeon\'s specific recommendations.'
      },
      {
        question: 'My pain is getting worse - what should I do?',
        answer: '⚠️ Increasing pain after the first few days is concerning. This could indicate:\n• Infection developing\n• Wound opening (dehiscence)\n• Hematoma (blood collection)\n• Nerve irritation\n\nContact your doctor if:\n• Pain increases instead of decreases\n• Pain medication isn\'t helping\n• Pain is accompanied by fever or redness'
      },
      {
        question: 'Is throbbing pain normal?',
        answer: 'Some throbbing is normal, especially when the wound is below heart level (due to blood flow). Throbbing that worsens or is accompanied by redness, swelling, or fever may indicate infection. Elevating the wound above heart level can reduce throbbing. Persistent severe throbbing should be evaluated.'
      },
      {
        question: 'Why does my wound hurt more at night?',
        answer: 'Nighttime pain increases because:\n• Fewer distractions from pain\n• Lying flat increases blood flow to wound\n• Pain medication may wear off\n• Body\'s natural anti-inflammatory hormones decrease at night\n\nTips: Take pain medication before bed, elevate the wound, use extra pillows for support.'
      },
      {
        question: 'How long will post-surgery pain last?',
        answer: 'Pain timeline varies by procedure:\n• Minor surgery: 3-7 days\n• Moderate surgery: 1-2 weeks\n• Major surgery: 2-6 weeks\n\nPain should peak at 2-3 days, then gradually improve. If pain persists or worsens after 2 weeks, consult your doctor.'
      },
      {
        question: 'Is burning sensation around the wound normal?',
        answer: 'Mild burning can be normal, especially as nerves regenerate during healing. However, intense burning may indicate:\n• Allergic reaction to dressing/tape\n• Infection beginning\n• Nerve damage\n\nIf burning is severe or accompanied by rash/redness, contact your healthcare provider.'
      },
      {
        question: 'Can I use numbing cream on my wound?',
        answer: 'Do not apply any numbing creams or lidocaine to open wounds unless prescribed by your doctor. These products can:\n• Delay healing\n• Mask warning signs of infection\n• Cause allergic reactions\n\nOnce the wound is fully closed, ask your doctor about appropriate pain relief options.'
      }
    ]
  },
  {
    id: 'stitches',
    name: 'Stitches & Staples',
    icon: '🧵',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    faqs: [
      {
        question: 'When will my stitches be removed?',
        answer: 'Stitch removal timeline by location:\n• Face: 5-7 days\n• Scalp: 7-10 days\n• Arms/hands: 7-10 days\n• Trunk/chest: 10-14 days\n• Legs/feet: 10-14 days\n• Joints: 14+ days\n\nDissolvable stitches absorb in 1-6 weeks. Never remove stitches yourself unless instructed.'
      },
      {
        question: 'Can I get my stitches wet?',
        answer: 'Keep stitches dry for the first 24-48 hours. After that, brief showering is usually okay - let water run over gently and pat dry. Avoid soaking in baths, pools, or hot tubs. Wet stitches can loosen and increase infection risk. Cover with waterproof dressing if needed.'
      },
      {
        question: 'My stitches are pulling - is that okay?',
        answer: 'Some tightness and pulling sensation is normal, especially with movement or swelling. However, if you notice:\n• Stitches cutting into skin\n• Skin bunching or puckering severely\n• Significant pain at stitch sites\n\nContact your doctor. The wound may need attention to prevent scarring or opening.'
      },
      {
        question: 'What if a stitch comes out early?',
        answer: 'If one stitch comes out:\n1. Don\'t panic - remaining stitches usually hold\n2. Keep the area clean\n3. Apply butterfly strips if wound gapes\n4. Cover with sterile dressing\n5. Contact your doctor for advice\n\nIf multiple stitches come out or the wound opens, seek medical care promptly.'
      },
      {
        question: 'Are staples better than stitches?',
        answer: 'Neither is universally better - each has uses:\n\nSTAPLES:\n• Faster to apply\n• Good for scalp, trunk\n• Easier removal\n\nSTITCHES:\n• Better for face/visible areas\n• More precise closure\n• Less scarring potential\n\nYour surgeon chooses based on wound location and type.'
      },
      {
        question: 'How do I care for my staples?',
        answer: 'Staple care is similar to stitches:\n• Keep dry for 24-48 hours\n• Clean gently with soap and water\n• Pat dry thoroughly\n• Apply antibiotic ointment if prescribed\n• Watch for infection signs\n• Don\'t pick at or pull staples\n• Return for removal as scheduled'
      },
      {
        question: 'Does removing stitches hurt?',
        answer: 'Stitch removal typically causes minimal discomfort - a slight tugging or pinching sensation. It takes only a few minutes. If you\'re anxious, let your healthcare provider know. Deep or infected stitches may cause more discomfort. Taking pain medication before your appointment can help.'
      },
      {
        question: 'What are dissolvable stitches?',
        answer: 'Dissolvable (absorbable) stitches break down naturally in the body over 1-6 weeks. They\'re used for:\n• Internal tissue layers\n• Areas hard to return for removal\n• Mouth and mucous membranes\n\nExternal dissolvable stitches may leave small bits - these can be gently removed once the wound is healed.'
      }
    ]
  },
  {
    id: 'bleeding',
    name: 'Bleeding & Drainage',
    icon: '🩸',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    faqs: [
      {
        question: 'Is some bleeding normal after surgery?',
        answer: 'Light bleeding or oozing in the first 24-48 hours is normal. To control it:\n1. Apply firm pressure with clean gauze for 10-15 minutes\n2. Don\'t keep checking - maintain continuous pressure\n3. Elevate the area above heart level\n4. Avoid blood thinners and aspirin\n\nSeek care if bleeding is heavy, soaking through bandages, or doesn\'t stop with pressure.'
      },
      {
        question: 'My wound is oozing - is this concerning?',
        answer: 'Light oozing of clear, pink, or slightly yellow fluid is normal for 2-5 days. This is serum/plasma and helps healing. Concerning signs:\n• Heavy or increasing drainage\n• Thick, colored discharge (green/brown)\n• Foul smell\n• Drainage beyond 5-7 days\n\nTrack the amount - a coin-sized spot is usually okay; palm-sized needs attention.'
      },
      {
        question: 'What type of drainage is normal?',
        answer: 'NORMAL DRAINAGE:\n• Serous: Clear, watery (lymph fluid)\n• Sanguineous: Light red/pink (blood-tinged)\n• Serosanguineous: Pink, watery mix\n\nABNORMAL DRAINAGE:\n• Purulent: Thick yellow/green/brown (pus = infection)\n• Foul-smelling: Any odor (infection)\n• Bloody after 48 hours: May need attention'
      },
      {
        question: 'How do I stop my wound from bleeding?',
        answer: 'To stop bleeding:\n1. Wash hands and wear gloves if available\n2. Apply firm, direct pressure with clean cloth/gauze\n3. Maintain pressure for 10-15 minutes WITHOUT checking\n4. Elevate above heart level if possible\n5. Once stopped, apply fresh dressing\n\nIf bleeding continues after 20 minutes of pressure, seek emergency care.'
      },
      {
        question: 'Why did my wound start bleeding again?',
        answer: 'Wounds can rebleed due to:\n• Physical activity or strain\n• Bump or pressure on wound\n• Blood pressure spike\n• Medication effects (blood thinners)\n• Dressing stuck to wound when changing\n• Scab being disturbed\n\nRest, apply pressure, and take it easy. Frequent rebleeding needs medical evaluation.'
      },
      {
        question: 'Is blood clotting around my wound normal?',
        answer: 'Yes, blood clots and scab formation are essential parts of healing. The clot:\n• Stops bleeding\n• Creates a protective barrier\n• Provides scaffold for new cells\n\nDon\'t pick at clots or scabs. If you see a large, painful blood collection (hematoma) forming under the skin, contact your doctor.'
      },
      {
        question: 'There\'s blood in my bandage - what should I do?',
        answer: 'Small amount (coin-sized): Normal in first 24-48 hours. Change dressing and monitor.\n\nModerate amount: Apply pressure for 10 minutes, then reassess. Reduce activity.\n\nSoaking through: Apply firm pressure and seek medical care. This may need attention.\n\nAlways note when bleeding occurred and what you were doing to help your doctor assess.'
      },
      {
        question: 'My wound has a bruise around it - is this okay?',
        answer: 'Bruising (purple/blue/green discoloration) around surgical wounds is normal and expected. Blood leaks into surrounding tissue during surgery. Bruises typically:\n• Appear within 24-48 hours\n• Change colors as they heal (purple → green → yellow)\n• Resolve in 2-3 weeks\n\nConcern: Rapidly expanding bruise or hard, painful lump (hematoma).'
      }
    ]
  },
  {
    id: 'activity',
    name: 'Activity & Lifestyle',
    icon: '🏃',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    faqs: [
      {
        question: 'When can I exercise after surgery?',
        answer: 'Activity guidelines:\n• Walking: Usually same day or next day\n• Light activity: 1-2 weeks\n• Moderate exercise: 3-4 weeks\n• Heavy lifting/intense exercise: 6-8 weeks\n\nThis varies by surgery type. Always follow your surgeon\'s specific restrictions. Start slowly and stop if you feel pain or strain on the wound.'
      },
      {
        question: 'When can I return to work?',
        answer: 'Return to work depends on:\n• Desk job: 1-2 weeks\n• Light physical work: 2-4 weeks\n• Heavy physical work: 6-8 weeks\n\nFactors include: pain control, wound location, ability to keep wound clean, and surgeon\'s clearance. Request modified duties if needed.'
      },
      {
        question: 'When can I drive after surgery?',
        answer: 'You can drive when:\n• Off narcotic pain medication\n• You can perform emergency maneuvers\n• Wound location doesn\'t limit movement\n• You feel alert and comfortable\n\nTypically 1-2 weeks for minor surgery. Some surgeries (abdominal, leg) require 4-6 weeks. Check with your surgeon and insurance company.'
      },
      {
        question: 'Can I lift heavy objects?',
        answer: 'Avoid heavy lifting to prevent:\n• Wound opening (dehiscence)\n• Hernia formation\n• Increased pain/swelling\n\nGuidelines:\n• First 2 weeks: Nothing over 5-10 lbs\n• Weeks 2-4: Gradually increase, no more than 15-20 lbs\n• Weeks 4-6+: Follow surgeon\'s guidance\n\nThis varies significantly by surgery type and location.'
      },
      {
        question: 'How should I sleep with my wound?',
        answer: 'Sleep tips for wound healing:\n• Elevate the wound above heart level if possible\n• Avoid lying directly on the wound\n• Use pillows for support and positioning\n• Wear loose, comfortable clothing\n• Take pain medication before bed if needed\n• Keep wound protected and dressing secure\n\nSleep is essential for healing - prioritize rest.'
      },
      {
        question: 'Can I have sex after surgery?',
        answer: 'Resume sexual activity when:\n• Pain is manageable\n• Wound is stable and closed\n• You can avoid strain on wound\n• Your doctor gives clearance\n\nTypically 2-6 weeks depending on surgery type and location. Start gently and stop if you experience pain or wound issues.'
      },
      {
        question: 'When can I travel after surgery?',
        answer: 'Travel considerations:\n• Short car trips: Usually okay within days\n• Long car trips: Wait 1-2 weeks\n• Air travel: Typically 2-4 weeks\n\nRisks of early travel: Blood clots (DVT), limited access to medical care, difficulty with wound care.\n\nAlways consult your surgeon before planning travel.'
      },
      {
        question: 'Can I drink alcohol during recovery?',
        answer: 'Avoid alcohol during recovery because:\n• Interacts with pain medications\n• Increases bleeding risk\n• Impairs immune function\n• Causes dehydration\n• Delays wound healing\n\nWait at least 1-2 weeks and until you\'re off pain medication. Moderate consumption only, as alcohol slows healing.'
      }
    ]
  },
  {
    id: 'nutrition',
    name: 'Diet & Nutrition',
    icon: '🍎',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    faqs: [
      {
        question: 'What foods help wound healing?',
        answer: 'HEALING SUPERFOODS:\n\n🥩 Protein: Chicken, fish, eggs, beans, Greek yogurt\n🍊 Vitamin C: Citrus, strawberries, bell peppers, broccoli\n🥕 Vitamin A: Carrots, sweet potatoes, leafy greens\n🥜 Zinc: Nuts, seeds, meat, legumes\n💧 Water: At least 8 glasses daily\n\nAim for balanced meals with plenty of protein - your body needs extra nutrients to rebuild tissue.'
      },
      {
        question: 'Should I take vitamins for healing?',
        answer: 'Helpful supplements for healing:\n• Vitamin C: 500-1000mg daily (collagen formation)\n• Zinc: 15-30mg daily (tissue repair)\n• Vitamin A: Supports immune function\n• Protein supplements: If intake is low\n\nConsult your doctor before starting supplements, especially if on medications. A balanced diet is usually sufficient for most people.'
      },
      {
        question: 'How much protein do I need for healing?',
        answer: 'Protein needs increase during healing:\n• Normal: 0.8g per kg body weight\n• Healing: 1.2-1.5g per kg body weight\n\nFor a 150 lb (68 kg) person: 80-100g protein daily\n\nGood sources: chicken breast (31g), Greek yogurt (17g), eggs (6g), fish (22g), beans (15g per cup). Space protein throughout the day.'
      },
      {
        question: 'Should I avoid any foods during recovery?',
        answer: 'Foods to limit during healing:\n• Alcohol: Delays healing, interacts with meds\n• Excess sugar: Can impair immune function\n• Highly processed foods: Low nutrient value\n• Excess salt: May increase swelling\n• Caffeine in excess: Can dehydrate\n\nIf on blood thinners, maintain consistent vitamin K intake (leafy greens).'
      },
      {
        question: 'Does smoking affect wound healing?',
        answer: '⚠️ Smoking significantly impairs wound healing:\n• Reduces blood flow to tissues\n• Decreases oxygen delivery\n• Impairs immune function\n• Increases infection risk (3-6x higher)\n• Delays healing by 50% or more\n• Increases scarring\n\nQuit or reduce smoking 4 weeks before and after surgery if possible. Even reducing helps.'
      },
      {
        question: 'How much water should I drink?',
        answer: 'Hydration is crucial for healing:\n• Minimum: 8 glasses (64 oz) daily\n• Better: Half your body weight in ounces\n• More if: Draining wounds, fever, hot weather\n\nSigns of dehydration:\n• Dark urine\n• Dry mouth\n• Fatigue\n• Decreased wound healing\n\nWater helps deliver nutrients and remove waste from healing tissues.'
      },
      {
        question: 'Does diabetes affect wound healing?',
        answer: 'Yes, diabetes significantly impacts healing:\n• High blood sugar impairs immune cells\n• Reduces blood flow to tissues\n• Increases infection risk\n• Slows tissue repair\n• Can cause neuropathy (nerve damage)\n\nManage blood sugar carefully during recovery. Check wounds more frequently. Report any changes immediately. You may need longer healing time.'
      },
      {
        question: 'I have no appetite after surgery - what should I do?',
        answer: 'Post-surgery appetite loss is common. Try:\n• Small, frequent meals instead of large ones\n• Protein shakes or smoothies\n• Soft, easy-to-digest foods\n• Stay hydrated with soups and broths\n• Avoid strong smells that may cause nausea\n• Eat your best meal when you feel hungriest\n\nIf poor appetite persists over a week, consult your doctor.'
      }
    ]
  },
  {
    id: 'scar',
    name: 'Scar Prevention',
    icon: '✨',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    faqs: [
      {
        question: 'How can I minimize scarring?',
        answer: 'SCAR PREVENTION TIPS:\n\n1. Keep wound moist (not wet) during healing\n2. Protect from sun exposure for 12+ months\n3. Don\'t pick scabs or stitches\n4. Avoid tension/stretching on wound\n5. Use silicone sheets/gel after wound closes\n6. Massage scar gently once healed\n7. Stay hydrated and eat well\n8. Don\'t smoke\n\nMost scars fade significantly over 12-24 months.'
      },
      {
        question: 'When should I start scar treatment?',
        answer: 'Timing for scar treatment:\n\n• Wait until: Wound is fully closed and sutures removed\n• Typically start: 2-3 weeks after surgery\n• Silicone products: Can start once wound is closed\n• Massage: Begin when skin is fully healed (2-4 weeks)\n• Sun protection: Immediately and ongoing\n\nStarting too early can reopen wounds or cause infection.'
      },
      {
        question: 'Do silicone scar sheets work?',
        answer: 'Yes, silicone products are clinically proven to improve scars:\n\nBenefits:\n• Reduce redness and thickness\n• Flatten raised scars\n• Soften scar tissue\n• Reduce itching\n\nUse 12-24 hours daily for 2-3 months. Options include sheets, gels, and tapes. Apply to clean, dry, fully healed skin only.'
      },
      {
        question: 'What is a keloid scar?',
        answer: 'Keloids are raised scars that grow beyond the original wound:\n\nCharacteristics:\n• Raised, thick, firm tissue\n• Extends past wound edges\n• May be itchy or painful\n• More common in darker skin tones\n\nTreatment options: Silicone therapy, steroid injections, pressure therapy, laser treatment, surgical revision. Consult a dermatologist for persistent keloids.'
      },
      {
        question: 'How do I massage my scar?',
        answer: 'Scar massage technique:\n\n1. Wait until wound is fully healed (2-4 weeks)\n2. Apply lotion or vitamin E oil\n3. Use firm, circular motions\n4. Massage 2-3 times daily for 5-10 minutes\n5. Apply pressure, but stop if painful\n\nBenefits: Breaks up scar tissue, improves flexibility, reduces thickness, promotes blood flow.'
      },
      {
        question: 'Will my scar fade over time?',
        answer: 'Yes! Scars continue to change for 1-2 years:\n\nTimeline:\n• 0-3 months: Red, raised, firm\n• 3-6 months: Pink, softening\n• 6-12 months: Pale, flattening\n• 12-24 months: Final appearance (pale, flat)\n\nProper care and sun protection significantly improve final results. Some scars may need professional treatment.'
      },
      {
        question: 'Should I keep my scar covered from sun?',
        answer: '☀️ YES! Sun protection is critical:\n\n• UV rays darken scars permanently\n• New scar tissue is very sensitive\n• Sun damage worsens appearance\n\nProtection:\n• Cover with clothing when possible\n• Apply SPF 30+ sunscreen daily\n• Continue for 12-18 months\n• Reapply sunscreen every 2 hours outdoors\n\nThis is one of the most important things you can do for scar appearance.'
      },
      {
        question: 'When should I see a doctor about my scar?',
        answer: 'See a doctor if your scar:\n• Becomes painful or very itchy\n• Grows beyond original wound (keloid)\n• Becomes very thick or raised\n• Limits movement or function\n• Causes emotional distress\n• Shows signs of wound reopening\n\nTreatment options: Steroid injections, laser therapy, silicone therapy, surgical revision, pressure therapy.'
      }
    ]
  },
  {
    id: 'fever',
    name: 'Fever & Systemic Signs',
    icon: '🌡️',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    faqs: [
      {
        question: 'Is fever normal after surgery?',
        answer: 'Low-grade fever (up to 100.4°F/38°C) is common in first 48 hours after surgery due to inflammatory response.\n\n⚠️ CONCERNING FEVER:\n• Above 101°F (38.3°C)\n• Lasting more than 48 hours\n• Accompanied by wound changes\n• With chills or shaking\n• Getting worse over time\n\nContact your doctor for persistent or high fever.'
      },
      {
        question: 'I have chills - should I be worried?',
        answer: 'Chills can indicate:\n\n• Fever response (common)\n• Medication reaction\n• Infection developing\n• Anesthesia wearing off\n\n⚠️ Seek care if chills with:\n• High fever (>101°F)\n• Wound redness/drainage\n• Increasing pain\n• Rapid heartbeat\n• Confusion\n\nMild chills in first 24 hours may be normal. Persistent chills need evaluation.'
      },
      {
        question: 'I feel weak and tired - is this normal?',
        answer: 'Yes, fatigue is normal after surgery:\n\nCauses:\n• Anesthesia effects (days to weeks)\n• Body healing (uses energy)\n• Pain medication side effects\n• Reduced activity\n• Poor sleep\n\nHelp recovery:\n• Rest frequently\n• Gradually increase activity\n• Stay hydrated\n• Eat nutritious foods\n• Be patient - energy returns gradually over 2-6 weeks'
      },
      {
        question: 'I\'m nauseous after surgery - what helps?',
        answer: 'Post-surgery nausea is common. To help:\n\n• Eat small, bland meals (crackers, toast)\n• Sip ginger ale or ginger tea\n• Avoid greasy or spicy foods\n• Take pain meds with food\n• Stay hydrated with clear fluids\n• Rest in a semi-upright position\n• Get fresh air if possible\n\nContact doctor if: Vomiting blood, can\'t keep fluids down for 24 hours, or severe abdominal pain.'
      },
      {
        question: 'When should fever concern me?',
        answer: '🚨 SEEK MEDICAL CARE FOR:\n\n• Fever above 101°F (38.3°C)\n• Fever lasting more than 48 hours\n• Fever with wound redness/pus\n• Fever with increasing pain\n• Chills and shaking\n• Fever with confusion\n• Fever with difficulty breathing\n\nA fever spike 4-7 days post-surgery often indicates infection. Don\'t ignore it.'
      },
      {
        question: 'Is it normal to have night sweats?',
        answer: 'Night sweats can occur after surgery due to:\n\n• Fever breaking\n• Medication effects\n• Hormone changes\n• Healing process\n• Infection (if persistent)\n\nConcerning if:\n• Drenching sweats repeatedly\n• Accompanied by fever\n• Wound looks infected\n• You feel increasingly unwell\n\nKeep room cool, wear breathable fabrics, and monitor your temperature.'
      },
      {
        question: 'I have a headache - is this related to surgery?',
        answer: 'Post-surgery headaches can result from:\n\n• Dehydration (most common)\n• Anesthesia effects\n• Blood pressure changes\n• Caffeine withdrawal\n• Pain medication effects\n• Stress and muscle tension\n\nTreatment:\n• Increase fluid intake\n• Rest in a dark, quiet room\n• Take acetaminophen if not contraindicated\n• Limit screen time\n\nPersistent or severe headache needs medical evaluation.'
      },
      {
        question: 'I feel dizzy when I stand up - why?',
        answer: 'Dizziness after surgery is common:\n\nCauses:\n• Blood pressure changes (orthostatic hypotension)\n• Dehydration\n• Blood loss during surgery\n• Pain medications\n• Getting up too quickly\n\nPrevention:\n• Sit up slowly, pause, then stand\n• Drink plenty of fluids\n• Avoid sudden movements\n• Hold onto stable objects\n• Don\'t drive until resolved\n\nIf persistent or with fainting, contact your doctor.'
      }
    ]
  },
  {
    id: 'emergency',
    name: 'Emergency Signs',
    icon: '🚨',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    faqs: [
      {
        question: 'What are emergency warning signs?',
        answer: '🚨 GO TO ER IMMEDIATELY FOR:\n\n• Severe, uncontrolled bleeding\n• Wound completely opens up\n• High fever (>103°F/39.4°C)\n• Red streaks spreading from wound\n• Severe allergic reaction\n• Difficulty breathing\n• Chest pain\n• Signs of blood clot (leg swelling, pain)\n• Confusion or altered consciousness\n• Pus with severe spreading redness\n\nDon\'t wait - call 911 or go to emergency room.'
      },
      {
        question: 'My wound has opened up - what should I do?',
        answer: 'If your wound opens (dehiscence):\n\n1. Stay calm\n2. If internal organs visible: Cover with clean, moist cloth, call 911\n3. If minor opening: Apply gentle pressure with clean gauze\n4. Do NOT try to push anything back in\n5. Do NOT eat or drink (may need surgery)\n6. Cover with sterile dressing\n7. Go to ER or call your surgeon immediately\n\nThis needs prompt medical evaluation.'
      },
      {
        question: 'I see red streaks from my wound - is this serious?',
        answer: '🚨 YES - THIS IS SERIOUS!\n\nRed streaks indicate lymphangitis (spreading infection). This is a MEDICAL EMERGENCY.\n\n• Can progress to sepsis (blood infection)\n• Needs immediate IV antibiotics\n• Do NOT wait to see if it improves\n\nACTION: Go to emergency room NOW or call 911. Take a photo to show spreading if possible. Time is critical.'
      },
      {
        question: 'When should I call 911?',
        answer: 'CALL 911 FOR:\n\n🚨 Breathing difficulty\n🚨 Chest pain\n🚨 Uncontrolled bleeding\n🚨 Wound with organs exposed\n🚨 Signs of stroke (face drooping, arm weakness, speech difficulty)\n🚨 Severe allergic reaction (swelling, hives, breathing issues)\n🚨 Loss of consciousness\n🚨 Signs of sepsis (high fever, confusion, rapid breathing)\n🚨 Suspected blood clot in lungs\n\nBetter to call and not need it than wait too long.'
      },
      {
        question: 'I\'m having an allergic reaction - what do I do?',
        answer: 'ALLERGIC REACTION STEPS:\n\nMILD (rash, itching):\n• Stop using suspected product\n• Take antihistamine (Benadryl)\n• Monitor for worsening\n\nSEVERE (call 911):\n• Swelling of face/throat\n• Difficulty breathing\n• Rapid heartbeat\n• Dizziness/fainting\n• Use EpiPen if available\n• Call 911 immediately\n\nCommon causes: antibiotics, latex, tape adhesive, dressing materials.'
      },
      {
        question: 'What is sepsis and how do I recognize it?',
        answer: '🚨 SEPSIS IS A LIFE-THREATENING EMERGENCY\n\nSepsis = body\'s extreme response to infection\n\nSIGNS (2+ = seek care immediately):\n• Temperature >101°F or <96.8°F\n• Heart rate >90 beats/min\n• Breathing rate >20 breaths/min\n• Confusion or disorientation\n• Extreme pain or discomfort\n• Clammy or sweaty skin\n\nACTION: Call 911 or go to ER immediately. Say \"I\'m concerned about sepsis.\" Time = survival.'
      },
      {
        question: 'How do I know if I have a blood clot?',
        answer: 'BLOOD CLOT WARNING SIGNS:\n\nIn leg (DVT):\n• Swelling in one leg (not both)\n• Pain/tenderness (often calf)\n• Red or discolored skin\n• Warm to touch\n\nIn lungs (PE) - EMERGENCY:\n• Sudden shortness of breath\n• Chest pain (worse with breathing)\n• Rapid heartbeat\n• Coughing up blood\n• Feeling faint\n\nRisk increases after surgery. If suspected, seek immediate medical care.'
      },
      {
        question: 'I think my wound is seriously infected - what now?',
        answer: 'SERIOUS INFECTION SIGNS:\n\n• Spreading redness beyond wound\n• Red streaks\n• Severe swelling\n• Fever >101°F\n• Pus or foul drainage\n• Increasing severe pain\n• Feeling very unwell\n\nACTION:\n1. Don\'t wait for your doctor\'s office\n2. Go to ER or urgent care TODAY\n3. Take photos to show progression\n4. List all medications you\'re taking\n5. Don\'t start antibiotics without doctor\n\nDelaying treatment risks sepsis and complications.'
      }
    ]
  },
  {
    id: 'special',
    name: 'Special Conditions',
    icon: '⚕️',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    faqs: [
      {
        question: 'How does diabetes affect my wound healing?',
        answer: 'Diabetes significantly impacts healing:\n\n• High blood sugar impairs white blood cells\n• Reduced blood circulation\n• Nerve damage may hide pain/problems\n• Higher infection risk\n• Slower tissue repair\n\nManagement:\n• Keep blood sugar well-controlled\n• Check wound daily (use mirror if needed)\n• Keep wound clean and dry\n• Report ANY changes promptly\n• May need longer healing time and closer monitoring'
      },
      {
        question: 'I\'m on blood thinners - what should I know?',
        answer: 'Blood thinner considerations:\n\n• Expect more bleeding/bruising\n• Minor cuts take longer to stop\n• Keep pressure supplies handy\n• Report heavy bleeding immediately\n\nDO NOT:\n• Stop medication without doctor\'s order\n• Take aspirin or ibuprofen (unless approved)\n• Use razors near wound\n• Pick at scabs\n\nTell all healthcare providers about your blood thinners.'
      },
      {
        question: 'Does my age affect wound healing?',
        answer: 'Age affects healing:\n\n• Skin becomes thinner and less elastic\n• Blood flow to skin decreases\n• Immune response may be slower\n• Chronic conditions more common\n• May need more protein/nutrients\n\nOlder adults should:\n• Be patient - healing takes longer\n• Monitor wounds more closely\n• Maintain good nutrition\n• Stay moderately active\n• Keep all follow-up appointments'
      },
      {
        question: 'I\'m taking steroids - how does this affect healing?',
        answer: 'Steroid effects on healing:\n\n• Suppresses immune response\n• Reduces inflammation (also slows healing)\n• Thins skin\n• Increases infection risk\n• Delays wound closure\n\nManagement:\n• Don\'t stop steroids without doctor advice\n• Monitor wound very closely\n• Report any infection signs early\n• May need longer to heal\n• Consider additional wound support'
      },
      {
        question: 'How does obesity affect wound healing?',
        answer: 'Obesity impacts healing:\n\n• Reduced blood flow to fatty tissue\n• Higher infection risk\n• Increased wound tension\n• Longer surgical procedures\n• Higher risk of wound opening\n\nSupport healing:\n• Follow activity restrictions carefully\n• Use abdominal binder if recommended\n• Eat protein-rich, nutritious foods\n• Keep wound clean and dry in skin folds\n• Report any wound changes promptly'
      },
      {
        question: 'I have poor circulation - what should I watch for?',
        answer: 'Poor circulation concerns:\n\n• Wounds heal slower (especially legs/feet)\n• Higher infection risk\n• Tissue may not get enough oxygen\n• Small wounds can become serious\n\nWatch for:\n• Wound not improving after 2 weeks\n• Skin color changes (pale, blue, black)\n• Cold skin around wound\n• Increased pain\n• Slow or no new tissue growth\n\nYou may need specialized wound care.'
      },
      {
        question: 'I\'m pregnant - are wound care products safe?',
        answer: 'Pregnancy wound care considerations:\n\n✅ USUALLY SAFE:\n• Gentle soap and water\n• Saline solution\n• Sterile dressings\n• Acetaminophen (Tylenol)\n\n⚠️ ASK DOCTOR FIRST:\n• Topical antibiotics\n• Ibuprofen (especially 3rd trimester)\n• Any new medications\n• Herbal products\n\nAlways inform healthcare providers about your pregnancy.'
      },
      {
        question: 'Can stress affect my wound healing?',
        answer: 'Yes, stress impacts healing:\n\n• Elevates cortisol (slows healing)\n• Reduces immune function\n• Disrupts sleep (needed for healing)\n• May lead to poor self-care\n• Increases inflammation\n\nStress management:\n• Practice deep breathing\n• Get adequate sleep\n• Accept help from others\n• Stay connected with support system\n• Consider meditation or gentle yoga\n• Talk to doctor if struggling'
      }
    ]
  }
];

export function ChatScreen({ onNavigate }: ChatScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

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
            <h1 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h1>
            <p className="text-sm text-gray-500">
              {selectedFAQ ? selectedCategory?.name : selectedCategory ? `${selectedCategory.name}` : 'Select a topic to learn more'}
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
                  <p className="text-sm text-gray-500 mb-1">Your Question</p>
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
                <span className="font-medium text-gray-800">Answer</span>
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
                  This information is for educational purposes only. Always consult your doctor for medical advice specific to your situation.
                </p>
              </div>
            </div>

            {/* Browse More Button */}
            <button
              onClick={handleBrowseMore}
              className="w-full bg-[#2F80ED] text-white py-4 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-[#2563eb] transition-colors"
            >
              Browse More Questions
            </button>

            {/* Other Questions in Category */}
            {selectedCategory && selectedCategory.faqs.filter(f => f !== selectedFAQ).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Related Questions</h3>
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
                  <p className="text-gray-600">{selectedCategory.faqs.length} questions</p>
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
                  <h2 className="text-lg font-semibold">Find Answers</h2>
                  <p className="text-white/80 text-sm">Tap a category below to browse questions about surgical wound care</p>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Topic</h3>
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
                  <p className="text-xs text-gray-500">{category.faqs.length} questions</p>
                </button>
              ))}
            </div>

            {/* Most Popular Questions */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Asked Questions</h3>
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
                  <h4 className="font-semibold text-red-800">Emergency?</h4>
                  <p className="text-sm text-red-700 mt-1">
                    If you have severe bleeding, high fever, or signs of serious infection, call 911 or go to the emergency room immediately.
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
