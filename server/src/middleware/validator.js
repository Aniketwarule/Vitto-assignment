const response = require('../utils/responseHelper');

/**
 * Validate business profile fields
 */
function validateBusinessProfile(data) {
  const errors = [];

  // Owner name
  if (!data.ownerName || typeof data.ownerName !== 'string' || data.ownerName.trim().length < 2) {
    errors.push({ field: 'ownerName', message: 'Owner name is required (min 2 characters)' });
  }

  // PAN validation — Indian PAN format: ABCDE1234F
  if (!data.pan || typeof data.pan !== 'string') {
    errors.push({ field: 'pan', message: 'PAN is required' });
  } else {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(data.pan.toUpperCase())) {
      errors.push({ field: 'pan', message: 'Invalid PAN format. Expected: ABCDE1234F' });
    }
  }

  // Business type
  const validTypes = ['retail', 'manufacturing', 'services', 'agriculture', 'other'];
  if (!data.businessType || !validTypes.includes(data.businessType)) {
    errors.push({
      field: 'businessType',
      message: `Business type must be one of: ${validTypes.join(', ')}`,
    });
  }

  // Monthly revenue
  if (data.monthlyRevenue === undefined || data.monthlyRevenue === null || data.monthlyRevenue === '') {
    errors.push({ field: 'monthlyRevenue', message: 'Monthly revenue is required' });
  } else {
    const revenue = Number(data.monthlyRevenue);
    if (isNaN(revenue) || revenue <= 0) {
      errors.push({ field: 'monthlyRevenue', message: 'Monthly revenue must be a positive number' });
    }
  }

  return errors;
}

/**
 * Validate loan application fields
 */
function validateLoanDetails(data) {
  const errors = [];

  // Loan amount
  if (data.amount === undefined || data.amount === null || data.amount === '') {
    errors.push({ field: 'amount', message: 'Loan amount is required' });
  } else {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({ field: 'amount', message: 'Loan amount must be a positive number' });
    } else if (amount < 10000) {
      errors.push({ field: 'amount', message: 'Minimum loan amount is ₹10,000' });
    } else if (amount > 50000000) {
      errors.push({ field: 'amount', message: 'Maximum loan amount is ₹5,00,00,000' });
    }
  }

  // Tenure
  if (data.tenure === undefined || data.tenure === null || data.tenure === '') {
    errors.push({ field: 'tenure', message: 'Repayment tenure is required' });
  } else {
    const tenure = Number(data.tenure);
    if (isNaN(tenure) || !Number.isInteger(tenure) || tenure <= 0) {
      errors.push({ field: 'tenure', message: 'Tenure must be a positive whole number (months)' });
    } else if (tenure < 1 || tenure > 84) {
      errors.push({ field: 'tenure', message: 'Tenure must be between 1 and 84 months' });
    }
  }

  // Purpose
  if (!data.purpose || typeof data.purpose !== 'string' || data.purpose.trim().length < 3) {
    errors.push({ field: 'purpose', message: 'Loan purpose is required (min 3 characters)' });
  }

  return errors;
}

/**
 * Express middleware: validate full application submission
 */
function validateApplication(req, res, next) {
  const { businessProfile, loanDetails } = req.body;

  if (!businessProfile || typeof businessProfile !== 'object') {
    return response.error(res, 'Business profile data is required', 400);
  }

  if (!loanDetails || typeof loanDetails !== 'object') {
    return response.error(res, 'Loan details are required', 400);
  }

  const profileErrors = validateBusinessProfile(businessProfile);
  const loanErrors = validateLoanDetails(loanDetails);
  const allErrors = [...profileErrors, ...loanErrors];

  if (allErrors.length > 0) {
    return response.error(res, 'Validation failed', 422, allErrors);
  }

  // Normalize data — attach cleaned values
  req.validatedData = {
    businessProfile: {
      ownerName: businessProfile.ownerName.trim(),
      pan: businessProfile.pan.toUpperCase().trim(),
      businessType: businessProfile.businessType,
      monthlyRevenue: Number(businessProfile.monthlyRevenue),
    },
    loanDetails: {
      amount: Number(loanDetails.amount),
      tenure: Number(loanDetails.tenure),
      purpose: loanDetails.purpose.trim(),
    },
  };

  next();
}

module.exports = { validateApplication, validateBusinessProfile, validateLoanDetails };
