import os
from huggingface_hub import InferenceClient
from guardrail import check_guardrail

client = InferenceClient(
    token=os.getenv("HF_TOKEN")
)

# Canary metrics
error_rate = 1.2
latency_p99 = 550
saturation = 72

# Safety guardrail decides the allowed action
guardrail_decision = check_guardrail(
    error_rate,
    latency_p99,
    saturation
)

print("Guardrail:", guardrail_decision)

# Ask Hugging Face to explain the decision
metrics = f"""
You are a Canary Deployment SRE Agent.

Canary metrics:
Error rate: {error_rate}%
Latency P99: {latency_p99} ms
Saturation: {saturation}%

The safety guardrail has determined:
{guardrail_decision}

Your job is ONLY to explain this decision.

Do not change the decision.

Return exactly:

Decision: {guardrail_decision}
Reason: <short explanation>
"""

response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[
        {
            "role": "user",
            "content": metrics
        }
    ],
    max_tokens=100
)

print(response.choices[0].message.content)