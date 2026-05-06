import { useState } from 'react'
import Header from './components/Header'
import ApplicationForm from './components/ApplicationForm'
import DecisionResult from './components/DecisionResult'
import ApplicationHistory from './components/ApplicationHistory'
import { submitApplication } from './services/api'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('form') // 'form' | 'result' | 'history'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      const data = await submitApplication(formData)
      setResult(data)
      setCurrentView('result')
    } catch (err) {
      setError({
        message: err.message,
        details: err.details || [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewApplication = () => {
    setResult(null)
    setError(null)
    setCurrentView('form')
  }

  const handleViewHistory = () => {
    setCurrentView('history')
  }

  return (
    <div className="app">
      <Header
        onNewApplication={handleNewApplication}
        onViewHistory={handleViewHistory}
        currentView={currentView}
      />
      <main className="main-content">
        <div className="container">
          {currentView === 'form' && (
            <ApplicationForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              onClearError={() => setError(null)}
            />
          )}
          {currentView === 'result' && result && (
            <DecisionResult
              result={result}
              onNewApplication={handleNewApplication}
            />
          )}
          {currentView === 'history' && (
            <ApplicationHistory onBack={handleNewApplication} />
          )}
        </div>
      </main>
      <footer className="app-footer">
        <p>Vitto Lending Decision System &middot; MSME Credit Assessment</p>
      </footer>
    </div>
  )
}

export default App
