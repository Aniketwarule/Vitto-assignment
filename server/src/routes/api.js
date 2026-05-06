const express = require('express');
const router = express.Router();

const { submitApplication, getApplication, listApplications } = require('../controllers/applicationController');
const { validateApplication } = require('../middleware/validator');
const { decisionRateLimiter } = require('../middleware/rateLimiter');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Application endpoints
router.post('/applications', decisionRateLimiter, validateApplication, submitApplication);
router.get('/applications', listApplications);
router.get('/applications/:id', getApplication);

module.exports = router;
