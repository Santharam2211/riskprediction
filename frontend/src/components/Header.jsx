export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
              <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="5" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="logo-title">CognitiveMinds</h1>
            <p className="logo-sub">Software Defect Risk Intelligence</p>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-dot" />
          AI Model Active
        </div>
      </div>
    </header>
  )
}
