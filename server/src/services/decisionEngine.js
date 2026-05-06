const config = require('../config');

/**
 * MSME Credit Decision Engine
 * 
 * Scoring Model (0–100 scale):
 * ┌─────────────────────────────┬────────┐
 * │ Signal                      │ Weight │
 * ├─────────────────────────────┼────────┤
 * │ Revenue-to-EMI Ratio        │ 30 pts │
 * │ Loan-to-Revenue Multiple    │ 25 pts │
 * │ Tenure Risk                 │ 15 pts │
 * │ Business Type               │ 15 pts │
 * │ Revenue Level               │ 15 pts │
 * │ Fraud / Consistency Checks  │ -20 ea │
 * └─────────────────────────────┴────────┘
 * 
 * Decision threshold: score >= 60 → APPROVED, else REJECTED
 * 
 * Assumptions:
 * - Default interest rate: 12% p.a. (1% monthly) — typical MSME unsecured lending rate
 * - EMI calculated using standard reducing balance formula
 * - Business type risk ordering: manufacturing > services > retail > agriculture > other
 * - Loan-to-revenue ratio > 10x is considered high risk
 * - Tenure sweet spot: 6–36 months
 */

/**
 * Calculate EMI using standard reducing balance formula
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Score the Revenue-to-EMI ratio (0–30 points)
 * Higher ratio = borrower can comfortably service the loan
 */
function scoreRevenueToEMI(ratio) {
  const reasons = [];

  let score;
  if (ratio >= 5) score = 30;
  else if (ratio >= 4) score = 25;
  else if (ratio >= 3) score = 20;
  else if (ratio >= 2) score = 10;
  else {
    score = 0;
    reasons.push('LOW_REVENUE_TO_EMI');
  }

  return { score, reasons };
}

/**
 * Score the Loan-to-Revenue multiple (0–25 points)
 * Lower multiple = safer loan relative to income
 */
function scoreLoanToRevenue(ratio) {
  const reasons = [];

  let score;
  if (ratio <= 2) score = 25;
  else if (ratio <= 4) score = 20;
  else if (ratio <= 6) score = 15;
  else if (ratio <= 10) score = 5;
  else {
    score = 0;
    reasons.push('HIGH_LOAN_RATIO');
  }

  return { score, reasons };
}

/**
 * Score tenure risk (0–15 points)
 * Very short or very long tenures carry more risk
 */
function scoreTenureRisk(tenureMonths) {
  const reasons = [];

  let score;
  if (tenureMonths >= 6 && tenureMonths <= 36) {
    score = 15;
  } else if (tenureMonths >= 3 && tenureMonths <= 48) {
    score = 10;
  } else if (tenureMonths < 3) {
    score = 0;
    reasons.push('TENURE_TOO_SHORT');
  } else {
    score = 5;
    reasons.push('TENURE_TOO_LONG');
  }

  return { score, reasons };
}

/**
 * Score based on business type (0–15 points)
 * Manufacturing and services are considered lower risk for MSME lending
 */
function scoreBusinessType(type) {
  const scores = {
    manufacturing: 15,
    services: 12,
    retail: 10,
    agriculture: 8,
    other: 5,
  };

  return { score: scores[type] || 5, reasons: [] };
}

/**
 * Score based on absolute revenue level (0–15 points)
 */
function scoreRevenueLevel(monthlyRevenue) {
  const reasons = [];

  let score;
  if (monthlyRevenue >= 500000) score = 15;
  else if (monthlyRevenue >= 200000) score = 12;
  else if (monthlyRevenue >= 100000) score = 8;
  else if (monthlyRevenue >= 50000) score = 5;
  else {
    score = 2;
    reasons.push('LOW_REVENUE');
  }

  return { score, reasons };
}

/**
 * Fraud and consistency checks (penalty-based)
 * Each flag deducts from the total score
 */
function checkConsistency(businessProfile, loanDetails) {
  const reasons = [];
  let penalty = 0;

  // Flag: Loan amount wildly disproportionate to revenue
  if (loanDetails.amount > 50 * businessProfile.monthlyRevenue) {
    penalty += 20;
    reasons.push('DATA_INCONSISTENCY');
  }

  // Flag: Very low revenue with high loan request
  if (businessProfile.monthlyRevenue < 10000 && loanDetails.amount > 500000) {
    penalty += 15;
    reasons.push('SUSPICIOUS_LOAN_AMOUNT');
  }

  // Flag: Negative or zero values (shouldn't pass validation, but defense-in-depth)
  if (businessProfile.monthlyRevenue <= 0 || loanDetails.amount <= 0) {
    penalty += 25;
    reasons.push('INVALID_FINANCIAL_DATA');
  }

  return { penalty, reasons };
}

/**
 * Main decision engine — evaluates a loan application
 * 
 * @param {Object} businessProfile - { ownerName, pan, businessType, monthlyRevenue }
 * @param {Object} loanDetails - { amount, tenure, purpose }
 * @returns {Object} - { decision, creditScore, reasons, breakdown }
 */
function evaluate(businessProfile, loanDetails) {
  const annualRate = config.defaultAnnualInterestRate;
  const emi = calculateEMI(loanDetails.amount, annualRate, loanDetails.tenure);

  const revenueToEmi = businessProfile.monthlyRevenue / emi;
  const loanToRevenue = loanDetails.amount / businessProfile.monthlyRevenue;

  // Calculate individual scores
  const revenueEmiResult = scoreRevenueToEMI(revenueToEmi);
  const loanRevResult = scoreLoanToRevenue(loanToRevenue);
  const tenureResult = scoreTenureRisk(loanDetails.tenure);
  const businessResult = scoreBusinessType(businessProfile.businessType);
  const revenueLevelResult = scoreRevenueLevel(businessProfile.monthlyRevenue);
  const consistencyResult = checkConsistency(businessProfile, loanDetails);

  // Sum up
  let totalScore =
    revenueEmiResult.score +
    loanRevResult.score +
    tenureResult.score +
    businessResult.score +
    revenueLevelResult.score -
    consistencyResult.penalty;

  // Clamp to [0, 100]
  totalScore = Math.max(0, Math.min(100, totalScore));

  // Collect all reason codes
  const allReasons = [
    ...revenueEmiResult.reasons,
    ...loanRevResult.reasons,
    ...tenureResult.reasons,
    ...businessResult.reasons,
    ...revenueLevelResult.reasons,
    ...consistencyResult.reasons,
  ];

  const decision = totalScore >= 60 ? 'APPROVED' : 'REJECTED';

  if (decision === 'REJECTED' && allReasons.length === 0) {
    allReasons.push('INSUFFICIENT_CREDIT_SCORE');
  }

  return {
    decision,
    creditScore: totalScore,
    reasons: allReasons,
    breakdown: {
      revenueToEmiScore: revenueEmiResult.score,
      loanToRevenueScore: loanRevResult.score,
      tenureRiskScore: tenureResult.score,
      businessTypeScore: businessResult.score,
      revenueLevelScore: revenueLevelResult.score,
      consistencyPenalty: consistencyResult.penalty,
    },
    details: {
      estimatedEMI: Math.round(emi),
      revenueToEmiRatio: Math.round(revenueToEmi * 100) / 100,
      loanToRevenueRatio: Math.round(loanToRevenue * 100) / 100,
      interestRate: `${(annualRate * 100).toFixed(1)}% p.a.`,
    },
  };
}

module.exports = { evaluate, calculateEMI };
