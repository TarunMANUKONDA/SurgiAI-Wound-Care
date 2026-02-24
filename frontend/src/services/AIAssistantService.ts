// Comprehensive AI Assistant Service for Surgical Wound Care

export interface AIResponse {
  message: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  relatedTopics?: string[];
  disclaimer?: string;
}

interface KnowledgeBase {
  keywords: string[];
  response: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  relatedTopics: string[];
  category: string;
}

const knowledgeBase: KnowledgeBase[] = [
  // NORMAL HEALING
  {
    keywords: ['normal', 'healing', 'normal healing', 'how does normal', 'what is normal', 'expected', 'typical'],
    response: `**Normal Wound Healing Signs:**

✅ **Days 1-3 (Inflammatory Phase):**
• Redness around wound edges (within 1-2cm)
• Mild swelling
• Slight warmth
• Clear to slightly pink drainage
• Moderate pain that improves daily

✅ **Days 4-7 (Early Proliferative):**
• Redness starts to fade
• Swelling decreases
• Pink granulation tissue forming
• Edges coming together
• Less drainage

✅ **Days 7-14 (Late Proliferative):**
• Wound edges sealed
• New skin forming
• Minimal to no drainage
• Itching (sign of healing!)
• Sutures ready for removal

✅ **Weeks 3-6 (Maturation):**
• Scar forming
• Color changes from red to pink to white
• Continued strengthening

**When to be concerned:** If healing seems slower than these timelines, consult your doctor.`,
    confidence: 92,
    urgency: 'low',
    relatedTopics: ['Healing timeline', 'Wound stages', 'Scar formation'],
    category: 'healing'
  },

  // INFECTION SIGNS
  {
    keywords: ['infection', 'infected', 'signs of infection', 'how to know infection', 'is it infected', 'infection symptoms'],
    response: `🚨 **Warning Signs of Wound Infection:**

**Seek Medical Care If You Notice:**

🔴 **Redness:**
• Spreading beyond 2cm from wound edges
• Red streaks moving away from wound
• Increasing rather than decreasing

🟡 **Discharge:**
• Yellow, green, or brown pus
• Foul or unusual odor
• Increasing amount of drainage

🌡️ **Fever:**
• Temperature above 100.4°F (38°C)
• Chills or sweating
• General feeling of being unwell

😣 **Pain:**
• Pain getting worse after day 2-3
• Throbbing or pulsating pain
• Pain not relieved by medication

🔥 **Other Signs:**
• Increased swelling after day 3
• Hot to touch around wound
• Wound opening up
• Black or dead tissue

**⚠️ URGENT: If you have multiple signs, contact your healthcare provider within 24 hours.**
**🚨 EMERGENCY: Fever with red streaks = seek care immediately.**`,
    confidence: 95,
    urgency: 'high',
    relatedTopics: ['Antibiotics', 'Doctor visit', 'Emergency signs'],
    category: 'infection'
  },

  // BATHING & SHOWERING
  {
    keywords: ['bath', 'bathe', 'shower', 'water', 'wet', 'swimming', 'pool', 'can i shower', 'getting wet', 'wash'],
    response: `🛁 **Bathing & Showering Guidelines:**

**✅ Showering (Usually OK after 24-48 hours):**
• Quick showers are usually safe after 24-48 hours
• Let water run over wound briefly
• Don't direct water stream at wound
• Pat dry gently with clean towel
• Apply fresh dressing immediately after

**❌ Avoid:**
• Submerging wound in bath, pool, or hot tub for 2-4 weeks
• Long hot showers (steam can loosen dressings)
• Scrubbing or rubbing the wound area
• Using harsh soaps directly on wound

**🩹 Waterproof Protection:**
• Use waterproof dressing for showering
• Plastic wrap can provide temporary cover
• Change dressing after getting wet

**⏰ Timeline:**
• Days 1-2: Sponge bath only, keep wound dry
• Days 3-7: Quick showers with protection
• After suture removal: Gentle washing OK
• 2-4 weeks: Swimming/bathing may resume

**Ask your surgeon for specific instructions based on your wound type.**`,
    confidence: 88,
    urgency: 'low',
    relatedTopics: ['Dressing changes', 'Wound protection', 'Hygiene'],
    category: 'bathing'
  },

  // STITCHES & SUTURES
  {
    keywords: ['stitch', 'stitches', 'suture', 'sutures', 'remove', 'removal', 'dissolve', 'dissolvable', 'when remove stitches', 'staples'],
    response: `🧵 **Sutures & Stitches Guide:**

**⏰ Removal Timeline by Location:**
• Face: 5-7 days
• Scalp: 7-10 days
• Arms/Hands: 7-10 days
• Trunk/Abdomen: 10-14 days
• Legs/Feet: 10-14 days
• Joints: 14+ days
• Chest/Back: 10-14 days

**Types of Sutures:**

📌 **Non-Dissolvable (Need Removal):**
• Nylon, silk, or polypropylene
• Must be removed by healthcare provider
• Don't attempt to remove yourself

📌 **Dissolvable (Absorb on Their Own):**
• Take 1-8 weeks to dissolve
• No removal needed
• May see small pieces fall off

📌 **Staples:**
• Usually removed at 7-14 days
• Require special staple remover

**⚠️ Signs Sutures Need Attention:**
• Suture pulling through skin
• Gap forming between edges
• Suture coming loose before appointment
• Redness around suture sites

**Never remove sutures yourself unless instructed by your doctor.**`,
    confidence: 90,
    urgency: 'low',
    relatedTopics: ['Wound closure', 'Scar care', 'Follow-up visits'],
    category: 'sutures'
  },

  // PAIN MANAGEMENT
  {
    keywords: ['pain', 'hurt', 'hurts', 'painful', 'sore', 'ache', 'throbbing', 'pain management', 'pain relief', 'painkiller', 'medication'],
    response: `💊 **Pain Management Guidelines:**

**Normal Pain Pattern:**
• Days 1-2: Moderate to significant pain
• Days 3-5: Pain should decrease daily
• Week 2+: Minimal discomfort

**✅ Pain Relief Options:**

💊 **Medications:**
• Take prescribed pain meds as directed
• Don't skip doses the first 24-48 hours
• Over-the-counter: Acetaminophen (Tylenol)
• Ask before taking NSAIDs (ibuprofen) - may affect healing

🧊 **Ice Therapy:**
• Apply ice pack wrapped in cloth
• 15-20 minutes on, 30 minutes off
• Helps reduce swelling and pain
• Most effective first 48-72 hours

🛋️ **Positioning:**
• Elevate wound above heart level when possible
• Use pillows for support
• Reduces swelling and pain

**⚠️ Concerning Pain Signs:**
• Pain getting worse after day 2-3
• Pain not controlled by medication
• Throbbing or pulsating pain
• Pain with fever or redness

**🚨 Seek care if pain suddenly increases or changes character.**`,
    confidence: 88,
    urgency: 'medium',
    relatedTopics: ['Swelling', 'Ice therapy', 'Medications'],
    category: 'pain'
  },

  // BLEEDING
  {
    keywords: ['bleeding', 'blood', 'bleed', 'bloody', 'hemorrhage', 'oozing', 'is bleeding normal'],
    response: `🩸 **Bleeding & Drainage Guidelines:**

**Normal Bleeding:**
• Light oozing for first 24-48 hours
• Small amount of blood-tinged drainage
• Bleeding that stops with gentle pressure

**🩹 How to Control Bleeding:**
1. Apply firm, direct pressure
2. Use clean cloth or gauze
3. Hold pressure for 10-15 minutes
4. Don't peek - continuous pressure
5. Elevate the area if possible

**Types of Drainage:**
• 🔴 Bloody (first 24-48 hrs): Normal
• 🩷 Pink/blood-tinged: Normal early on
• 💧 Clear/straw-colored: Normal
• 🟡 Yellow/green: Possible infection
• 🟤 Brown/foul smell: Seek care

**⚠️ Seek Medical Care If:**
• Bleeding soaks through bandages
• Bleeding won't stop after 15 min pressure
• Spurting or pulsating blood
• Large amount of blood clots
• Bleeding restarts repeatedly

**🚨 EMERGENCY:** Heavy, uncontrolled bleeding - Call 911`,
    confidence: 92,
    urgency: 'medium',
    relatedTopics: ['Dressing changes', 'Wound care', 'Emergency signs'],
    category: 'bleeding'
  },

  // WOUND CLEANING
  {
    keywords: ['clean', 'cleaning', 'wash', 'washing', 'cleanse', 'how to clean', 'saline', 'soap', 'disinfect', 'antiseptic'],
    response: `🧼 **Wound Cleaning Instructions:**

**✅ Basic Cleaning Steps:**
1. Wash your hands thoroughly first
2. Remove old dressing gently
3. Clean wound with recommended solution
4. Pat dry with clean gauze
5. Apply prescribed ointment if any
6. Cover with fresh dressing

**Cleaning Solutions:**
• 💧 Normal saline (preferred)
• 💧 Clean running water
• 💧 Mild soap and water (around wound)

**❌ Avoid Using:**
• Hydrogen peroxide (damages new tissue)
• Alcohol (too harsh, delays healing)
• Iodine (unless prescribed)
• Cotton balls (leave fibers)

**Frequency:**
• First week: Clean 1-2 times daily
• After suture removal: Once daily
• Or as directed by your doctor

**🩹 Cleaning Tips:**
• Be gentle - don't scrub
• Clean from center outward
• Use new gauze for each wipe
• Check for signs of infection while cleaning

**If wound has heavy drainage, may need more frequent cleaning.**`,
    confidence: 90,
    urgency: 'low',
    relatedTopics: ['Dressing changes', 'Wound care', 'Supplies'],
    category: 'cleaning'
  },

  // DRESSING CHANGES
  {
    keywords: ['dressing', 'bandage', 'gauze', 'change dressing', 'how often', 'dressing change', 'cover', 'wrap'],
    response: `🩹 **Dressing Change Guidelines:**

**⏰ How Often:**
• Days 1-3: Change if wet, soiled, or as directed
• Days 4-7: Daily changes typically
• Week 2+: Every 1-2 days
• Heavily draining: May need 2-3x daily

**📋 Steps for Changing:**
1. Gather all supplies first
2. Wash hands with soap & water
3. Remove old dressing gently
4. Clean wound as instructed
5. Apply any prescribed ointments
6. Place new dressing
7. Secure with tape (not too tight)
8. Dispose of old dressing properly

**Types of Dressings:**
• Gauze pads (standard coverage)
• Non-stick pads (for delicate wounds)
• Foam dressings (absorb drainage)
• Hydrocolloid (promotes moist healing)
• Transparent film (protects, waterproof)

**Signs to Change Immediately:**
• Dressing is wet or soaked
• Visible dirt or contamination
• Coming loose or falling off
• Foul odor through dressing

**Keep wound covered until healed unless told otherwise.**`,
    confidence: 88,
    urgency: 'low',
    relatedTopics: ['Wound cleaning', 'Supplies needed', 'Healing stages'],
    category: 'dressing'
  },

  // SWELLING
  {
    keywords: ['swelling', 'swollen', 'swell', 'puffy', 'edema', 'is swelling normal', 'reduce swelling'],
    response: `🔵 **Swelling Guidelines:**

**Normal Swelling:**
• Days 1-3: Expected, may increase
• Days 4-7: Should start decreasing
• Week 2: Mostly resolved

**✅ How to Reduce Swelling:**

🧊 **Ice/Cold Therapy:**
• First 48-72 hours
• 15-20 min on, 30 min off
• Wrap ice pack in cloth

⬆️ **Elevation:**
• Keep wound above heart level
• Use pillows for support
• Especially important at night

🏃 **Movement:**
• Gentle movement prevents stiffness
• Promotes circulation
• Follow activity restrictions

🩹 **Compression:**
• If recommended by doctor
• Not too tight
• Check for numbness

**⚠️ Concerning Swelling:**
• Swelling increases after day 3
• Severe swelling with tight skin
• Swelling with redness spreading
• Swelling with numbness/tingling
• One limb much larger than other

**🚨 Seek immediate care if swelling comes with difficulty breathing or spreading redness.**`,
    confidence: 86,
    urgency: 'low',
    relatedTopics: ['Ice therapy', 'Elevation', 'Infection signs'],
    category: 'swelling'
  },

  // SCAR CARE
  {
    keywords: ['scar', 'scars', 'scarring', 'minimize scar', 'scar treatment', 'scar gel', 'reduce scar', 'will it scar', 'keloid'],
    response: `✨ **Scar Care & Minimization:**

**Scar Formation Timeline:**
• Week 2-3: Initial scar forms (red/pink)
• Months 1-3: Scar matures, may be raised
• Months 6-12: Continues to fade
• Year 1-2: Final appearance

**✅ Tips to Minimize Scarring:**

🧴 **Silicone Products (Most Effective):**
• Start after wound fully closed
• Silicone gel sheets or gel
• Use 12+ hours daily
• Continue for 2-3 months

☀️ **Sun Protection (Critical!):**
• Keep scar out of sun for 1 year
• Use SPF 30+ sunscreen
• UV exposure darkens scars permanently

💆 **Massage:**
• Start 2-3 weeks after closure
• Gentle circular motions
• 5-10 minutes, 2-3 times daily
• Helps break down scar tissue

🧴 **Moisturize:**
• Keep scar hydrated
• Vitamin E oil (after fully healed)
• Cocoa butter or specialized creams

**Types of Scars:**
• Normal: Flat, pale line
• Hypertrophic: Raised, red (stays within wound)
• Keloid: Grows beyond wound edges

**See a dermatologist if scar is raised, painful, or growing.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Healing timeline', 'Sun protection', 'Massage therapy'],
    category: 'scar'
  },

  // ACTIVITY & EXERCISE
  {
    keywords: ['exercise', 'activity', 'sport', 'gym', 'lift', 'lifting', 'work out', 'walking', 'running', 'when can i exercise', 'physical activity', 'return to work'],
    response: `🏃 **Activity & Exercise Guidelines:**

**⏰ General Timeline:**

**Days 1-3:**
• Rest is essential
• Light walking OK
• No lifting over 5-10 lbs

**Week 1:**
• Light daily activities
• Short walks
• No stretching or straining wound

**Weeks 2-3:**
• Gradually increase activity
• Light walking longer distances
• May return to desk work

**Weeks 4-6:**
• Most normal activities resume
• Light exercise may begin
• No heavy lifting yet

**Weeks 6-8+:**
• Full activity usually OK
• Return to gym/sports
• Based on surgeon approval

**❌ Activities to Avoid:**
• Heavy lifting (varies by surgery)
• Swimming/submerging wound
• Contact sports
• Exercises that strain incision
• Driving (while on pain meds)

**⚠️ Warning Signs During Activity:**
• Pain at incision site
• Pulling or tearing sensation
• Bleeding or increased drainage
• Wound opening

**Always follow your surgeon's specific restrictions.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Return to work', 'Lifting restrictions', 'Healing timeline'],
    category: 'activity'
  },

  // NUTRITION
  {
    keywords: ['nutrition', 'diet', 'food', 'eat', 'eating', 'protein', 'vitamin', 'what to eat', 'foods for healing', 'supplements'],
    response: `🍎 **Nutrition for Wound Healing:**

**🥩 Protein (Most Important!):**
• Builds new tissue
• Aim for 1.5-2x normal intake
• Sources: Meat, fish, eggs, dairy, beans
• Consider protein supplements

**🍊 Vitamin C:**
• Essential for collagen formation
• Citrus fruits, berries, peppers
• Tomatoes, broccoli, spinach

**🥕 Vitamin A:**
• Supports immune function
• Sweet potatoes, carrots
• Leafy greens, eggs

**💊 Zinc:**
• Critical for tissue repair
• Meat, shellfish, legumes
• Seeds, nuts, dairy

**💧 Hydration:**
• Drink 8-10 glasses water daily
• Supports all healing processes
• Avoid excess caffeine/alcohol

**❌ Foods to Limit:**
• Excess sugar (impairs healing)
• Alcohol (delays healing)
• Processed foods
• Excess sodium (increases swelling)

**📋 Sample Healing Diet:**
• Breakfast: Eggs, whole grain toast, orange juice
• Lunch: Chicken salad, vegetables
• Dinner: Fish, sweet potato, greens
• Snacks: Nuts, yogurt, berries

**Consider a multivitamin if appetite is poor.**`,
    confidence: 88,
    urgency: 'low',
    relatedTopics: ['Healing stages', 'Supplements', 'Hydration'],
    category: 'nutrition'
  },

  // EMERGENCY SIGNS
  {
    keywords: ['emergency', 'urgent', '911', 'hospital', 'er', 'serious', 'dangerous', 'emergency room', 'when to go to hospital'],
    response: `🚨 **Emergency Warning Signs:**

**Call 911 or Go to ER Immediately If:**

🔴 **Severe Bleeding:**
• Blood spurting or pulsating
• Bleeding won't stop with pressure
• Soaking through multiple bandages

🔴 **Signs of Severe Infection:**
• High fever (>101°F/38.5°C) with wound symptoms
• Red streaks spreading from wound
• Rapid heart rate
• Confusion or disorientation

🔴 **Breathing Problems:**
• Difficulty breathing
• Chest pain
• Swelling of face/throat

🔴 **Circulation Issues:**
• Limb turning blue/gray/white
• Severe numbness
• No pulse below wound

🔴 **Wound Emergencies:**
• Wound completely opened (dehiscence)
• Organs or deep tissue visible
• Severe uncontrolled pain

**⚠️ Seek Same-Day Care If:**
• Fever 100.4°F+ (38°C+)
• Increasing pain after day 2-3
• Pus or foul-smelling discharge
• Expanding redness
• Wound opening

**When in doubt, call your surgeon's office or nurse hotline.**`,
    confidence: 98,
    urgency: 'emergency',
    relatedTopics: ['Infection signs', 'Bleeding', 'When to call doctor'],
    category: 'emergency'
  },

  // REDNESS
  {
    keywords: ['red', 'redness', 'is redness normal', 'red around wound', 'pink', 'spreading redness', 'erythema'],
    response: `🔴 **Understanding Wound Redness:**

**✅ Normal Redness:**
• Limited to 1-2 cm around wound edges
• Decreases over first week
• No spreading or streaking
• Not hot to touch

**📏 How to Monitor:**
• Mark the edge of redness with pen
• Check every 6-12 hours
• Take photos for comparison
• Note if it's spreading

**⚠️ Concerning Redness:**
• Spreading beyond 2cm from edges
• Red streaks moving away from wound
• Increasing instead of decreasing
• Hot to touch
• Comes with fever or pus

**🔴 Types of Concerning Redness:**

📍 **Cellulitis (Skin Infection):**
• Spreading redness beyond wound
• Warm, tender skin
• May have fever
• Needs antibiotics

📍 **Lymphangitis (Serious!):**
• Red streaks toward body center
• Following lymph channels
• Medical emergency
• Go to ER immediately

**⏰ Timeline:**
• Days 1-3: Some redness expected
• Days 4-7: Should be fading
• Week 2+: Minimal redness

**If redness is spreading, draw a line around it and seek care if it expands.**`,
    confidence: 90,
    urgency: 'medium',
    relatedTopics: ['Infection signs', 'Cellulitis', 'When to call doctor'],
    category: 'redness'
  },

  // FEVER
  {
    keywords: ['fever', 'temperature', 'hot', 'chills', 'sweating', 'do i have fever', 'fever normal'],
    response: `🌡️ **Fever & Temperature Guidelines:**

**Normal vs Concerning:**
• ✅ Up to 100.4°F (38°C): Low-grade, may be normal 24-48hrs post-surgery
• ⚠️ 100.4-102°F (38-39°C): Contact your doctor
• 🚨 Above 102°F (39°C): Seek immediate care

**📋 Common Causes of Post-Surgery Fever:**

**Days 1-2 (Often Normal):**
• Body's response to surgery
• Inflammation from healing
• Anesthesia effects

**Days 3+ (More Concerning):**
• Wound infection
• Urinary tract infection
• Pneumonia (esp. after major surgery)
• Deep vein thrombosis

**⚠️ Seek Care If Fever Comes With:**
• Wound redness/swelling increasing
• Pus or foul-smelling drainage
• Severe pain
• Chills or shaking
• Difficulty breathing
• Confusion

**🏠 Home Care for Low Fever:**
• Stay hydrated
• Rest
• Take acetaminophen if OK'd
• Monitor wound closely
• Check temperature every 4-6 hours

**🚨 Any fever after day 3 should be reported to your healthcare provider.**`,
    confidence: 92,
    urgency: 'high',
    relatedTopics: ['Infection signs', 'Emergency signs', 'When to call doctor'],
    category: 'fever'
  },

  // ITCHING
  {
    keywords: ['itch', 'itchy', 'itching', 'scratch', 'is itching normal', 'why does it itch', 'tingling'],
    response: `🪲 **Itching & Wound Healing:**

**✅ Good News: Itching Often Means Healing!**

**Why Wounds Itch:**
• New nerve endings regenerating
• New skin cells forming
• Histamine release during healing
• Scab formation

**⏰ When Itching Occurs:**
• Usually starts day 3-7
• Peaks around weeks 2-3
• Gradually decreases

**😌 How to Manage Itching:**

**Do:**
• Apply cold pack near (not on) wound
• Use approved moisturizer after closure
• Take antihistamine if OK'd by doctor
• Keep wound covered
• Distraction techniques
• Pat gently instead of scratching

**Don't:**
• Scratch the wound or scab
• Remove scab prematurely
• Apply creams on open wound
• Use hot water on area

**⚠️ Concerning Itching:**
• Itching with spreading rash
• Hives or welts (allergic reaction)
• Itching with increasing redness
• Blisters around wound
• Itching with fever

**Could indicate allergic reaction to:**
• Dressing adhesive
• Antibiotic ointment
• Medications

**Report unusual itching patterns to your doctor.**`,
    confidence: 86,
    urgency: 'low',
    relatedTopics: ['Healing stages', 'Allergic reactions', 'Scar care'],
    category: 'itching'
  },

  // WOUND OPENING
  {
    keywords: ['open', 'opening', 'opened', 'dehiscence', 'split', 'came apart', 'separated', 'gap', 'wound opened'],
    response: `⚠️ **Wound Opening (Dehiscence):**

**If Your Wound Has Opened:**

**🩹 Immediate Steps:**
1. Stay calm
2. Apply gentle pressure with clean cloth
3. Don't try to push tissue back in
4. Cover with clean, moist gauze
5. Contact your surgeon immediately

**Degrees of Opening:**
• **Superficial:** Skin edges separated, deeper layers intact
• **Partial:** Some deeper layers involved
• **Complete:** Full separation (emergency)

**🚨 Go to ER If:**
• Organs or deep tissue visible
• Heavy bleeding
• Large gap in wound
• Fever with wound opening
• Tissue looks gray or dead

**Common Causes:**
• Excessive strain or lifting
• Infection weakening tissue
• Poor nutrition
• Diabetes or poor circulation
• Sutures removed too early
• Coughing/sneezing forcefully

**Prevention Tips:**
• Support incision when coughing
• Follow lifting restrictions
• Maintain good nutrition
• Keep follow-up appointments
• Don't remove sutures yourself

**Most small separations can be managed without surgery if caught early.**`,
    confidence: 94,
    urgency: 'high',
    relatedTopics: ['Emergency signs', 'Suture care', 'Activity restrictions'],
    category: 'dehiscence'
  },

  // HEALING TIMELINE
  {
    keywords: ['timeline', 'how long', 'time to heal', 'fully healed', 'when healed', 'healing time', 'recovery time', 'weeks', 'months'],
    response: `⏰ **Wound Healing Timeline:**

**📅 General Healing Phases:**

**Phase 1: Hemostasis (0-24 hours)**
• Blood clotting
• Bleeding stops
• Scab begins forming

**Phase 2: Inflammatory (Days 1-5)**
• Redness and swelling
• White blood cells fighting bacteria
• May have mild drainage

**Phase 3: Proliferative (Days 5-21)**
• New tissue forming
• Wound contracts/closes
• New blood vessels growing
• Itching common

**Phase 4: Maturation (3 weeks - 2 years)**
• Scar forms and matures
• Tissue strengthens
• Color fades over time

**📍 Healing Time by Wound Type:**
• Simple incision: 2-3 weeks
• Abdominal surgery: 4-6 weeks
• Joint surgery: 6-8 weeks
• Skin graft: 2-4 weeks to attach
• Deep wounds: 6-8+ weeks

**Factors That Affect Healing:**
• ✅ Good nutrition (speeds healing)
• ✅ Young age
• ✅ Good blood supply
• ❌ Diabetes (slows healing)
• ❌ Smoking
• ❌ Poor nutrition
• ❌ Infection
• ❌ Certain medications

**Internal healing takes longer than visible skin closure.**`,
    confidence: 88,
    urgency: 'low',
    relatedTopics: ['Healing stages', 'Factors affecting healing', 'Scar formation'],
    category: 'timeline'
  },

  // DRIVING
  {
    keywords: ['drive', 'driving', 'car', 'when can i drive', 'operate vehicle', 'travel'],
    response: `🚗 **Driving After Surgery:**

**❌ Do NOT Drive If:**
• Taking prescription pain medications
• Taking muscle relaxants
• Still have anesthesia effects
• Cannot perform emergency stop
• Limited range of motion
• Cannot wear seatbelt comfortably

**⏰ General Guidelines by Surgery:**
• Minor procedures: 24-48 hours (off pain meds)
• Abdominal surgery: 2-4 weeks
• Laparoscopic surgery: 1-2 weeks
• Orthopedic (leg): 4-6+ weeks
• Arm/shoulder: When can grip wheel safely

**✅ You're Ready When:**
• Off all sedating medications
• Full range of motion for driving
• Can brake suddenly without pain
• Can turn to check blind spots
• Alert and not drowsy

**📋 Before Driving Again:**
1. Practice in empty parking lot
2. Start with short trips
3. Have someone with you first time
4. Ensure you can wear seatbelt

**⚠️ Legal Consideration:**
Driving while impaired by medication is illegal and dangerous.

**Check with your surgeon for specific clearance.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Activity restrictions', 'Pain medications', 'Recovery timeline'],
    category: 'driving'
  },

  // SLEEPING
  {
    keywords: ['sleep', 'sleeping', 'bed', 'rest', 'position', 'how to sleep', 'sleeping position', 'night'],
    response: `😴 **Sleep & Rest Guidelines:**

**🛏️ Best Sleeping Positions:**

**Abdominal Surgery:**
• Sleep on back with pillow under knees
• Reclined position (recliner works well)
• Pillow under incision for support

**Chest/Heart Surgery:**
• Sleep on back, slightly elevated
• Avoid lying on sides initially
• Use wedge pillow if helpful

**Limb Surgery:**
• Elevate affected limb on pillows
• Above heart level if possible
• Reduces swelling overnight

**📋 General Tips:**
• Elevate wound site when possible
• Use extra pillows for support
• Get up slowly to avoid dizziness
• Take pain medication before bed
• Keep dressing supplies nearby

**💡 Getting Comfortable:**
• Recliner may be easier than bed
• Body pillow for positioning
• Cool room temperature
• Limit fluids before bed (fewer bathroom trips)

**⚠️ When to Adjust:**
• Pain waking you repeatedly
• Numbness or tingling
• Swelling increasing
• Drainage on sheets

**Rest is essential for healing - aim for 8+ hours.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Pain management', 'Swelling', 'Recovery tips'],
    category: 'sleep'
  },

  // MEDICATIONS
  {
    keywords: ['medication', 'medicine', 'drug', 'prescription', 'antibiotic', 'pain pill', 'take medicine', 'stop medication'],
    response: `💊 **Medication Guidelines:**

**🩹 Common Post-Surgery Medications:**

**Pain Medications:**
• Take as directed, especially first 48 hours
• Don't skip doses - stay ahead of pain
• Wean off gradually as pain improves
• Never take more than prescribed

**Antibiotics (If Prescribed):**
• Complete the FULL course
• Don't stop early even if feeling better
• Take at regular intervals
• Take with food if stomach upset

**Blood Thinners (If Prescribed):**
• Take at same time daily
• Watch for unusual bleeding
• Don't stop without doctor approval

**⚠️ Important Warnings:**

**Do NOT Take Without Asking:**
• Aspirin (increases bleeding)
• Ibuprofen/NSAIDs (may affect healing)
• Herbal supplements
• Other people's medications

**Side Effects to Report:**
• Severe nausea/vomiting
• Allergic reaction (rash, swelling)
• Severe constipation
• Confusion or dizziness
• Difficulty breathing

**🗓️ Medication Tips:**
• Set alarms for doses
• Use pill organizer
• Keep medication log
• Don't drive on pain meds
• Store safely away from children

**Ask your pharmacist if you have questions about drug interactions.**`,
    confidence: 88,
    urgency: 'medium',
    relatedTopics: ['Pain management', 'Antibiotics', 'Side effects'],
    category: 'medications'
  },

  // CONSTIPATION
  {
    keywords: ['constipation', 'constipated', 'bowel', 'stool', 'poop', 'bathroom', 'laxative', 'fiber', 'difficulty passing'],
    response: `🚽 **Constipation After Surgery:**

**Why It Happens:**
• Pain medications (opioids)
• Anesthesia effects
• Reduced activity
• Changes in diet
• Dehydration

**✅ Prevention & Treatment:**

**Dietary Changes:**
• Increase fiber (fruits, vegetables, whole grains)
• Prune juice or dried prunes
• Drink 8-10 glasses water daily
• Warm liquids (tea, broth)

**Activity:**
• Walk as soon as allowed
• Gentle movement helps bowels
• Don't strain at incision

**Medications (Ask First):**
• Stool softeners (docusate)
• Gentle laxatives (Miralax)
• Fiber supplements

**📋 Tips:**
• Start stool softener with pain meds
• Don't wait until severe
• Respond to urges promptly
• Prop feet on stool when sitting

**⚠️ Seek Care If:**
• No bowel movement for 4+ days
• Severe abdominal pain
• Vomiting
• Bloody stool
• Abdominal swelling

**⚠️ For abdominal surgery, straining can affect your incision. Prevent constipation proactively.**`,
    confidence: 86,
    urgency: 'low',
    relatedTopics: ['Pain medications', 'Diet', 'Activity'],
    category: 'constipation'
  },

  // SHOWERING WITH STITCHES
  {
    keywords: ['shower with stitches', 'wash with sutures', 'get stitches wet', 'waterproof stitches'],
    response: `🚿 **Showering With Stitches:**

**⏰ Timeline:**
• First 24-48 hours: Keep completely dry
• Days 3-7: Brief showers usually OK
• After suture removal: Normal washing

**✅ How to Shower Safely:**

**Preparation:**
• Have clean towel ready
• New dressing prepared
• Gather supplies before starting

**During Shower:**
• Keep showers brief (5-10 minutes)
• Lukewarm water (not hot)
• Let water run over gently
• Don't aim spray directly at wound
• No scrubbing or rubbing

**After Shower:**
• Pat dry gently (don't rub)
• Air dry for a moment
• Apply fresh dressing immediately
• Check sutures are intact

**🩹 Waterproof Options:**
• Waterproof dressings (Tegaderm)
• Plastic wrap with tape edges
• Waterproof cast covers (for limbs)

**❌ Avoid:**
• Baths, pools, hot tubs
• Long hot showers
• Soaking the wound
• Harsh soaps on wound

**If sutures get wet and don't dry, they can loosen or harbor bacteria.**`,
    confidence: 88,
    urgency: 'low',
    relatedTopics: ['Bathing', 'Dressing changes', 'Suture care'],
    category: 'showering'
  },

  // DISCHARGE/DRAINAGE
  {
    keywords: ['discharge', 'drainage', 'draining', 'fluid', 'oozing', 'pus', 'leaking', 'seeping', 'weeping'],
    response: `💧 **Understanding Wound Drainage:**

**Types of Drainage:**

✅ **Serous (Normal):**
• Clear, watery fluid
• Light yellow/straw colored
• Thin consistency
• Normal in early healing

✅ **Sanguineous (Usually Normal):**
• Bloody drainage
• Expected first 24-48 hours
• Should decrease quickly

✅ **Serosanguineous (Normal):**
• Pink, blood-tinged
• Thin, watery with blood
• Common days 2-5

⚠️ **Purulent (Concerning):**
• Thick, cloudy
• Yellow, green, or brown
• May have foul odor
• Sign of infection

**📏 Amount Guidelines:**
• Light: Dampens dressing
• Moderate: Soaks part of dressing
• Heavy: Saturates dressing

**⚠️ Seek Care If:**
• Green or brown drainage
• Foul or unusual odor
• Increasing amount after day 3
• Thick, creamy consistency
• Drainage with fever

**🩹 Managing Drainage:**
• Change dressing when wet
• Use absorbent dressings
• Track amount and color
• Take photos to show doctor

**Any significant change in drainage should be reported.**`,
    confidence: 90,
    urgency: 'medium',
    relatedTopics: ['Infection signs', 'Dressing changes', 'When to call doctor'],
    category: 'drainage'
  },

  // NUMBNESS/TINGLING
  {
    keywords: ['numb', 'numbness', 'tingling', 'pins and needles', 'sensation', 'feeling', 'nerve', 'loss of feeling'],
    response: `🖐️ **Numbness & Tingling:**

**✅ Often Normal:**
• Area immediately around incision
• May extend 1-2 inches from wound
• Caused by nerves cut during surgery
• Can last weeks to months

**Nerve Healing Timeline:**
• Weeks 1-4: Numbness common
• Months 1-3: Sensation may return
• Months 3-12: Gradual improvement
• Year+: Final sensation level

**Types of Sensations:**
• Numbness (no feeling)
• Tingling (pins and needles)
• Hypersensitivity (too much feeling)
• Shooting pains (nerve regeneration)

**⚠️ Concerning Signs:**
• Spreading numbness
• Entire limb affected
• Numbness with color change
• Numbness with swelling
• Weakness or inability to move

**🚨 Seek Immediate Care If:**
• Entire hand/foot numb
• Limb turning pale/blue
• Cannot move fingers/toes
• Severe pain with numbness

**💆 Helpful Tips:**
• Gentle massage around (not on) wound
• Protect numb areas from injury
• May not feel heat - be careful
• Report changes to doctor

**Some permanent numbness near incisions is common and not harmful.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Nerve healing', 'Healing timeline', 'Circulation'],
    category: 'numbness'
  },

  // WOUND CARE SUPPLIES
  {
    keywords: ['supplies', 'what do i need', 'shopping list', 'buy', 'purchase', 'gauze', 'tape', 'bandages'],
    response: `🛒 **Wound Care Supplies List:**

**🩹 Essential Supplies:**

**Dressings:**
• Sterile gauze pads (various sizes)
• Non-stick pads (Telfa)
• Adhesive bandages
• Rolled gauze (for wrapping)
• Transparent film (Tegaderm)

**Tape:**
• Paper tape (gentle on skin)
• Cloth tape (stronger hold)
• Waterproof tape

**Cleaning:**
• Sterile saline solution
• Clean washcloths
• Cotton-tipped applicators

**Protection:**
• Disposable gloves
• Waterproof wound covers
• Plastic wrap (for showering)

**Additional Items:**
• Antibiotic ointment (if prescribed)
• Scissors (clean, for cutting tape)
• Trash bag for disposal
• Mirror (to see wound)
• Good lighting

**📱 Helpful Additions:**
• Pill organizer
• Temperature thermometer
• Wound measurement ruler
• Camera/phone for photos

**🏪 Where to Buy:**
• Pharmacy/drugstore
• Medical supply store
• Online retailers
• Hospital may provide initial supplies

**Ask your healthcare team what specific products they recommend.**`,
    confidence: 82,
    urgency: 'low',
    relatedTopics: ['Dressing changes', 'Wound cleaning', 'Home care'],
    category: 'supplies'
  },

  // WHEN TO CALL DOCTOR
  {
    keywords: ['call doctor', 'when to call', 'contact doctor', 'call surgeon', 'see doctor', 'medical attention', 'appointment'],
    response: `📞 **When to Contact Your Doctor:**

**📱 Call During Office Hours If:**
• Temperature 100.4°F (38°C) or higher
• Increased redness around wound
• New or worsening drainage
• Pain not controlled by medication
• Sutures coming loose
• Questions about medications
• Concerns about healing progress

**⚠️ Call Same Day / Urgent If:**
• Fever with wound changes
• Pus or foul-smelling drainage
• Redness spreading significantly
• Severe increase in pain
• Wound edges separating
• New swelling after day 3

**🚨 Go to ER / Call 911 If:**
• Heavy, uncontrolled bleeding
• Fever >102°F (39°C) with chills
• Red streaks from wound
• Difficulty breathing
• Severe allergic reaction
• Wound completely opened
• Exposed organs or tissue
• Signs of blood clot (leg swelling, chest pain)

**📋 Prepare for the Call:**
• Temperature reading
• Description of wound changes
• Current medications
• Photos of wound if possible
• Timeline of symptoms

**Don't hesitate to call - medical staff expect and welcome questions.**`,
    confidence: 92,
    urgency: 'medium',
    relatedTopics: ['Emergency signs', 'Infection signs', 'Follow-up care'],
    category: 'doctor'
  },

  // DIABETES & WOUND HEALING
  {
    keywords: ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'diabetic wound', 'sugar levels'],
    response: `🩸 **Diabetes & Wound Healing:**

**Why Diabetes Affects Healing:**
• Reduced blood flow to wound
• Impaired immune function
• Nerve damage (neuropathy)
• Higher infection risk
• Slower cell regeneration

**✅ Key Management Tips:**

**Blood Sugar Control:**
• Keep glucose well-controlled
• Target: As advised by your doctor
• Check more frequently after surgery
• High sugar = slower healing

**Extra Vigilance Needed:**
• Check wound twice daily
• Watch carefully for infection
• Don't ignore minor changes
• Keep all follow-up appointments

**⚠️ Higher Risk Signs:**
• Any infection sign is urgent
• Wounds may not heal normally
• Numbness may mask problems
• Redness may be harder to detect

**Prevention Tips:**
• Excellent glucose control
• Proper nutrition (protein!)
• Don't smoke
• Protect feet carefully
• Wear proper footwear

**📞 Lower Threshold to Call Doctor:**
• Any temperature elevation
• Any drainage changes
• Delayed healing
• Increased pain or redness

**Diabetics need closer monitoring - don't wait to report concerns.**`,
    confidence: 88,
    urgency: 'medium',
    relatedTopics: ['Infection signs', 'Healing timeline', 'Nutrition'],
    category: 'diabetes'
  },

  // SMOKING & HEALING
  {
    keywords: ['smoke', 'smoking', 'cigarette', 'nicotine', 'vape', 'tobacco', 'quit smoking'],
    response: `🚭 **Smoking & Wound Healing:**

**How Smoking Affects Healing:**
• Nicotine constricts blood vessels
• Reduces oxygen to wound
• Impairs immune function
• Increases infection risk
• Delays tissue formation
• Higher scarring risk

**📊 The Numbers:**
• 3x higher infection risk
• 2x longer healing time
• Higher wound complication rate
• More visible scarring

**✅ Recommendations:**

**Before Surgery:**
• Stop 4-6 weeks before if possible
• Even 24-48 hours helps
• Includes vaping and patches

**After Surgery:**
• Don't smoke for minimum 4 weeks
• Longer is better
• Avoid secondhand smoke too

**⚠️ If You Can't Quit:**
• Reduce as much as possible
• Don't smoke near wound
• Increase protein intake
• Stay extra hydrated
• Watch wound extra carefully

**Benefits of Quitting:**
• Within 12 hours: Oxygen levels improve
• 2-12 weeks: Circulation improves
• Better healing outcomes
• Reduced complication risk

**Ask your doctor about nicotine replacement options safe for healing.**`,
    confidence: 90,
    urgency: 'medium',
    relatedTopics: ['Healing timeline', 'Complications', 'Lifestyle factors'],
    category: 'smoking'
  },

  // SECOND OPINION
  {
    keywords: ['second opinion', 'not healing', 'worried', 'concerned', 'something wrong', 'doesn\'t look right'],
    response: `🤔 **Seeking a Second Opinion:**

**When to Consider:**
• Wound not improving as expected
• Different advice from different providers
• Concerns not being addressed
• Treatment not working
• Complex or unusual wound
• Unsure about recommended treatment

**✅ It's Okay to:**
• Ask questions
• Request clarification
• Seek another opinion
• Advocate for yourself
• Bring someone to appointments

**📋 How to Get a Second Opinion:**
1. Request copies of your records
2. Get photos of wound progression
3. Write down your concerns
4. Find a wound care specialist
5. Be honest about seeking second opinion

**🩺 When to See a Specialist:**
• Wound not healing after 4 weeks
• Recurring infections
• Unusual appearance
• Chronic wound issues
• Complex medical history

**Types of Specialists:**
• Wound care nurse
• Wound care clinic
• Plastic surgeon
• Infectious disease doctor
• Dermatologist

**Trust your instincts - you know your body. If something doesn't seem right, it's worth investigating.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['When to call doctor', 'Healing timeline', 'Follow-up care'],
    category: 'secondopinion'
  },

  // WOUND ODOR
  {
    keywords: ['smell', 'odor', 'smelly', 'stinky', 'foul smell', 'bad smell', 'wound smells'],
    response: `👃 **Wound Odor Guide:**

**Normal Wound Smells:**
• Slight metallic (from blood)
• Mild antiseptic (from products used)
• No smell at all

**⚠️ Concerning Odors:**

**🟡 Mild Unusual Smell:**
• May indicate bacterial presence
• Monitor closely
• Clean wound thoroughly
• Contact doctor if persists

**🔴 Foul/Strong Odor:**
• Sign of infection
• Often with discharge changes
• Seek medical care soon

**🚨 Sweet/Fruity Smell:**
• May indicate serious infection
• Especially concerning with diabetes
• Seek care promptly

**Common Causes of Bad Odor:**
• Bacterial infection
• Dying tissue (necrosis)
• Trapped moisture/bacteria
• Poor wound hygiene
• Certain bacteria types

**✅ Management:**
• Clean wound as directed
• Change dressings regularly
• Keep wound dry between cleanings
• Use charcoal dressings if recommended
• Report to healthcare provider

**⚠️ Seek Care If:**
• New foul odor develops
• Odor with discharge changes
• Odor with fever
• Odor with increased pain/redness

**Any significant new odor should be evaluated.**`,
    confidence: 88,
    urgency: 'medium',
    relatedTopics: ['Infection signs', 'Drainage', 'When to call doctor'],
    category: 'odor'
  },

  // BRUISING
  {
    keywords: ['bruise', 'bruising', 'black and blue', 'purple', 'discoloration', 'hematoma'],
    response: `💜 **Bruising After Surgery:**

**✅ Normal Bruising:**
• Common around surgical site
• Can appear 1-3 days after surgery
• May spread to nearby areas
• Changes colors as it heals

**🎨 Bruise Color Timeline:**
• Days 1-2: Red to purple
• Days 3-6: Dark purple to blue
• Days 7-10: Green
• Days 10-14: Yellow/brown
• Days 14+: Fading, light yellow

**Where Bruising Travels:**
• Gravity causes bruising to move down
• Abdominal surgery: May bruise to hips
• Arm surgery: May bruise to hand
• This is normal!

**⚠️ Concerning Signs:**
• Rapidly expanding bruise
• Tense, hard swelling (hematoma)
• Severe pain in bruised area
• Bruising with numbness
• Bleeding that won't stop

**✅ Managing Bruising:**
• Ice first 48 hours
• Gentle elevation
• Arnica cream (after wound closed)
• Time - it will resolve

**🚨 Seek Care If:**
• Large, expanding hematoma
• Severe pain at bruise site
• Signs of compartment syndrome
• Bleeding through skin

**Most bruising resolves on its own within 2-3 weeks.**`,
    confidence: 85,
    urgency: 'low',
    relatedTopics: ['Swelling', 'Bleeding', 'Healing timeline'],
    category: 'bruising'
  }
];

// Frequent questions for quick access
const frequentQuestions = [
  // Basic Care
  "Is my wound healing normally?",
  "How do I clean my wound?",
  "How often should I change my dressing?",
  "Can I shower with my wound?",
  "When can I take a bath?",
  
  // Symptoms
  "Is this redness normal?",
  "Why is my wound itching?",
  "Is bleeding normal?",
  "Why is there discharge?",
  "Is swelling normal?",
  
  // Infection
  "Signs of infection?",
  "Does my wound look infected?",
  "When should I worry about infection?",
  "Do I need antibiotics?",
  
  // Stitches & Closure
  "When will my stitches be removed?",
  "Can I get my stitches wet?",
  "My stitches are pulling - is that OK?",
  "What if a stitch comes out?",
  
  // Pain & Discomfort
  "How to manage wound pain?",
  "Can I take ibuprofen?",
  "Pain is getting worse - what do I do?",
  "Why does it hurt more at night?",
  
  // Activity & Lifestyle
  "When can I exercise?",
  "When can I return to work?",
  "When can I drive?",
  "Can I lift heavy objects?",
  "How should I sleep?",
  
  // Healing Timeline
  "How long until fully healed?",
  "Is my healing delayed?",
  "What are the healing stages?",
  "When will the scar fade?",
  
  // Nutrition & Care
  "What foods help healing?",
  "Should I take vitamins?",
  "Does smoking affect healing?",
  "Does diabetes affect healing?",
  
  // Emergency & Doctor
  "When should I call my doctor?",
  "Should I go to the ER?",
  "What's an emergency sign?",
  "Do I need a second opinion?",
  
  // Specific Concerns
  "My wound is opening up",
  "There's a bad smell",
  "I see pus coming out",
  "Red streaks near wound",
  "I have a fever",
  
  // Scar Care
  "How to minimize scarring?",
  "When to start scar treatment?",
  "Is keloid forming?",
  "Can I put cream on my scar?",
  
  // Common Questions
  "What supplies do I need?",
  "Is this bruising normal?",
  "Why is it numb around the wound?",
  "Can I wear tight clothes?",
  "When can I swim?"
];

export const AIAssistantService = {
  getResponse(question: string): AIResponse {
    const lowerQuestion = question.toLowerCase();
    
    // Search knowledge base for matching response
    let bestMatch: KnowledgeBase | null = null;
    let bestScore = 0;
    
    for (const item of knowledgeBase) {
      let score = 0;
      for (const keyword of item.keywords) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          score += keyword.length; // Longer matches = better
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
    
    if (bestMatch && bestScore > 3) {
      return {
        message: bestMatch.response,
        confidence: bestMatch.confidence,
        urgency: bestMatch.urgency,
        relatedTopics: bestMatch.relatedTopics,
        disclaimer: 'This information is for educational purposes only. Always consult your healthcare provider for medical advice.'
      };
    }
    
    // Default response
    return {
      message: `I understand you're asking about "${question}".

While I don't have a specific answer for this question, here are some general guidelines:

**For wound care questions:**
• Keep the wound clean and dry
• Follow your doctor's instructions
• Watch for signs of infection
• Take medications as prescribed

**I can help you with:**
• Normal healing signs
• Infection warning signs
• Bathing and activity guidelines
• Pain management
• Dressing changes
• When to contact your doctor

**Try asking about:**
• "Is my wound healing normally?"
• "Signs of infection"
• "How to clean my wound"
• "When can I shower?"

For specific medical concerns, please contact your healthcare provider.`,
      confidence: 65,
      urgency: 'low',
      relatedTopics: ['General wound care', 'Healing stages', 'When to call doctor'],
      disclaimer: 'This is general information only. For specific medical advice, please consult your healthcare provider.'
    };
  },

  getSuggestedQuestions(): string[] {
    // Return shuffled selection of frequent questions
    const shuffled = [...frequentQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  },

  getAllFrequentQuestions(): string[] {
    return frequentQuestions;
  },

  getQuestionsByCategory(): { [key: string]: string[] } {
    return {
      'Basic Care': [
        "How do I clean my wound?",
        "How often should I change my dressing?",
        "What supplies do I need?",
        "Can I shower with my wound?",
        "When can I take a bath?",
        "When can I swim?"
      ],
      'Symptoms & Signs': [
        "Is my wound healing normally?",
        "Is this redness normal?",
        "Why is my wound itching?",
        "Is bleeding normal?",
        "Why is there discharge?",
        "Is swelling normal?",
        "Why is it numb around the wound?",
        "Is this bruising normal?"
      ],
      'Infection Concerns': [
        "Signs of infection?",
        "Does my wound look infected?",
        "Do I need antibiotics?",
        "There's a bad smell",
        "I see pus coming out",
        "Red streaks near wound",
        "I have a fever"
      ],
      'Stitches & Sutures': [
        "When will my stitches be removed?",
        "Can I get my stitches wet?",
        "My stitches are pulling - is that OK?",
        "What if a stitch comes out?",
        "My wound is opening up"
      ],
      'Pain Management': [
        "How to manage wound pain?",
        "Can I take ibuprofen?",
        "Pain is getting worse - what do I do?",
        "Why does it hurt more at night?"
      ],
      'Activity & Lifestyle': [
        "When can I exercise?",
        "When can I return to work?",
        "When can I drive?",
        "Can I lift heavy objects?",
        "How should I sleep?",
        "Can I wear tight clothes?"
      ],
      'Healing & Timeline': [
        "How long until fully healed?",
        "Is my healing delayed?",
        "What are the healing stages?",
        "When will the scar fade?"
      ],
      'Nutrition & Factors': [
        "What foods help healing?",
        "Should I take vitamins?",
        "Does smoking affect healing?",
        "Does diabetes affect healing?"
      ],
      'Scar Care': [
        "How to minimize scarring?",
        "When to start scar treatment?",
        "Is keloid forming?",
        "Can I put cream on my scar?"
      ],
      'Emergency & Medical': [
        "When should I call my doctor?",
        "Should I go to the ER?",
        "What's an emergency sign?",
        "Do I need a second opinion?"
      ]
    };
  }
};
