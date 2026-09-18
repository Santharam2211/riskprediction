export default function CanaryResultCard({ result, loading }) {
  if (loading) {
    return (
      <div className="result-card loading-card">
        <div className="spinner"></div>
        <h3 className="loading-title">Analyzing Deployment Metrics...</h3>
        <p className="loading-desc">Checking guardrails and querying AI agent...</p>
      </div>
    )
  }

  if (result?.error) {
    return (
      <div className="result-card error-card">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Analysis Failed</h3>
        <p className="error-desc">{result.error}</p>
      </div>
    )
  }

  if (!result) return null;

  const decision = result.decision;
  let statusClass = "status-medium"; // Default HOLD
  let emoji = "🟡";

  if (decision === "PROMOTE") {
    statusClass = "status-low"; // Greenish
    emoji = "🟢";
  } else if (decision === "ROLLBACK") {
    statusClass = "status-high"; // Reddish
    emoji = "🔴";
  }

  return (
    <div className="result-card fade-in">
      <div className="result-header">
        <h3 className="result-title">Guardrail Analysis Complete</h3>
        <div className="result-badge">AI Confirmed</div>
      </div>

      <div className={`score-display ${statusClass}`}>
        <div className="score-value">{emoji} {decision}</div>
        <div className="score-label">Deployment Decision</div>
      </div>

      <div className="prediction-details">
        <div className="detail-row">
          <span className="detail-label">AI Agent Explanation:</span>
        </div>
        <div className="detail-row" style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
          {result.explanation}
        </div>
      </div>
    </div>
  )
}
