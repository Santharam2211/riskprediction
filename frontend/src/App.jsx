import { useState } from 'react'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'
import CanaryForm from './components/CanaryForm'
import CanaryResultCard from './components/CanaryResultCard'

export default function App() {
  const [activeTab, setActiveTab] = useState('defect') // 'defect' or 'canary'
  
  const [defectResult, setDefectResult] = useState(null)
  const [defectLoading, setDefectLoading] = useState(false)

  const [canaryResult, setCanaryResult] = useState(null)
  const [canaryLoading, setCanaryLoading] = useState(false)

  return (
    <div className="app-shell">
      {/* Ambient background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <Header />

      <main className="main-content">
        {/* Tab Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '12px', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('defect')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'defect' ? '#6366f1' : 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Defect Predictor
            </button>
            <button 
              onClick={() => setActiveTab('canary')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'canary' ? '#6366f1' : 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Canary Guardrail Agent
            </button>
          </div>
        </div>

        {activeTab === 'defect' && (
          <>
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
            </section>

            {/* Main workspace */}
            <div className="workspace">
              <div className="workspace-left">
                <PredictionForm onResult={setDefectResult} onLoading={setDefectLoading} />
              </div>
              <div className="workspace-right">
                {(defectResult || defectLoading) ? (
                  <ResultCard result={defectResult} loading={defectLoading} />
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
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'canary' && (
          <>
            {/* Hero section */}
            <section className="hero-section">
              <div className="hero-tag">Powered by Meta Llama 3.1</div>
              <h2 className="hero-title">
                Canary Deployment Guardrail<br />
                <span className="hero-gradient">AI SRE Agent</span>
              </h2>
              <p className="hero-desc">
                Provide live deployment metrics and our AI Agent will assess system health,
                enforce safety guardrails, and explain its scaling decisions in real-time.
              </p>
            </section>

            {/* Main workspace */}
            <div className="workspace">
              <div className="workspace-left">
                <CanaryForm onResult={setCanaryResult} onLoading={setCanaryLoading} />
              </div>
              <div className="workspace-right">
                {(canaryResult || canaryLoading) ? (
                  <CanaryResultCard result={canaryResult} loading={canaryLoading} />
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
                    <h3 className="placeholder-title">Agent Standby</h3>
                    <p className="placeholder-desc">
                      Provide the error rate, latency, and saturation, and the AI will determine if the deployment should proceed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </main>

      <footer className="footer">
        <p>CognitiveMinds · AI-Powered SRE & Defect Prediction Suite</p>
      </footer>
    </div>
  )
}
