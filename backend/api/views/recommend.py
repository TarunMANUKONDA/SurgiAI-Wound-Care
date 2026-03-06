import json
import time
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from api.models import Classification, Recommendation

genai.configure(api_key=settings.GEMINI_API_KEY)


@api_view(['POST'])
def get_recommendations(request):
    """Get AI-powered care recommendations using Gemini."""
    classification_id = request.data.get('classification_id')
    wound_type = request.data.get('wound_type', '')
    confidence = float(request.data.get('confidence', 0))
    pain_level = request.data.get('pain_level', 'none')
    fever = bool(request.data.get('fever', False))
    discharge_type = request.data.get('discharge_type', 'none')
    redness_spread = bool(request.data.get('redness_spread', False))
    discharge_detected = discharge_type not in ['none', '']

    clf = Classification.objects.select_related('wound').filter(id=classification_id).first()
    if not clf:
        return Response({"success": False, "error": "Classification not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        tissue = clf.wound.tissue_composition or {}
        if not isinstance(tissue, dict):
            tissue = {"pink": 0, "red": 0, "yellow": 0, "black": 0, "white": 0}

        pink  = float(tissue.get('pink', 0))
        red   = float(tissue.get('red', 0))
        yellow = float(tissue.get('yellow', 0))
        black = float(tissue.get('black', 0))
        white = float(tissue.get('white', 0))
        total = pink + red + yellow + black + white
        if total > 0 and total != 100:
            f = 100 / total
            pink, red, yellow, black, white = round(pink*f,1), round(red*f,1), round(yellow*f,1), round(black*f,1), round(white*f,1)
        tissue = {"pink": pink, "red": red, "yellow": yellow, "black": black, "white": white}

        # ── Professor-Style Severity Score (0–300 scale) ───────────────────────
        # Component A: Tissue Composition  (max 120 pts)
        #   Necrosis (black)  × 3.0  — highest weight: tissue death
        #   Slough   (yellow) × 1.5  — fibrin/slough indicates stall
        #   White    (fibrin) × 1.0  — mild concern
        #   Red      (granulation) × -0.5  — healthy tissue, moderate credit
        #   Pink     (epithelial)  × -1.0  — best healing sign
        tissue_score = (
            black  * 3.0 +
            yellow * 1.5 +
            white  * 1.0 +
            red    * (-0.5) +
            pink   * (-1.0)
        )
        # tissue_score raw range ≈ -100 to +500; scale to 0–120
        tissue_component = max(0, min(120, 60 + tissue_score * 0.4))

        # Component B: Infection / Discharge (max 80 pts)
        discharge_pts = {"none": 0, "clear": 10, "bloody": 25, "yellow": 55, "green": 75}.get(discharge_type, 0)
        redness_spread_pts = 30 if redness_spread else 0
        infection_component = min(80, discharge_pts + redness_spread_pts)

        # Component C: Symptom Burden (max 60 pts)
        pain_pts = {"none": 0, "mild": 10, "moderate": 25, "severe": 50}.get(pain_level, 0)
        fever_pts = 40 if fever else 0
        symptom_component = min(60, pain_pts + fever_pts)

        # Component D: Wound Type Alignment (max 40 pts)
        #   Penalise if AI classification indicates concern
        type_lower = wound_type.lower()
        if "high urgency" in type_lower or "active infection" in type_lower:
            type_pts = 40
        elif "delayed" in type_lower or "infection risk" in type_lower:
            type_pts = 20
        else:
            type_pts = 0

        severity_score = tissue_component + infection_component + symptom_component + type_pts
        severity_score = round(max(0.0, min(300.0, severity_score)), 1)

        # ── Severity Level from score ────────────────────────────────────────
        if severity_score >= 200:    severity_level = "Critical"
        elif severity_score >= 130:  severity_level = "High"
        elif severity_score >= 65:   severity_level = "Moderate"
        else:                        severity_level = "Low"

        risk_override = False
        symptoms_context = ""

        if black >= 10: severity_level = "Critical"; risk_override = True
        elif (yellow + white) >= 20: severity_level = "High"; risk_override = True
        elif discharge_detected and discharge_type in ['yellow', 'green']: severity_level = "High"; risk_override = True
        elif (yellow + white) >= 5 and severity_level == "Low":
            severity_level = "Moderate"; severity_score = max(severity_score, 60); risk_override = True

        if fever: severity_level = "Critical"; risk_override = True; symptoms_context += "- FEVER REPORTED: Systemic infection risk.\n"
        if redness_spread: severity_level = "High"; risk_override = True; symptoms_context += "- SPREADING REDNESS: Possible Cellulitis.\n"
        if pain_level == 'severe':
            symptoms_context += "- SEVERE PAIN: Unusual for normal healing.\n"
            if severity_level == "Low": severity_level = "Moderate"; risk_override = True
        if discharge_type in ['yellow', 'green', 'bloody']:
            symptoms_context += f"- DISCHARGE: {discharge_type.upper()} fluid detected.\n"
        if 5 <= (yellow + white) < 20:
            symptoms_context += "- MINOR SLOUGH DETECTED: Precaution required.\n"

        clinical_hint = "FOCUS: General wound hygiene and protection."
        if "CRITICAL" in severity_level or black >= 10:
            clinical_hint = "FOCUS: URGENT MEDICAL REVIEW. Potential Necrosis/Gangrene/Sepsis."
        elif "Infection" in wound_type or (discharge_detected and discharge_type in ['yellow','green','bloody']) or fever:
            clinical_hint = "FOCUS: INFECTION CONTROL. Systemic signs (Fever) require antibiotics."
        elif (yellow + white) >= 20:
            clinical_hint = "FOCUS: DESLOUGHING. Use Hydrogels or Alginates to soften slough."
        elif red > 50 or "dehiscence" in wound_type.lower() or "open" in wound_type.lower():
            clinical_hint = "FOCUS: OPEN WOUND CARE. Use non-adherent dressings."
        elif pink > 50:
            clinical_hint = "FOCUS: EPITHELIALIZATION. Protect delicate new skin."

        assessment_context = f"""
RISK ASSESSMENT DATA:
- Classified Type: {wound_type} (Confidence: {confidence}%)
- Tissue Composition: {json.dumps(tissue)}
- Calculated Severity Score: {severity_score:.1f} (Scale: 0-300)
- Risk Level: {severity_level}
- Safety Override Applied: {"YES" if risk_override else "NO"}

PATIENT REPORTED SYMPTOMS & OBSERVATIONS:
{symptoms_context if symptoms_context else "- None reported"}

CLINICAL STRATEGY TO APPLY:
{clinical_hint}
"""
        # Build severity-specific instruction to prevent generic "monitor closely" advice
        if severity_level == "Low":
            severity_instruction = """This wound is healing WELL. Your summary must:
- START with a POSITIVE, specific statement about the healing progress (e.g. 'Your wound shows excellent granulation...')
- Give a simple maintenance routine (NOT just 'monitor closely')
- Mention specific expected healing timeline based on tissue composition
- Warn ONLY about specific signs that would indicate a change (not generic warnings)"""
        elif severity_level == "Moderate":
            severity_instruction = """This wound needs SPECIFIC ATTENTION. Your summary must:
- START with a clear, specific statement about what tissue finding requires attention
- Give a concrete action timeline (e.g. 'reassess in 48-72 hours if...')
- Identify the exact tissue concern (slough %, redness level, etc.)
- Provide a specific dressing change schedule"""
        elif severity_level == "High":
            severity_instruction = """This wound has SIGNIFICANT CONCERNS. Your summary must:
- START with a direct, urgent statement naming the specific concern
- Give numbered action steps in order of priority
- Specify exact when-to-seek-help thresholds (e.g. temperature >38.5°C, spreading >2cm)
- Recommend specific medical-grade dressings by product type"""
        else:  # Critical
            severity_instruction = """URGENT: This wound requires IMMEDIATE MEDICAL ATTENTION. Your summary must:
- START with 'URGENT:' and name the specific emergency finding
- First recommendation must be 'Seek immediate medical care'
- List specific danger signs that are already present
- Do NOT suggest home care as an alternative to medical treatment"""

        # Build tissue-specific opening context
        tissue_context = []
        if black >= 5:
            tissue_context.append(f"{black:.0f}% necrotic (black) tissue")
        if (yellow + white) >= 10:
            tissue_context.append(f"{yellow+white:.0f}% slough/fibrin (yellow/white) tissue")
        if red >= 30:
            tissue_context.append(f"{red:.0f}% healthy granulation (red) tissue")
        if pink >= 20:
            tissue_context.append(f"{pink:.0f}% epithelial (pink) new skin")
        tissue_summary_str = ", ".join(tissue_context) if tissue_context else "mixed tissue"

        prompt = f"""You are a specialized surgical wound care AI.

TISSUE ANALYSIS RESULTS:
- Wound Classification: {wound_type} (Confidence: {confidence}%)
- Risk Level: {severity_level} (Score: {severity_score:.0f}/300)
- Tissue Inside Wound: {tissue_summary_str}
- Full tissue breakdown: Red(granulation)={red:.0f}%, Pink(epithelial)={pink:.0f}%, Yellow(slough)={yellow:.0f}%, White(fibrin)={white:.0f}%, Black(necrotic)={black:.0f}%
- Redness/Inflammation score: {clf.wound.redness_level if clf.wound.redness_level else 'unknown'}/100
- Discharge: {discharge_type}

PATIENT SYMPTOMS:
{symptoms_context if symptoms_context else '- No additional symptoms reported'}

CLINICAL FOCUS: {clinical_hint}

INSTRUCTIONS FOR YOUR RESPONSE:
{severity_instruction}

ADDITIONAL RULES:
- NEVER say just 'monitor closely' without specifying WHAT to monitor and WHAT threshold triggers action
- For dressings: name specific types (Hydrogel/Alginate/Silver foam/Honey/Silicone foam), NOT just 'bandage'
- For cleaning: specify solution (normal saline/chlorhexidine 0.05%/etc), technique, and frequency
- expectedHealingTime: give a specific range (e.g. '2-3 weeks' not 'varies')

Respond with ONLY this JSON structure:
{{
  "summary": "specific, tissue-based opening statement",
  "cleaningInstructions": ["step 1", "step 2", ...],
  "dressingRecommendations": ["specific dressing name: reason", ...],
  "warningsSigns": ["specific sign: what it means", ...],
  "whenToSeekHelp": ["specific threshold: action required", ...],
  "dietAdvice": ["protein: specific recommendation", ...],
  "activityRestrictions": ["restriction: reason", ...],
  "expectedHealingTime": "specific time range based on tissue status",
  "followUpSchedule": ["when: what to check", ...],
  "confidence": 0-100
}}"""

        RECOMMEND_MODELS = [
            'gemini-3-flash-preview',
            'gemini-3-pro-preview',
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
        ]

        response = None
        for m_name in RECOMMEND_MODELS:
            model_success = False
            # 3 retries per model for rate limits
            for attempt in range(3):
                try:
                    model = genai.GenerativeModel(m_name)
                    # Pass the prompt string. For recommend, we don't necessarily need the image 
                    # as the tissue analysis is already in the prompt text
                    response = model.generate_content(prompt)
                    
                    if not response or not response.candidates or not response.text:
                        print(f"[RECOMMEND] Model {m_name} returned empty/blocked response")
                        break # breaking attempt loop, try next model
                        
                    print(f"[RECOMMEND] Model {m_name} succeeded on attempt {attempt+1}")
                    model_success = True
                    break
                except Exception as e:
                    err_msg = str(e)
                    print(f"[RECOMMEND] Model {m_name} attempt {attempt+1} failed: {type(e).__name__}: {err_msg[:100]}...")
                    if "429" in err_msg or "Quota" in err_msg or "ResourceExhausted" in type(e).__name__:
                        # Exponential backoff: 4s, 5s...
                        time.sleep(2 ** attempt + 3)
                    else:
                        break # not a rate limit, don't retry this model

            if model_success:
                break

        if not response or not response.text:
            raise Exception("All recommendation models failed")

        response_text = response.text.strip()

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)

        rec = Recommendation.objects.create(
            classification=clf,
            summary=result.get("summary", "No summary provided"),
            cleaning_instructions=result.get("cleaningInstructions", []),
            dressing_recommendations=result.get("dressingRecommendations", []),
            warning_signs=result.get("warningsSigns", []),
            when_to_seek_help=result.get("whenToSeekHelp", []),
            diet_advice=result.get("dietAdvice", []),
            activity_restrictions=result.get("activityRestrictions", []),
            expected_healing_time=result.get("expectedHealingTime", "Variable"),
            follow_up_schedule=result.get("followUpSchedule", []),
            ai_confidence=result.get("confidence", 75),
        )

        return Response({
            "success": True,
            "recommendation_id": rec.id,
            "recommendation": result,
            "risk_level": severity_level,
            "severity_score": float(severity_score),
            "tissue_composition": tissue,
        })

    except json.JSONDecodeError as e:
        return Response({"success": False, "error": f"Failed to parse AI response: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({"success": False, "error": f"Recommendation failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
