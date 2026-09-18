def check_guardrail(error_rate, latency_p99, saturation):

    if error_rate > 2.0 or latency_p99 > 800 or saturation > 85:
        return "ROLLBACK"

    if error_rate > 1.0 or latency_p99 > 500 or saturation > 70:
        return "HOLD"

    return "PROMOTE"


# Test
decision = check_guardrail(
    error_rate=1.2,
    latency_p99=550,
    saturation=72
)

print("Guardrail decision:", decision)