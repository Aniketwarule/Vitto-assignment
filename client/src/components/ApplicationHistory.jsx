import { useState, useEffect } from 'react'
import { listApplications } from '../services/api'

function ApplicationHistory({ onBack }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await listApplications()
      setApplications(data.applications || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN')

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="history-empty">
        <div className="spinner" style={{ margin: '0 auto', color: 'var(--color-primary)' }}></div>
        <p>Loading applications…</p>
      </div>
    )
  }

  return (
    <div id="application-history">
      <div className="history-header">
        <h2>Application History</h2>
        <button className="btn btn-secondary" onClick={onBack}>← New Application</button>
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <div className="history-empty">
            <p style={{ fontSize: 'var(--font-2xl)' }}>📋</p>
            <p>No applications yet. Submit your first one!</p>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {applications.map(app => (
            <div key={app.id} className="history-item">
              <div className="history-item-info">
                <h4>{app.businessProfile.ownerName}</h4>
                <p>
                  {formatCurrency(app.loanDetails.amount)} &middot;{' '}
                  {app.loanDetails.tenure} months &middot;{' '}
                  {formatDate(app.createdAt)}
                </p>
              </div>
              <div className="history-item-right">
                <span className={`status-badge ${app.decision.decision === 'APPROVED' ? 'approved' : 'rejected'}`}>
                  {app.decision.decision === 'APPROVED' ? 'Approved' : 'Rejected'}
                </span>
                <span className="history-score">Score: {app.decision.creditScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationHistory
