import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score
)

from lightgbm import LGBMClassifier


# ==========================================
# 1. LOAD DATA
# ==========================================

df = pd.read_csv("data/jm1.csv")

print("Dataset shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())


# ==========================================
# 2. CHECK TARGET DISTRIBUTION
# ==========================================

print("\n==============================")
print("TARGET DISTRIBUTION")
print("==============================")

target_counts = df["defects"].value_counts()

print(target_counts)

print("\nTarget percentages:")

target_percentages = df["defects"].value_counts(normalize=True) * 100

print(target_percentages.round(2))


# ==========================================
# 3. CLEAN DATA
# ==========================================

X = df.drop(columns=["defects"]).copy()

y = df["defects"].astype(int)


# Convert all feature columns to numeric
for column in X.columns:

    X[column] = pd.to_numeric(
        X[column],
        errors="coerce"
    )


# ==========================================
# 4. HANDLE MISSING VALUES
# ==========================================

print("\n==============================")
print("MISSING VALUES")
print("==============================")

print(X.isnull().sum())


# Replace missing values with median
X = X.fillna(X.median(numeric_only=True))


print("\nMissing values after filling:")

print(X.isnull().sum().sum())


# ==========================================
# 5. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    # IMPORTANT:
    # Keeps the same False/True ratio
    # in both training and testing sets
    stratify=y
)


print("\n==============================")
print("DATA SPLIT")
print("==============================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


print("\nTraining target distribution:")

print(y_train.value_counts())

print("\nTesting target distribution:")

print(y_test.value_counts())


# ==========================================
# 6. CALCULATE CLASS WEIGHTS
# ==========================================

# Number of samples in each class
negative_count = (y_train == 0).sum()
positive_count = (y_train == 1).sum()

print("\n==============================")
print("CLASS IMBALANCE")
print("==============================")

print("Non-defective (False):", negative_count)
print("Defective (True):", positive_count)


# Weight for minority class
scale_pos_weight = negative_count / positive_count

print(
    "\nScale Pos Weight:",
    round(scale_pos_weight, 2)
)


# ==========================================
# 7. CREATE IMBALANCE-AWARE MODEL
# ==========================================

model = LGBMClassifier(

    n_estimators=300,

    learning_rate=0.05,

    num_leaves=31,

    random_state=42,

    # HANDLE CLASS IMBALANCE
    scale_pos_weight=scale_pos_weight,

    verbosity=-1
)


# ==========================================
# 8. TRAIN MODEL
# ==========================================

print("\n==============================")
print("TRAINING MODEL")
print("==============================")

print("Training...")

model.fit(
    X_train,
    y_train
)

print("Training completed.")


# ==========================================
# 9. PREDICTION
# ==========================================

y_pred = model.predict(X_test)

# Probability of defective class
y_probability = model.predict_proba(X_test)[:, 1]


# ==========================================
# 10. MODEL EVALUATION
# ==========================================

print("\n==============================")
print("MODEL PERFORMANCE")
print("==============================")


# Classification report

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "No Defect",
            "Defect"
        ]
    )
)


# ==========================================
# 11. CONFUSION MATRIX
# ==========================================

print("\nConfusion Matrix:")

cm = confusion_matrix(
    y_test,
    y_pred
)

print(cm)


# Extract confusion matrix values

tn, fp, fn, tp = cm.ravel()

print("\nTrue Negatives :", tn)
print("False Positives:", fp)
print("False Negatives:", fn)
print("True Positives :", tp)


# ==========================================
# 12. ROC-AUC
# ==========================================

roc_auc = roc_auc_score(
    y_test,
    y_probability
)


# ==========================================
# 13. PR-AUC
# ==========================================

pr_auc = average_precision_score(
    y_test,
    y_probability
)


print("\n==============================")
print("IMPORTANT METRICS")
print("==============================")

print(
    "ROC-AUC:",
    round(roc_auc, 4)
)

print(
    "PR-AUC :",
    round(pr_auc, 4)
)


# ==========================================
# 14. SAVE MODEL
# ==========================================

# Create models folder if it doesn't exist

os.makedirs(
    "models",
    exist_ok=True
)


joblib.dump(
    model,
    "models/risk_model.pkl"
)

print("\nModel saved to:")

print("models/risk_model.pkl")


# ==========================================
# 15. SAVE FEATURE NAMES
# ==========================================

joblib.dump(
    list(X.columns),
    "models/features.pkl"
)

print("Feature names saved to:")

print("models/features.pkl")


# ==========================================
# 16. CREATE RISK SCORE DATAFRAME
# ==========================================

results = X_test.copy()


# IMPORTANT:
# Use the original test indexes
# so actual labels remain aligned

results["actual_defect"] = y_test


results["defect_probability"] = (
    y_probability
)


# ==========================================
# 17. CONVERT PROBABILITY TO RISK SCORE
# ==========================================

results["risk_score"] = (

    results["defect_probability"] * 100

)


# ==========================================
# 18. CREATE RISK LEVEL
# ==========================================

results["risk_level"] = pd.cut(

    results["risk_score"],

    bins=[
        -1,
        30,
        70,
        100
    ],

    labels=[
        "LOW",
        "MEDIUM",
        "HIGH"
    ]

)


# ==========================================
# 19. SHOW EXAMPLE RISK SCORES
# ==========================================

print("\n==============================")
print("EXAMPLE RISK SCORES")
print("==============================")


print(

    results[
        [
            "defect_probability",
            "risk_score",
            "risk_level",
            "actual_defect"
        ]
    ].head(10)

)


# ==========================================
# 20. RISK LEVEL DISTRIBUTION
# ==========================================

print("\n==============================")
print("RISK LEVEL DISTRIBUTION")
print("==============================")


print(
    results["risk_level"].value_counts()
)


print("\n==============================")
print("MODEL TRAINING COMPLETED")
print("==============================")