"""
TFLite Wound Classifier — runs the custom trained model on wound images.
Input:  224x224 RGB float32 image, normalized to [0, 1]
Output: 4-class softmax probabilities
Classes (in order from training, mapped to our app categories):
  0 → Normal Healing
  1 → Delayed Healing
  2 → Infection Risk / Active Infection
  3 → High Urgency / Critical
"""

import os
import io
import numpy as np
import warnings

# Suppress TF noisy logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    import tensorflow as tf

from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'wound_classifier.tflite')
MODEL_PATH = os.path.abspath(MODEL_PATH)

# Maps TFLite output class index → app wound type label
CLASS_LABELS = [
    "Normal Healing",       # index 0
    "Delayed Healing",      # index 1
    "Infection Risk",       # index 2
    "High Urgency",         # index 3
]

# Tissue composition heuristics per class
# Based on clinical profiles — used to seed tissue estimates per model output
TISSUE_PROFILES = {
    "Normal Healing":  {"red": 55, "pink": 35, "yellow": 5,  "black": 0, "white": 5},
    "Delayed Healing": {"red": 35, "pink": 20, "yellow": 30, "black": 5, "white": 10},
    "Infection Risk":  {"red": 40, "pink": 5,  "yellow": 40, "black": 5, "white": 10},
    "High Urgency":    {"red": 15, "pink": 0,  "yellow": 25, "black": 55, "white": 5},
}

_interpreter = None


def _get_interpreter():
    """Lazily load the TFLite interpreter (singleton)."""
    global _interpreter
    if _interpreter is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"TFLite model not found at: {MODEL_PATH}")
        print(f"[TFLite] Loading model from {MODEL_PATH}")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        _interpreter.allocate_tensors()
        print("[TFLite] Model loaded successfully")
    return _interpreter


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes to a [1, 224, 224, 3] float32 tensor in [0,1]."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)  # Shape: [1, 224, 224, 3]


def classify_image(image_bytes: bytes) -> dict:
    """
    Run TFLite inference on image bytes.

    Returns:
        {
          "wound_type": str,
          "confidence": float (0-100),
          "probabilities": {label: float (0-100), ...},
          "tissue_profile": {red, pink, yellow, black, white},
          "model": "tflite"
        }
    """
    interpreter = _get_interpreter()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    tensor = preprocess_image(image_bytes)

    interpreter.set_tensor(input_details[0]['index'], tensor)
    interpreter.invoke()

    raw_output = interpreter.get_tensor(output_details[0]['index'])[0]  # shape [4]
    print(f"[TFLite] Raw output: {raw_output}")

    # Convert to percentages
    probs = {CLASS_LABELS[i]: round(float(raw_output[i]) * 100, 1) for i in range(len(CLASS_LABELS))}
    top_idx = int(np.argmax(raw_output))
    top_label = CLASS_LABELS[top_idx]
    top_conf = round(float(raw_output[top_idx]) * 100, 1)

    print(f"[TFLite] Result: {top_label} ({top_conf}%)")

    return {
        "wound_type": top_label,
        "confidence": top_conf,
        "probabilities": probs,
        "tissue_profile": TISSUE_PROFILES[top_label],
        "model": "tflite",
    }
