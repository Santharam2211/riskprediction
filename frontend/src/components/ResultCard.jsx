import { useEffect, useRef } from 'react'

const LEVEL_CONFIG = {
  LOW:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    glow: 'rgba(34,197,94,0.3)',   icon: '🛡️', label: 'Low Risk' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   glow: 'rgba(245,158,11,0.3)',  icon: '⚠️', label: 'Medium Risk' },
  HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    glow: 'rgba(239,68,68,0.3)',   icon: '🔴', label: 'High Risk' },
}

function GaugeRing({ score, color }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38
    const strokeW = size * 0.08

    ctx.clearRect(0, 0, size, size)

    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = strokeW
    ctx.lineCap = 'round'
    ctx.stroke()

    // Progress ring
    const pct = score / 100
    const startAngle = Math.PI * 0.75
    const endAngle = startAngle + pct * Math.PI * 1.5

    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, color + 'aa')
    grad.addColorStop(1, color)

    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = grad
    ctx.lineWidth = strokeW
    ctx.lineCap = 'round'
    ctx.stroke()
  }, [score, color])

  return <canvas ref={canvasRef} width={200} height={200} className="gauge-canvas" />
}

export default function ResultCard({ result, loading }) {
  if (loading) {
    return (
      <div className="result-card loading-card">
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p className="loading-text">Analyzing code metrics…</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  if (result.error) {
    return (
      <div className="result-card error-card">
        <div className="error-icon">⚠</div>
        <h3 className="error-title">Prediction Failed</h3>
        <p className="error-msg">{result.error}</p>
      </div>
    )
  }

  const cfg = LEVEL_CONFIG[result.risk_level] || LEVEL_CONFIG.LOW
  const isDefect = result.prediction === 'DEFECT'

  return (
    <div className="result-card" style={{ '--accent': cfg.color, '--accent-bg': cfg.bg, '--accent-glow': cfg.glow }}>
      <div className="result-header">
        <h2 className="result-title">Analysis Complete</h2>
        <span className="result-badge" style={{ background: cfg.bg, color: cfg.color, boxShadow: `0 0 16px ${cfg.glow}` }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div className="gauge-section">
        <div className="gauge-wrapper">
          <GaugeRing score={result.risk_score} color={cfg.color} />
          <div className="gauge-center">
            <span className="gauge-score" style={{ color: cfg.color }}>{result.risk_score.toFixed(0)}</span>
            <span className="gauge-unit">/ 100</span>
          </div>
        </div>
        <div className="gauge-meta">
          <div className="prediction-chip" style={{ background: isDefect ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: isDefect ? '#ef4444' : '#22c55e' }}>
            {isDefect ? '🐛 DEFECT PREDICTED' : '✅ NO DEFECT'}
          </div>
          <p className="gauge-desc">
            {result.risk_level === 'LOW' && 'This module shows low defect probability. Code quality looks good.'}
            {result.risk_level === 'MEDIUM' && 'This module has moderate defect risk. Consider a thorough code review.'}
            {result.risk_level === 'HIGH' && 'High defect risk detected! Prioritize testing and refactoring.'}
          </p>
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-stat">
          <span className="stat-label">Defect Probability</span>
          <span className="stat-value" style={{ color: cfg.color }}>
            {(result.defect_probability * 100).toFixed(2)}%
          </span>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width: `${result.defect_probability * 100}%`, background: cfg.color }} />
          </div>
        </div>
        <div className="metric-stat">
          <span className="stat-label">Risk Score</span>
          <span className="stat-value" style={{ color: cfg.color }}>{result.risk_score.toFixed(1)}<small>/100</small></span>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width: `${result.risk_score}%`, background: cfg.color }} />
          </div>
        </div>
        <div className="metric-stat">
          <span className="stat-label">Risk Level</span>
          <span className="stat-value" style={{ color: cfg.color }}>{result.risk_level}</span>
          <div className="risk-segments">
            <div className={`seg ${result.risk_level !== 'LOW' ? '' : 'active'}`} style={{ background: result.risk_level === 'LOW' ? '#22c55e' : 'rgba(255,255,255,0.08)' }} />
            <div className={`seg ${result.risk_level === 'MEDIUM' ? 'active' : ''}`} style={{ background: result.risk_level === 'MEDIUM' ? '#f59e0b' : 'rgba(255,255,255,0.08)' }} />
            <div className={`seg ${result.risk_level === 'HIGH' ? 'active' : ''}`} style={{ background: result.risk_level === 'HIGH' ? '#ef4444' : 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </div>

      <div className="threshold-guide">
        <span className="tg-item tg-low">🟢 LOW (&lt;30)</span>
        <span className="tg-item tg-med">🟡 MEDIUM (30–70)</span>
        <span className="tg-item tg-high">🔴 HIGH (&gt;70)</span>
      </div>
    </div>
  )
}
