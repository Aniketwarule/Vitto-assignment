const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter for decision endpoints
 * Prevents abuse of the credit scoring engine
 */
const decisionRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
    },
  },
});

module.exports = { decisionRateLimiter };
