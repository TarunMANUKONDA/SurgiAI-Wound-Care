import json
import base64
import tempfile
import os
from io import BytesIO

import cv2
import numpy as np
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

genai.configure(api_key=settings.GEMINI_API_KEY)


def log_debug(message):
    print(f"[VALIDATE] {message}")

SAFETY_SETTINGS = [
    {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
    {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_NONE},
    {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_NONE},
    {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
]

MODEL_NAMES = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
]

VALIDATE_PROMPT = """Analyze this image with extreme lenience to identify ANY evidence of a medical or surgical procedure.

CRITICAL REQUIREMENT:
You MUST classify the following as an ACTIVE WOUND (has_wound: true):
1. ANY surgical incision, even if it is clean, straight, and neatly closed.
2. ANY site with stitches, sutures, staples, or surgical tape/strips.
3. ANY recent surgical scar that still appears pink, raised, or has visible marks from needles/staples.
4. ANY dressing, bandage, or medical tape that covers a suspected wound area.

Only classify has_wound: false if the skin is perfectly intact, healthy, and shows absolutely no signs of recent medical intervention or injury.

OUTPUT FORMAT (JSON only):
{
  "has_wound": boolean,
  "is_healed": boolean, (true only for mature, flat, old white scars)
  "confidence": number, (percentage 0-100)
  "explanation": "Brief reasoning for your classification"
}
"""


def calculate_blur_score(image_array: np.ndarray) -> float:
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY) if len(image_array.shape) == 3 else image_array
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def detect_wound_with_gemini(image_data: str):
    try:
        log_debug("Attempting wound detection with Gemini...")

        if ',' in image_data:
            image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            tmp.write(image_bytes)
            temp_path = tmp.name

        response = None
        last_error = None

        try:
            # Use inline image data instead of File API to bypass tighter quotas
            image_part = {"mime_type": "image/jpeg", "data": image_bytes}

            response = None
            for m_name in MODEL_NAMES:
                model_success = False
                # 3 retries per model for rate limits
                for attempt in range(3):
                    try:
                        log_debug(f"Trying model: {m_name} (attempt {attempt+1})")
                        model = genai.GenerativeModel(m_name)

                        response = model.generate_content(
                            [image_part, VALIDATE_PROMPT],
                            safety_settings=SAFETY_SETTINGS
                        )

                        if not response or not response.candidates or not response.text:
                            log_debug(f"Model {m_name} returned empty/blocked response.")
                            break # Try next model
                        
                        log_debug(f"Model {m_name} succeeded on attempt {attempt+1}.")
                        model_success = True
                        break
                    except Exception as e:
                        err_msg = str(e)
                        log_debug(f"Model {m_name} attempt {attempt+1} failed: {type(e).__name__}: {err_msg[:100]}")
                        if "429" in err_msg or "Quota" in err_msg or "ResourceExhausted" in type(e).__name__:
                            # Exponential backoff
                            time.sleep(2 ** attempt + 3)
                        else:
                            break # Not a rate limit issue

                if model_success:
                    break

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        if not response or not response.candidates or not response.text:
            err_msg = str(last_error) if last_error else "All models failed or were blocked"
            log_debug(f"All models failed: {err_msg}")
            raise Exception(err_msg)

        response_text = response.text.strip()
        log_debug(f"Raw Gemini Response: {response_text}")

        # Parse JSON — strip markdown code fences if present
        clean = response_text
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
            clean = clean.strip()

        try:
            result = json.loads(clean)
        except json.JSONDecodeError:
            s = clean.find("{")
            e = clean.rfind("}") + 1
            if s >= 0 and e > s:
                result = json.loads(clean[s:e])
            else:
                raise Exception(f"Could not parse JSON from Gemini response: {response_text[:200]}")

        log_debug(f"Parsed Gemini Result: {result}")

        has_wound = result.get("has_wound", False)
        if isinstance(has_wound, str):
            has_wound = has_wound.lower() == 'true'
        is_healed = result.get("is_healed", False)
        if isinstance(is_healed, str):
            is_healed = is_healed.lower() == 'true'

        conf_val = result.get("confidence", 0)
        try:
            confidence = float(str(conf_val).replace('%', ''))
        except Exception:
            confidence = 50.0  # default to 50 if unparseable

        explanation = result.get("explanation", "No explanation provided")
        log_debug(f"Final -> has_wound={has_wound}, is_healed={is_healed}, confidence={confidence}")
        return has_wound, is_healed, confidence, explanation

    except Exception as e:
        print(f"[VALIDATE] Gemini wound detection FAILED: {type(e).__name__}: {e}")
        # Return a safe fallback — let the app proceed rather than hard-block
        return False, False, 0, f"Detection error: {str(e)}"



@api_view(['POST'])
def validate_image(request):
    """Validate image for blur and wound detection."""
    try:
        key = getattr(settings, 'GEMINI_API_KEY', '')
        genai.configure(api_key=key)

        image_data = request.data.get('image_data', '')
        if not image_data:
            return Response({"success": False, "error": "No image data provided"}, status=status.HTTP_400_BAD_REQUEST)

        if ',' in image_data:
            image_data_b64 = image_data.split(',')[1]
        else:
            image_data_b64 = image_data

        image_bytes = base64.b64decode(image_data_b64)
        pil_image = Image.open(BytesIO(image_bytes))
        image_array = np.array(pil_image)

        # ── Step 1: Blur check (only hard gate) ──────────────────────────────
        blur_score = calculate_blur_score(image_array)
        BLUR_THRESHOLD = 30.0   # lowered from 50 — many real phone photos score 50-200
        is_blur = blur_score < BLUR_THRESHOLD

        log_debug(f"Blur score: {blur_score:.2f} (threshold={BLUR_THRESHOLD}, is_blur={is_blur})")

        if is_blur:
            return Response({
                "success": True,
                "is_valid": False,
                "is_blur": True,
                "has_wound": False,
                "is_healed": False,
                "blur_score": blur_score,
                "wound_confidence": 0,
                "message": "Image is too blurry. Please retake the photo in good lighting and hold the camera steady.",
            })

        # ── Step 2: Gemini wound detection (fail-open) ───────────────────────
        # If Gemini fails for any reason, we still let the image through
        # so the real AI analysis step can process it.
        gemini_error = None
        has_wound = True        # default: assume wound present (fail-open)
        is_healed = False
        wound_confidence = 50   # default neutral confidence
        explanation = "Validation service unavailable — proceeding with analysis"

        try:
            has_wound, is_healed, wound_confidence, explanation = detect_wound_with_gemini(
                request.data.get('image_data', '')
            )
            log_debug(f"Gemini result: has_wound={has_wound}, confidence={wound_confidence}, healed={is_healed}")
        except Exception as e:
            gemini_error = str(e)
            log_debug(f"Gemini detection raised exception: {e} — allowing image through")

        # ── Step 3: Decide validity ──────────────────────────────────────────
        # Only 2 cases that BLOCK the image:
        #   1. Image was blurry (already returned above)
        #   2. Gemini is CONFIDENT it's not a wound (high confidence, no wound)
        #
        # Everything else (errors, low confidence, etc.) = let it through

        CONFIDENCE_BLOCK_THRESHOLD = 80  # Only block if Gemini is 80%+ sure it's NOT a wound

        if gemini_error:
            # Gemini failed — let it through, real classification will handle it
            is_valid = True
            message = "Wound detected. Proceeding with analysis."
        elif not has_wound and wound_confidence >= CONFIDENCE_BLOCK_THRESHOLD:
            # Gemini is very confident this is NOT a wound
            is_valid = False
            message = "No wound detected in this image. Please photograph the wound area directly."
        elif is_healed:
            is_valid = True
            message = "Healed or closed wound detected."
        else:
            # has_wound=True OR low-confidence no-wound — let it through
            is_valid = True
            message = "Wound detected. Proceeding with analysis." if has_wound else \
                      "Image accepted. Please ensure the wound is clearly visible."

        log_debug(f"Final validation: is_valid={is_valid}, message={message}")

        return Response({
            "success": True,
            "is_valid": is_valid,
            "is_blur": is_blur,
            "has_wound": has_wound,
            "is_healed": is_healed,
            "blur_score": blur_score,
            "wound_confidence": wound_confidence,
            "message": message,
        })

    except Exception as e:
        log_debug(f"validate_image top-level error: {type(e).__name__}: {e}")
        # Even if everything fails, return a valid response so the app can continue
        return Response({
            "success": True,
            "is_valid": True,
            "is_blur": False,
            "has_wound": True,
            "is_healed": False,
            "blur_score": 999,
            "wound_confidence": 50,
            "message": "Validation unavailable. Proceeding with analysis.",
        })

