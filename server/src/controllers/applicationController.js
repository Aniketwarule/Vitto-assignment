const store = require('../store');
const decisionEngine = require('../services/decisionEngine');
const response = require('../utils/responseHelper');

/**
 * POST /api/applications
 * Submit a complete loan application — creates business profile, loan record,
 * runs the decision engine, and returns the result.
 */
async function submitApplication(req, res, next) {
  try {
    const { businessProfile, loanDetails } = req.validatedData;

    // Run the decision engine
    const decision = decisionEngine.evaluate(businessProfile, loanDetails);

    // Build the application record
    const application = store.saveApplication({
      businessProfile,
      loanDetails,
      decision,
      status: decision.decision === 'APPROVED' ? 'approved' : 'rejected',
    });

    return response.created(res, application);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/applications/:id
 * Retrieve an application and its decision by ID
 */
async function getApplication(req, res, next) {
  try {
    const { id } = req.params;
    const application = store.getApplicationById(id);

    if (!application) {
      return response.notFound(res, 'Application');
    }

    return response.success(res, application);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/applications
 * List all applications (audit trail)
 */
async function listApplications(req, res, next) {
  try {
    const applications = store.getAllApplications();
    return response.success(res, {
      total: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitApplication, getApplication, listApplications };
