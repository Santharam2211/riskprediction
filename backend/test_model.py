import joblib
import pandas as pd


# ==========================================
# 1. LOAD TRAINED MODEL
# ==========================================

model = joblib.load("models/risk_model.pkl")

features = joblib.load("models/features.pkl")

print("Model loaded successfully!")


# ==========================================
# 2. DISPLAY INPUT FEATURES
# ==========================================

print("\n==========================================")
print("SOFTWARE DEFECT RISK PREDICTION")
print("==========================================")

print("\nEnter the following 21 software metrics:\n")


# ==========================================
# 3. GET 21 INPUTS
# ==========================================

input_data = {}

for feature in features:

    while True:

        try:

            value = float(
                input(f"Enter {feature}: ")
            )

            input_data[feature] = value

            break

        except ValueError:

            print("Please enter a numeric value.")


# ==========================================
# 4. CREATE DATAFRAME
# ==========================================

input_df = pd.DataFrame(
    [input_data]
)


# Make sure the order is exactly
# the same as during training

input_df = input_df[features]


# ==========================================
# 5. PREDICT CLASS
# ==========================================

prediction = model.predict(
    input_df
)[0]


# ==========================================
# 6. PREDICT PROBABILITY
# ==========================================

defect_probability = model.predict_proba(
    input_df
)[0][1]


# ==========================================
# 7. RISK SCORE
# ==========================================

risk_score = defect_probability * 100


# ==========================================
# 8. RISK LEVEL
# ==========================================

if risk_score < 30:

    risk_level = "LOW"

elif risk_score < 70:

    risk_level = "MEDIUM"

else:

    risk_level = "HIGH"


# ==========================================
# 9. CONVERT PREDICTION TO TEXT
# ==========================================

if prediction == 1:

    prediction_text = "DEFECT"

else:

    prediction_text = "NO DEFECT"


# ==========================================
# 10. DISPLAY RESULT
# ==========================================

print("\n==========================================")
print("PREDICTION RESULT")
print("==========================================")

print(
    f"Predicted Class    : {prediction_text}"
)

print(
    f"Defect Probability : {defect_probability:.4f}"
)

print(
    f"Defect Probability : {defect_probability * 100:.2f}%"
)

print(
    f"Risk Score         : {risk_score:.2f}/100"
)

print(
    f"Risk Level         : {risk_level}"
)

print("==========================================")