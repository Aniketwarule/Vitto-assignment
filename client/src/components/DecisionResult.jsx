function DecisionResult({ result, onNewApplication }) {
  const { decision, businessProfile, loanDetails } = result
  const isApproved = decision.decision === 'APPROVED'
  const score = decision.creditScore
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (score / 100) * circumference

  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN')

  const getScoreColor = (s) => {
    if (s >= 75) return 'var(--color-success)'
    if (s >= 60) return '#2563EB'
    if (s >= 40) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  return (
    <div className="card" id="decision-result">
      {/* Status Banner */}
      <div className="result-status">
        <div className={`result-icon ${isApproved ? 'approved' : 'rejected'}`}>
          {isApproved ? '✓' : '✕'}
        </div>
        <div className={`result-decision ${isApproved ? 'approved' : 'rejected'}`}>
          {isApproved ? 'Approved' : 'Rejected'}
        </div>
        <div className="result-subtitle">
          Application for {businessProfile.ownerName} &middot; {formatCurrency(loanDetails.amount)}
        </div>
      </div>

      {/* Credit Score */}
      <div className="score-section">
        <div className="score-gauge">
          <div className="score-circle">
            <svg viewBox="0 0 80 80">
              <circle className="bg" cx="40" cy="40" r="38" />
              <circle
                className="progress"
                cx="40" cy="40" r="38"
                stroke={getScoreColor(score)}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-info">
            <h3>Credit Score</h3>
            <p>
              {score >= 75 ? 'Excellent — strong application' :
               score >= 60 ? 'Good — meets lending criteria' :
               score >= 40 ? 'Below threshold — some risk factors' :
               'High risk — multiple concerns identified'}
            </p>
          </div>
        </div>

        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-label">Revenue-to-EMI</div>
            <div className="breakdown-value">{decision.breakdown.revenueToEmiScore}/30</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">Loan-to-Revenue</div>
            <div className="breakdown-value">{decision.breakdown.loanToRevenueScore}/25</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">Tenure Risk</div>
            <div className="breakdown-value">{decision.breakdown.tenureRiskScore}/15</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">Business Type</div>
            <div className="breakdown-value">{decision.breakdown.businessTypeScore}/15</div>
          </div>
        </div>
      </div>

      {/* Reason Codes */}
      {decision.reasons.length > 0 && (
        <div className="reasons-section">
          <h3>Reason Codes</h3>
          <div>
            {decision.reasons.map((reason, i) => (
              <span key={i} className="reason-tag">{reason}</span>
            ))}
          </div>
        </div>
      )}

      {/* Financial Details */}
      <div className="details-section">
        <h3>Financial Summary</h3>
        <div className="details-grid">
          <div className="detail-item">
            <div className="label">Est. EMI</div>
            <div className="value">{formatCurrency(decision.details.estimatedEMI)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Revenue / EMI</div>
            <div className="value">{decision.details.revenueToEmiRatio}x</div>
          </div>
          <div className="detail-item">
            <div className="label">Loan / Revenue</div>
            <div className="value">{decision.details.loanToRevenueRatio}x</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="btn btn-primary" id="btn-new-application" onClick={onNewApplication}>
          New Application
        </button>
      </div>
    </div>
  )
}

export default DecisionResult
