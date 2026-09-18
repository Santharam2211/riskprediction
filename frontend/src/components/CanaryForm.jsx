import { useState } from 'react'

export default function CanaryForm({ onResult, onLoading }) {
  const [values, setValues] = useState({
    error_rate: '',
    latency_p99: '',
    saturation: ''
  })
  const [errors, setErrors] = useState({})

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

  const handleChange = (name, val) => {
    setValues(prev => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }))
  }

  const validate = () => {
    const newErrors = {}
    Object.keys(values).forEach(key => {
      const v = values[key]
      if (v === '' || v === undefined || isNaN(Number(v))) {
        newErrors[key] = true
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    onLoading(true)
    onResult(null)

    const payload = {
      error_rate: parseFloat(values.error_rate),
      latency_p99: parseFloat(values.latency_p99),
      saturation: parseFloat(values.saturation)
    }

    try {
      const res = await fetch(`${API_BASE_URL}/canary-predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Canary prediction failed')
      }
      const data = await res.json()
      onResult(data)
    } catch (err) {
      onResult({ error: err.message })
    } finally {
      onLoading(false)
    }
  }

  const handleFillDemo = () => {
    setValues({
      error_rate: '1.2',
      latency_p99: '550',
      saturation: '72'
    })
    setErrors({})
  }

  const handleReset = () => {
    setValues({
      error_rate: '',
      latency_p99: '',
      saturation: ''
    })
    setErrors({})
    onResult(null)
  }

  return (
    <div className="form-card">
      <div className="form-header">
        <div>
          <h2 className="form-title">Canary Metrics Input</h2>
          <p className="form-subtitle">Enter deployment metrics for guardrail analysis</p>
        </div>
        <div className="form-actions-top">
          <button type="button" className="btn-secondary" onClick={handleFillDemo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Demo Data
          </button>
          <button type="button" className="btn-ghost" onClick={handleReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="metrics-grid">
          <div className={`metric-field ${errors.error_rate ? 'has-error' : ''}`}>
            <label className="metric-label">Error Rate <span className="metric-unit">%</span></label>
            <input type="number" step="any" className="metric-input" placeholder="1.2" value={values.error_rate} onChange={e => handleChange('error_rate', e.target.value)} />
          </div>
          
          <div className={`metric-field ${errors.latency_p99 ? 'has-error' : ''}`}>
            <label className="metric-label">Latency P99 <span className="metric-unit">ms</span></label>
            <input type="number" step="any" className="metric-input" placeholder="550" value={values.latency_p99} onChange={e => handleChange('latency_p99', e.target.value)} />
          </div>
          
          <div className={`metric-field ${errors.saturation ? 'has-error' : ''}`}>
            <label className="metric-label">Saturation <span className="metric-unit">%</span></label>
            <input type="number" step="any" className="metric-input" placeholder="72" value={values.saturation} onChange={e => handleChange('saturation', e.target.value)} />
          </div>
        </div>

        <div className="submit-row">
          <button type="submit" className="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
            Check Guardrails
          </button>
        </div>
      </form>
    </div>
  )
}
