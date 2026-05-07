require('dotenv').config();

const normalizeOrigin = (origin) =>
  origin
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/$/, '');

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,https://vitto.aniketwarule.dev')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins,
  normalizeOrigin,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Default interest rate for EMI calculation (12% annual = 1% monthly)
  defaultAnnualInterestRate: 0.12,
};
