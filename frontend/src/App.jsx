import { useState } from 'react'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="app-shell">
      {/* Ambient background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <Header />

      <main className="main-content">
        {/* Hero section */}
        <section className="hero-section">
          <div className="hero-tag">Powered by LightGBM · NASA JM1 Dataset</div>
          <h2 className="hero-title">
            Predict Software Defects<br />
            <span className="hero-gradient">Before They Ship</span>
          </h2>
          <p className="hero-desc">
            Enter 21 software code metrics and our AI model will predict the probability
            of defects in your module — helping you prioritize testing and reviews.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">21</span>
              <span className="stat-lbl">Metrics</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">3</span>
              <span className="stat-lbl">Risk Levels</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">LightGBM</span>
              <span className="stat-lbl">Model</span>
            </div>
          </div>
        </section>

        {/* Main workspace */}
        <div className="workspace">
          <div className="workspace-left">
            <PredictionForm onResult={setResult} onLoading={setLoading} />
          </div>
          <div className="workspace-right">
            {(result || loading) ? (
              <ResultCard result={result} loading={loading} />
            ) : (
              <div className="placeholder-card">
                <div className="placeholder-icon">
                  <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                    <circle cx="40" cy="40" r="36" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx="40" cy="40" r="24" stroke="rgba(99,102,241,0.2)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="10" fill="rgba(99,102,241,0.2)" />
                    <circle cx="40" cy="40" r="4" fill="#6366f1" />
                  </svg>
                </div>
                <h3 className="placeholder-title">Awaiting Analysis</h3>
                <p className="placeholder-desc">
                  Fill in the software metrics on the left and click <strong>Analyze Defect Risk</strong> to see your prediction here.
                </p>
                <div className="placeholder-hints">
                  <span className="hint-chip">💡 Use "Demo Data" to try a sample</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>CognitiveMinds · Built with FastAPI + React · Model trained on NASA JM1 Dataset</p>
      </footer>
    </div>
  )
}
