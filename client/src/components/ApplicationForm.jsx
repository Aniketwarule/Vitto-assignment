import { useState } from 'react'

const STEPS = [
  { label: 'Business Profile', key: 'profile' },
  { label: 'Loan Details', key: 'loan' },
  { label: 'Review', key: 'review' },
]

const BUSINESS_TYPES = [
  { value: '', label: 'Select business type' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
]

const INITIAL_FORM = {
  ownerName: '',
  pan: '',
  businessType: '',
  monthlyRevenue: '',
  loanAmount: '',
  tenure: '',
  purpose: '',
}

function ApplicationForm({ onSubmit, loading, error, onClearError }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (error) onClearError()
  }

  const validateStep = (stepIndex) => {
    const errors = {}

    if (stepIndex === 0) {
      if (!form.ownerName.trim() || form.ownerName.trim().length < 2)
        errors.ownerName = 'Enter owner name (min 2 chars)'
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
      if (!form.pan.trim())
        errors.pan = 'PAN is required'
      else if (!panRegex.test(form.pan.toUpperCase()))
        errors.pan = 'Invalid PAN format (e.g. ABCDE1234F)'
      if (!form.businessType)
        errors.businessType = 'Select a business type'
      if (!form.monthlyRevenue)
        errors.monthlyRevenue = 'Revenue is required'
      else if (Number(form.monthlyRevenue) <= 0)
        errors.monthlyRevenue = 'Revenue must be positive'
    }

    if (stepIndex === 1) {
      if (!form.loanAmount)
        errors.loanAmount = 'Loan amount is required'
      else if (Number(form.loanAmount) < 10000)
        errors.loanAmount = 'Minimum ₹10,000'
      else if (Number(form.loanAmount) > 50000000)
        errors.loanAmount = 'Maximum ₹5 Cr'
      if (!form.tenure)
        errors.tenure = 'Tenure is required'
      else if (Number(form.tenure) < 1 || Number(form.tenure) > 84)
        errors.tenure = 'Between 1-84 months'
      if (!form.purpose.trim() || form.purpose.trim().length < 3)
        errors.purpose = 'Purpose is required (min 3 chars)'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = () => {
    onSubmit({
      businessProfile: {
        ownerName: form.ownerName.trim(),
        pan: form.pan.toUpperCase().trim(),
        businessType: form.businessType,
        monthlyRevenue: Number(form.monthlyRevenue),
      },
      loanDetails: {
        amount: Number(form.loanAmount),
        tenure: Number(form.tenure),
        purpose: form.purpose.trim(),
      },
    })
  }

  const formatCurrency = (val) => {
    if (!val) return '—'
    return '₹' + Number(val).toLocaleString('en-IN')
  }

  return (
    <div className="card" id="application-form">
      {/* Step Indicator */}
      <div className="step-indicator" role="navigation" aria-label="Form steps">
        {STEPS.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div className={`step-divider ${i <= step ? 'completed' : ''}`} />
            )}
            <div className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
              <div className="step-number">
                {i < step ? '✓' : i + 1}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card-body">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" role="alert" id="form-error">
            <span>⚠</span>
            <div className="alert-body">
              <strong>{error.message}</strong>
              {error.details && error.details.length > 0 && (
                <ul>
                  {error.details.map((d, i) => (
                    <li key={i}>{d.field}: {d.message}</li>
                  ))}
                </ul>
              )}
            </div>
            <button className="alert-close" onClick={onClearError} aria-label="Dismiss">&times;</button>
          </div>
        )}

        {/* Step 1: Business Profile */}
        {step === 0 && (
          <div id="step-business-profile">
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: 'var(--space-1)' }}>
              Business Profile
            </h2>
            <p style={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
              Tell us about your business
            </p>

            <div className="form-group">
              <label htmlFor="ownerName" className="form-label">
                Owner Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                className={`form-input ${fieldErrors.ownerName ? 'error' : ''}`}
                placeholder="e.g. Rajesh Kumar"
                value={form.ownerName}
                onChange={e => updateField('ownerName', e.target.value)}
              />
              {fieldErrors.ownerName && <div className="form-error">{fieldErrors.ownerName}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pan" className="form-label">
                  PAN Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="pan"
                  className={`form-input ${fieldErrors.pan ? 'error' : ''}`}
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={e => updateField('pan', e.target.value.toUpperCase())}
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
                {fieldErrors.pan && <div className="form-error">{fieldErrors.pan}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="businessType" className="form-label">
                  Business Type <span className="required">*</span>
                </label>
                <select
                  id="businessType"
                  className={`form-select ${fieldErrors.businessType ? 'error' : ''}`}
                  value={form.businessType}
                  onChange={e => updateField('businessType', e.target.value)}
                >
                  {BUSINESS_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {fieldErrors.businessType && <div className="form-error">{fieldErrors.businessType}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="monthlyRevenue" className="form-label">
                Monthly Revenue <span className="required">*</span>
              </label>
              <div className="input-prefix">
                <span className="prefix">₹</span>
                <input
                  type="number"
                  id="monthlyRevenue"
                  className={`form-input ${fieldErrors.monthlyRevenue ? 'error' : ''}`}
                  placeholder="e.g. 500000"
                  value={form.monthlyRevenue}
                  onChange={e => updateField('monthlyRevenue', e.target.value)}
                  min="0"
                />
              </div>
              {fieldErrors.monthlyRevenue && <div className="form-error">{fieldErrors.monthlyRevenue}</div>}
              <div className="form-hint">Average monthly revenue of your business</div>
            </div>

            <div className="form-actions">
              <div></div>
              <button className="btn btn-primary" id="btn-next-1" onClick={handleNext}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Loan Details */}
        {step === 1 && (
          <div id="step-loan-details">
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: 'var(--space-1)' }}>
              Loan Details
            </h2>
            <p style={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
              How much do you need?
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="loanAmount" className="form-label">
                  Loan Amount <span className="required">*</span>
                </label>
                <div className="input-prefix">
                  <span className="prefix">₹</span>
                  <input
                    type="number"
                    id="loanAmount"
                    className={`form-input ${fieldErrors.loanAmount ? 'error' : ''}`}
                    placeholder="e.g. 1000000"
                    value={form.loanAmount}
                    onChange={e => updateField('loanAmount', e.target.value)}
                    min="10000"
                    max="50000000"
                  />
                </div>
                {fieldErrors.loanAmount && <div className="form-error">{fieldErrors.loanAmount}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="tenure" className="form-label">
                  Tenure (months) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="tenure"
                  className={`form-input ${fieldErrors.tenure ? 'error' : ''}`}
                  placeholder="e.g. 24"
                  value={form.tenure}
                  onChange={e => updateField('tenure', e.target.value)}
                  min="1"
                  max="84"
                />
                {fieldErrors.tenure && <div className="form-error">{fieldErrors.tenure}</div>}
                <div className="form-hint">1 – 84 months</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="purpose" className="form-label">
                Purpose of Loan <span className="required">*</span>
              </label>
              <textarea
                id="purpose"
                className={`form-textarea ${fieldErrors.purpose ? 'error' : ''}`}
                placeholder="e.g. Purchase raw materials for upcoming festive season orders"
                value={form.purpose}
                onChange={e => updateField('purpose', e.target.value)}
                rows={3}
              />
              {fieldErrors.purpose && <div className="form-error">{fieldErrors.purpose}</div>}
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" id="btn-back-1" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn btn-primary" id="btn-next-2" onClick={handleNext}>
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 2 && (
          <div id="step-review">
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: 'var(--space-1)' }}>
              Review Application
            </h2>
            <p style={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
              Confirm your details before submitting
            </p>

            <div className="review-section">
              <h3>Business Profile</h3>
              <div className="review-row">
                <span className="label">Owner Name</span>
                <span className="value">{form.ownerName}</span>
              </div>
              <div className="review-row">
                <span className="label">PAN</span>
                <span className="value">{form.pan}</span>
              </div>
              <div className="review-row">
                <span className="label">Business Type</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{form.businessType}</span>
              </div>
              <div className="review-row">
                <span className="label">Monthly Revenue</span>
                <span className="value">{formatCurrency(form.monthlyRevenue)}</span>
              </div>
            </div>

            <div className="review-section">
              <h3>Loan Details</h3>
              <div className="review-row">
                <span className="label">Loan Amount</span>
                <span className="value">{formatCurrency(form.loanAmount)}</span>
              </div>
              <div className="review-row">
                <span className="label">Tenure</span>
                <span className="value">{form.tenure} months</span>
              </div>
              <div className="review-row">
                <span className="label">Purpose</span>
                <span className="value">{form.purpose}</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" id="btn-back-2" onClick={handleBack} disabled={loading}>
                ← Back
              </button>
              <button className="btn btn-primary btn-lg" id="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing…
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationForm
