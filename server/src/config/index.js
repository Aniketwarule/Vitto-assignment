require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'https://vitto-lovat.vercel.app', 'https://vitto.aniketwarule.dev'],
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Default interest rate for EMI calculation (12% annual = 1% monthly)
  defaultAnnualInterestRate: 0.12,
};
