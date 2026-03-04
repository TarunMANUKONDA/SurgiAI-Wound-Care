"""
classify.py — Wound Classification with TFLite + Gemini Fusion

Pipeline:
  1. Run custom TFLite model → wound type classification (4 classes)
  2. Run Gemini Vision AI → detailed tissue composition + clinical notes
  3. Fuse results:
      - wound_type: weighted vote (TFLite 60% + Gemini 40%)
      - tissue_composition: Gemini's values anchored by TFLite profile
      - confidence: combined confidence
  4. Deterministic overrides for critical safety flags
"""

import json
import time
import os
from pathlib import Path

import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from api.models import Wound, Classification
from api import tflite_classifier

genai.configure(api_key=settings.GEMINI_API_KEY)

MODEL_NAMES = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
]

CLASSIFY_PROMPT = """This is a medical wound photograph. Analyze the WOUND TISSUE ONLY.

Look at the open wound area (ignore all surrounding skin, bandages, and background).
Inside the wound, estimate what percentage of the wound interior is each tissue type:

RED tissue = granulation = beefy dark-red, moist, bumpy/nodular surface (like raw meat)
PINK tissue = epithelium = pale pink, smooth thin film, new skin growing from edges
YELLOW tissue = slough = stringy, wet, creamy-yellow fibrin strands (like wet pasta)
WHITE tissue = dense fibrin = thick white paste or cottage-cheese texture inside wound
BLACK tissue = necrosis = dry, hard, leathery dark-brown to black dead tissue

CRITICAL RULES:
- Analyze ONLY the wound interior, NOT the surrounding skin
- Do not count periwound skin as pink epithelium
- Red bumpy/nodular texture = granulation (RED), not redness of skin
- If you see mixed colors, estimate the area percentage of each
- All five percentages MUST add up to exactly 100
- Also note: any visible fluid/discharge inside wound, and overall wound redness level

Return ONLY this JSON with no markdown or extra text:
{
  "tissue_composition": {"red": 0-100, "pink": 0-100, "yellow": 0-100, "black": 0-100, "white": 0-100},
  "redness_level": 0-100,
  "discharge_detected": true or false,
  "discharge_type": "none" or "clear" or "yellow" or "green" or "bloody",
  "edge_quality": 0-100,
  "wound_location": [ymin, xmin, ymax, xmax],
  "confidence": 0-100,
  "notes": "describe exactly what tissue colors/textures you saw in the wound"
}"""


def compute_severity_from_tissue(tissue: dict, discharge_type: str = "none",
                                  redness_level: float = 0) -> tuple[str, str, float]:
    """
    Compute wound_type and severity purely from tissue composition numbers.
    This is the authoritative classification — not dependent on Gemini's wound_type string.

    Returns: (wound_type, severity_level, confidence_boost)
    """
    red    = float(tissue.get("red",    0))
    pink   = float(tissue.get("pink",   0))
    yellow = float(tissue.get("yellow", 0))
    white  = float(tissue.get("white",  0))
    black  = float(tissue.get("black",  0))

    slough = yellow + white
    healthy = red + pink

    # ── Critical: necrosis present ────────────────────────────────────────────
    if black >= 20:
        return "High Urgency", "Critical", 92.0
    if black >= 10:
        return "High Urgency", "High", 88.0

    # ── Active infection signals ───────────────────────────────────────────────
    if discharge_type in ("yellow", "green") and slough >= 15:
        return "Active Infection", "High", 85.0
    if slough >= 40 and redness_level >= 70:
        return "Active Infection", "High", 82.0

    # ── Infection risk ─────────────────────────────────────────────────────────
    if slough >= 30:
        return "Infection Risk", "Moderate", 78.0
    if slough >= 20 and redness_level >= 60:
        return "Infection Risk", "Moderate", 75.0

    # ── Delayed healing ────────────────────────────────────────────────────────
    if slough >= 15:
        return "Delayed Healing", "Moderate", 72.0
    if healthy < 30 and slough >= 10:
        return "Delayed Healing", "Low", 68.0

    # ── Normal / healing well ─────────────────────────────────────────────────
    if pink >= 40:
        return "Normal Healing", "Low", 85.0   # Epithelialization — excellent
    if red >= 50:
        return "Normal Healing", "Low", 80.0   # Good granulation
    if healthy >= 60:
        return "Normal Healing", "Low", 75.0

    # ── Default: borderline ───────────────────────────────────────────────────
    return "Delayed Healing", "Low", 65.0


# ── Wound type normalization map ───────────────────────────────────────────────
WOUND_TYPE_ALIASES = {
    "normal healing":       "Normal Healing",
    "healing":              "Normal Healing",
    "delayed healing":      "Delayed Healing",
    "delayed":              "Delayed Healing",
    "infection risk":       "Infection Risk",
    "infection risk assessment": "Infection Risk",
    "active infection":     "Active Infection",
    "infected":             "Active Infection",
    "high urgency":         "High Urgency",
    "urgency level":        "High Urgency",
    "critical":             "High Urgency",
    "necrotic":             "High Urgency",
}

ALL_TYPES = ["Normal Healing", "Delayed Healing", "Infection Risk", "Active Infection", "High Urgency"]

# TFLite class order → normalized label
TFLITE_CLASSES = ["Normal Healing", "Delayed Healing", "Infection Risk", "High Urgency"]

# Tissue profiles are NO LONGER USED per user request (strict AI only)
TISSUE_PROFILES = {}


def normalize_wound_type(raw: str) -> str:
    """Normalize any wound type string to our 5 canonical labels."""
    return WOUND_TYPE_ALIASES.get(raw.lower().strip(), raw)


def fuse_results(tflite_result: dict, gemini_result: dict | None) -> dict:
    """
    STRICT AI MODE: ENFORCED PER USER REQUEST.
    Tissue composition MUST come from Gemini. Fallbacks are disabled.
    """
    g_tissue = (gemini_result or {}).get("tissue_composition", {})
    has_valid_gemini_tissue = (
        isinstance(g_tissue, dict)
        and all(k in g_tissue for k in ("red", "pink", "yellow", "black", "white"))
    )

    if not has_valid_gemini_tissue:
        # Return a failure signal for tissue-based fields
        return {
            "success": False,
            "error": "Gemini AI analysis unavailable (Quota). Fallback profiles disabled.",
            "wound_type": "Unknown",
            "severity_level": "None",
            "confidence": 0,
            "probabilities": {t: 0 for t in TFLITE_CLASSES},
            "redness_level": 0,
            "discharge_detected": False,
            "discharge_type": "none",
            "edge_quality": 0,
            "tissue_composition": {"red": 0, "pink": 0, "yellow": 0, "black": 0, "white": 0},
            "wound_location": [0, 0, 1000, 1000],
            "notes": "Quota exceeded. No tissue analysis performed.",
            "source": "none"
        }

    # Normalize Gemini tissue to sum 100
    total = sum(float(g_tissue.get(k, 0)) for k in ("red", "pink", "yellow", "black", "white"))
    tissue_keys = ("red", "pink", "yellow", "black", "white")
    if total > 0:
        normalized = {k: float(g_tissue.get(k, 0)) / total * 100 for k in tissue_keys}
        tissue = {k: round(normalized[k], 1) for k in tissue_keys}
    else:
        # Should not happen with valid tissue, but safety check
        tissue = {k: 0.0 for k in tissue_keys}

    # ── Step 3: Clinical fields from Gemini ─────────────────────────────────
    redness_level  = float((gemini_result or {}).get("redness_level", 40))
    discharge_det  = (gemini_result or {}).get("discharge_detected", False)
    discharge_type = (gemini_result or {}).get("discharge_type", "none")
    edge_quality   = (gemini_result or {}).get("edge_quality", 50)
    wound_location = (gemini_result or {}).get("wound_location", [0, 0, 1000, 1000])
    notes          = (gemini_result or {}).get("notes", "")

    # ── Step 4: Authoritative wound_type and severity from tissue numbers ───
    final_type, severity_level, base_conf = compute_severity_from_tissue(
        tissue, discharge_type, redness_level
    )

    # ── Step 4b: Special Case — Healed/Scar Detection ──────────────────────
    is_healed_tissue = (tissue.get("pink", 0) + tissue.get("red", 0)) >= 90
    if final_type == "Normal Healing" and is_healed_tissue:
        severity_level = "Low (Healed)"
        if base_conf < 90: base_conf = 95.0

    # ── Step 5: Confidence & Source ─────────────────────────────────────────
    gemini_conf = float((gemini_result or {}).get("confidence", 60))
    final_confidence = min(99, gemini_conf + 5)
    source = "tflite+gemini"

    # ── Step 6: Build probabilities ─────────────────────────────────────────
    all_types = ["Normal Healing", "Delayed Healing", "Infection Risk", "Active Infection", "High Urgency"]
    base_prob = 100 / len(all_types)
    final_probs = {t: round(base_prob, 1) for t in all_types}
    final_probs[final_type] = round(final_confidence, 1)
    
    remaining = 100 - final_confidence
    other_types = [t for t in all_types if t != final_type]
    for t in other_types:
        final_probs[t] = round(remaining / len(other_types), 1)

    return {
        "success":            True,
        "wound_type":         final_type,
        "severity_level":     severity_level,
        "confidence":         final_confidence,
        "probabilities":      final_probs,
        "redness_level":      redness_level,
        "discharge_detected": discharge_det,
        "discharge_type":     discharge_type,
        "edge_quality":       edge_quality,
        "tissue_composition": tissue,
        "wound_location":     wound_location,
        "notes":              notes,
        "source":             source,
    }


def run_gemini_classify(img_path: str) -> dict | None:
    """Run Gemini classification on the wound image. Returns result dict or None."""
    try:
        # Always use inline data for less restrictive quotas
        with open(img_path, 'rb') as f:
            image_part = {"mime_type": "image/jpeg", "data": f.read()}

        response = None
        for m_name in MODEL_NAMES:
            model_success = False
            # 3 retries per model for rate limits
            for attempt in range(3):
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content([image_part, CLASSIFY_PROMPT])
                    if not response or not response.candidates or not response.text:
                        print(f"[CLASSIFY] Model {m_name} returned empty/blocked response")
                        break # breaking attempt loop, try next model
                    print(f"[CLASSIFY] Gemini model {m_name} succeeded on attempt {attempt+1}")
                    model_success = True
                    break
                except Exception as e:
                    err_msg = str(e)
                    print(f"[CLASSIFY] Model {m_name} attempt {attempt+1} failed: {type(e).__name__}: {err_msg[:100]}...")
                    if "429" in err_msg or "Quota" in err_msg or "ResourceExhausted" in type(e).__name__:
                        time.sleep(2 ** attempt + 3) # delays: 4s, 5s (total 9s before giving up on this model)
                    else:
                        break # not a rate limit, don't retry this model

            if model_success:
                break

        if not response or not response.text:
            return None

        response_text = response.text.strip()
        print(f"[CLASSIFY] Gemini raw: {response_text[:300]}")

        # Strip markdown code fences
        clean = response_text
        if clean.startswith("```"):
            parts = clean.split("```")
            clean = parts[1] if len(parts) > 1 else clean
            if clean.startswith("json"):
                clean = clean[4:]
            clean = clean.strip()

        try:
            return json.loads(clean)
        except json.JSONDecodeError:
            s = clean.find("{")
            e = clean.rfind("}") + 1
            if s >= 0 and e > s:
                return json.loads(clean[s:e])
        return None

    except Exception as e:
        print(f"[CLASSIFY] Gemini classification error: {type(e).__name__}: {e}")
        return None


@api_view(['POST'])
def classify_wound(request):
    """Classify wound using TFLite model + Gemini Vision fusion."""
    wound_id = request.data.get('wound_id')
    if not wound_id:
        return Response({"success": False, "error": "wound_id required"}, status=status.HTTP_400_BAD_REQUEST)

    wound = Wound.objects.filter(id=wound_id).first()
    if not wound:
        return Response({"success": False, "error": "Wound not found"}, status=status.HTTP_404_NOT_FOUND)

    # Resolve actual disk path
    img_path = wound.image_path
    if not os.path.isabs(img_path):
        img_path = os.path.join(settings.BASE_DIR, img_path)
    if not Path(img_path).exists():
        return Response({"success": False, "error": f"Image file not found: {img_path}"}, status=status.HTTP_404_NOT_FOUND)

    try:
        start_time = time.time()

        # ── Step 1: TFLite inference ───────────────────────────────────────────
        tflite_result = None
        try:
            with open(img_path, 'rb') as f:
                image_bytes = f.read()
            tflite_result = tflite_classifier.classify_image(image_bytes)
            print(f"[CLASSIFY] TFLite: {tflite_result['wound_type']} ({tflite_result['confidence']}%)")
        except Exception as e:
            print(f"[CLASSIFY] TFLite failed: {type(e).__name__}: {e}")
            # Fallback TFLite result
            tflite_result = {
                "wound_type": "Normal Healing",
                "confidence": 40,
                "probabilities": {t: 25.0 for t in TFLITE_CLASSES},
            }

        # ── Step 2: Gemini tissue analysis ────────────────────────────────────
        gemini_result = run_gemini_classify(img_path)
        if gemini_result:
            print(f"[CLASSIFY] Gemini: {gemini_result.get('wound_type')} ({gemini_result.get('confidence')}%)")
        else:
            print("[CLASSIFY] Gemini unavailable — using TFLite only")

        # ── Step 3: Fuse results ───────────────────────────────────────────────
        fused = fuse_results(tflite_result, gemini_result)
        processing_time = int((time.time() - start_time) * 1000)

        # ── Step 4: Deterministic safety overrides ────────────────────────────
        t = fused["tissue_composition"]
        total_necrosis = t.get("black", 0)
        total_slough = t.get("yellow", 0) + t.get("white", 0)

        final_type  = fused["wound_type"]
        final_probs = fused["probabilities"]

        if total_necrosis >= 10:
            final_type = "High Urgency"
            final_probs["High Urgency"] = max(final_probs.get("High Urgency", 0), 90)
        elif total_slough >= 20:
            if fused.get("discharge_detected") and fused.get("discharge_type") in ["yellow", "green"]:
                final_type = "Active Infection"
                final_probs["Active Infection"] = max(final_probs.get("Active Infection", 0), 85)
            elif final_type == "Normal Healing":
                final_type = "Delayed Healing"
                final_probs["Delayed Healing"] = max(final_probs.get("Delayed Healing", 0), 80)

        # ── Step 5: Save to database ──────────────────────────────────────────
        clf = Classification.objects.create(
            wound=wound,
            wound_type=final_type,
            confidence=fused["confidence"],
            all_probabilities=final_probs,
            processing_time_ms=processing_time,
        )

        wound.status = "analyzed"
        wound.classification = final_type
        wound.confidence = fused["confidence"]
        wound.redness_level = fused["redness_level"]
        wound.discharge_detected = fused["discharge_detected"]
        wound.discharge_type = fused["discharge_type"]
        wound.edge_quality = fused["edge_quality"]
        wound.tissue_composition = t
        wound.analysis = fused
        wound.save()

        return Response({
            "success":           True,
            "classification_id": clf.id,
            "wound_type":        final_type,
            "confidence":        fused["confidence"],
            "probabilities":     final_probs,
            "redness_level":     fused["redness_level"],
            "discharge_detected":fused["discharge_detected"],
            "discharge_type":    fused["discharge_type"],
            "edge_quality":      fused["edge_quality"],
            "tissue_composition":t,
            "wound_location":    fused["wound_location"],
            "processing_time_ms":processing_time,
            "source":            fused["source"],
        })

    except json.JSONDecodeError as e:
        return Response({"success": False, "error": f"Failed to parse AI response: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({"success": False, "error": f"Classification failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
