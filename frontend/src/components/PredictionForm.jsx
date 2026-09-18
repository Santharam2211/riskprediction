import { useState, useEffect } from 'react'

// JM1 feature metadata — descriptions and typical value ranges
const FEATURE_META = {
  'loc':              { label: 'Lines of Code',               unit: 'lines',   placeholder: '150',   tip: 'Total lines of code in the module' },
  'v(g)':             { label: 'Cyclomatic Complexity',       unit: '',        placeholder: '10',    tip: 'Number of linearly independent paths (McCabe)' },
  'ev(g)':            { label: 'Essential Complexity',        unit: '',        placeholder: '5',     tip: 'Measures unstructured complexity after reduction' },
  'iv(g)':            { label: 'Design Complexity',           unit: '',        placeholder: '8',     tip: 'Complexity of the module\'s calling patterns' },
  'n':                { label: 'Halstead Length (N)',         unit: '',        placeholder: '500',   tip: 'Total count of operators and operands' },
  'v':                { label: 'Halstead Volume',             unit: 'bits',    placeholder: '1200',  tip: 'Program size measured in bits' },
  'l':                { label: 'Program Level',               unit: '',        placeholder: '0.05',  tip: 'Halstead abstraction level (0–1)' },
  'd':                { label: 'Halstead Difficulty',         unit: '',        placeholder: '40',    tip: 'How hard the program is to understand' },
  'i':                { label: 'Halstead Intelligence',       unit: '',        placeholder: '30',    tip: 'Pure algorithm size (inverse of difficulty)' },
  'e':                { label: 'Halstead Effort',             unit: '',        placeholder: '48000', tip: 'Mental effort required to implement' },
  'b':                { label: 'Bug Estimate (Halstead)',     unit: '',        placeholder: '0.4',   tip: 'Estimated number of bugs: V/3000' },
  't':                { label: 'Time to Implement',           unit: 'sec',     placeholder: '2666',  tip: 'Estimated coding time in seconds' },
  'lOCode':           { label: 'Executable Code Lines',      unit: 'lines',   placeholder: '90',    tip: 'Lines containing actual executable code' },
  'lOComment':        { label: 'Comment Lines',              unit: 'lines',   placeholder: '30',    tip: 'Lines containing only comments' },
  'lOBlank':          { label: 'Blank Lines',                unit: 'lines',   placeholder: '20',    tip: 'Empty lines in the module' },
  'lOCodeAndComment': { label: 'Code + Comment Lines',       unit: 'lines',   placeholder: '10',    tip: 'Lines mixing code and inline comments' },
  'uniq_Op':          { label: 'Unique Operators',           unit: '',        placeholder: '17',    tip: 'Number of distinct operators used' },
  'uniq_Opnd':        { label: 'Unique Operands',            unit: '',        placeholder: '30',    tip: 'Number of distinct operands used' },
  'total_Op':         { label: 'Total Operators',            unit: '',        placeholder: '120',   tip: 'Total count of all operators' },
  'total_Opnd':       { label: 'Total Operands',             unit: '',        placeholder: '100',   tip: 'Total count of all operands' },
  'branchCount':      { label: 'Branch Count',               unit: '',        placeholder: '18',    tip: 'Number of branches (if/else/loop/case)' },
}

export default function PredictionForm({ onResult, onLoading }) {
  const [features, setFeatures] = useState([])
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [fetchError, setFetchError] = useState(null)
  const [activeTooltip, setActiveTooltip] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

  // Load feature list from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/features`)
      .then(r => r.json())
      .then(data => {
        setFeatures(data.features)
        // Initialize all values to empty
        const init = {}
        data.features.forEach(f => { init[f.name] = '' })
        setValues(init)
      })
      .catch(() => {
        // Fallback to hardcoded list if backend not reachable
        const fallback = Object.keys(FEATURE_META)
        setFeatures(fallback.map(k => ({ name: k, description: FEATURE_META[k]?.label || k })))
        const init = {}
        fallback.forEach(k => { init[k] = '' })
        setValues(init)
        setFetchError('Could not reach backend — using local feature list.')
      })
  }, [])

  const handleChange = (name, val) => {
    setValues(prev => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }))
  }

  const validate = () => {
    const newErrors = {}
    features.forEach(f => {
      const v = values[f.name ?? f]
      if (v === '' || v === undefined || isNaN(Number(v))) {
        newErrors[f.name ?? f] = true
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

    const payload = {}
    features.forEach(f => {
      const key = f.name ?? f
      payload[key] = parseFloat(values[key])
    })

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: payload }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Prediction failed')
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
    const demo = {}
    features.forEach(f => {
      const key = f.name ?? f
      demo[key] = FEATURE_META[key]?.placeholder || '0'
    })
    setValues(demo)
    setErrors({})
  }

  const handleReset = () => {
    const init = {}
    features.forEach(f => { init[f.name ?? f] = '' })
    setValues(init)
    setErrors({})
    onResult(null)
  }

  return (
    <div className="form-card">
      <div className="form-header">
        <div>
          <h2 className="form-title">Software Metrics Input</h2>
          <p className="form-subtitle">Enter the {features.length} code metrics to analyze defect risk</p>
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

      {fetchError && (
        <div className="alert-warning">{fetchError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="metrics-grid">
          {features.map((f) => {
            const key = f.name ?? f
            const meta = FEATURE_META[key] || {}
            const hasError = errors[key]
            return (
              <div key={key} className={`metric-field ${hasError ? 'has-error' : ''}`}>
                <div className="metric-label-row">
                  <label htmlFor={`field-${key}`} className="metric-label">
                    {meta.label || key}
                    {meta.unit && <span className="metric-unit">{meta.unit}</span>}
                  </label>
                  <button
                    type="button"
                    className="tooltip-trigger"
                    onMouseEnter={() => setActiveTooltip(key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    aria-label={`Info about ${key}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {activeTooltip === key && (
                      <div className="tooltip-box" role="tooltip">
                        <strong className="tooltip-name">{key}</strong>
                        {meta.tip || f.description}
                      </div>
                    )}
                  </button>
                </div>
                <input
                  id={`field-${key}`}
                  type="number"
                  step="any"
                  className="metric-input"
                  placeholder={meta.placeholder || '0'}
                  value={values[key] ?? ''}
                  onChange={e => handleChange(key, e.target.value)}
                  aria-invalid={hasError}
                />
                {hasError && <span className="field-error">Required numeric value</span>}
              </div>
            )
          })}
        </div>

        <div className="submit-row">
          <button type="submit" className="btn-primary" id="analyze-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
            Analyze Defect Risk
          </button>
        </div>
      </form>
    </div>
  )
}
