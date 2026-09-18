import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator, model_validator

# ──────────────────────────────────────────────
# Paths — model lives in Cognitiveminds/models/
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "risk_model.pkl"
FEATURES_PATH = MODEL_DIR / "features.pkl"

# ──────────────────────────────────────────────
# Load model & feature list at startup
# ──────────────────────────────────────────────
try:
    model = joblib.load(MODEL_PATH)
    features: list[str] = joblib.load(FEATURES_PATH)
    print(f"[OK] Model loaded from: {MODEL_PATH}")
    print(f"[OK] Features ({len(features)}): {features}")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}", file=sys.stderr)
    raise SystemExit(1)


# ──────────────────────────────────────────────
# Friendly descriptions for each JM1 metric
# ──────────────────────────────────────────────
FEATURE_DESCRIPTIONS: dict[str, str] = {
    "loc":               "Lines of Code (total)",
    "v(g)":              "Cyclomatic Complexity — decision paths",
    "ev(g)":             "Essential Complexity — irreducible complexity",
    "iv(g)":             "Design Complexity — module coupling",
    "n":                 "Halstead Length N (total operators + operands)",
    "v":                 "Halstead Volume — program size in bits",
    "l":                 "Halstead Program Level (abstraction level)",
    "d":                 "Halstead Difficulty — how hard to understand",
    "i":                 "Halstead Intelligence — pure algorithm size",
    "e":                 "Halstead Effort — mental effort to implement",
    "b":                 "Halstead Bugs Estimate",
    "t":                 "Time to Implement (seconds)",
    "lOCode":            "Lines of Executable Code",
    "lOComment":         "Lines of Comments",
    "lOBlank":           "Blank Lines",
    "lOCodeAndComment":  "Lines of Code and Comment",
    "uniq_Op":           "Number of Unique Operators",
    "uniq_Opnd":         "Number of Unique Operands",
    "total_Op":          "Total Count of Operators",
    "total_Opnd":        "Total Count of Operands",
    "branchCount":       "Branch Count",
}


# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="CognitiveMinds — Software Defect Risk API",
    description="Predicts software module defect risk using a LightGBM model trained on NASA JM1 data.",
    version="1.0.0",
)

# Allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────
class PredictRequest(BaseModel):
    """Accepts a dict of feature_name → numeric value."""
    features: dict[str, float]

    @model_validator(mode="after")
    def validate_features(self):
        stored = joblib.load(FEATURES_PATH)
        missing = [f for f in stored if f not in self.features]
        if missing:
            raise ValueError(f"Missing features: {missing}")
        return self


class FeatureInfo(BaseModel):
    name: str
    description: str


class FeaturesResponse(BaseModel):
    count: int
    features: list[FeatureInfo]


class PredictResponse(BaseModel):
    prediction: str           # "DEFECT" or "NO DEFECT"
    defect_probability: float # 0.0 – 1.0
    risk_score: float         # 0.0 – 100.0
    risk_level: str           # "LOW" | "MEDIUM" | "HIGH"


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────
@app.get("/health", tags=["Utility"])
def health_check():
    """Confirms the API is running and the model is loaded."""
    return {
        "status": "ok",
        "model": "LightGBM",
        "feature_count": len(features),
    }


@app.get("/features", response_model=FeaturesResponse, tags=["Utility"])
def get_features():
    """Returns the list of 21 input features expected by the model."""
    feature_list = [
        FeatureInfo(
            name=f,
            description=FEATURE_DESCRIPTIONS.get(f, f),
        )
        for f in features
    ]
    return FeaturesResponse(count=len(features), features=feature_list)


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(request: PredictRequest):
    """
    Accepts 21 software metrics and returns:
    - Predicted class (DEFECT / NO DEFECT)
    - Defect probability (0.0 – 1.0)
    - Risk score (0 – 100)
    - Risk level (LOW / MEDIUM / HIGH)
    """
    try:
        # Build dataframe in exact training column order
        row = {f: request.features.get(f, 0.0) for f in features}
        input_df = pd.DataFrame([row])[features]

        prediction_int = int(model.predict(input_df)[0])
        defect_prob = float(model.predict_proba(input_df)[0][1])
        risk_score = round(defect_prob * 100, 2)

        if risk_score < 30:
            risk_level = "LOW"
        elif risk_score < 70:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        prediction_text = "DEFECT" if prediction_int == 1 else "NO DEFECT"

        return PredictResponse(
            prediction=prediction_text,
            defect_probability=round(defect_prob, 4),
            risk_score=risk_score,
            risk_level=risk_level,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
