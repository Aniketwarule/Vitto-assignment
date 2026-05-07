require('dotenv').config();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,https://vitto.aniketwarule.dev')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Default interest rate for EMI calculation (12% annual = 1% monthly)
  defaultAnnualInterestRate: 0.12,
};
