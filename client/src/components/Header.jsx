function Header({ onNewApplication, onViewHistory, currentView }) {
  return (
    <header className="app-header" id="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">V</div>
          <div>
            <div className="header-title">Vitto Lending</div>
            <div className="header-subtitle">MSME Credit Decision System</div>
          </div>
        </div>
        <nav className="header-nav" aria-label="Main navigation">
          <button
            id="nav-apply"
            className={`header-nav-btn ${currentView === 'form' || currentView === 'result' ? 'active' : ''}`}
            onClick={onNewApplication}
          >
            Apply
          </button>
          <button
            id="nav-history"
            className={`header-nav-btn ${currentView === 'history' ? 'active' : ''}`}
            onClick={onViewHistory}
          >
            History
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
