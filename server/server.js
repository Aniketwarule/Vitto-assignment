require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config');
const apiRoutes = require('./src/routes/api');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();

// ─── Security & Parsing ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ─── Logging ─────────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Error Handling ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🏦 Vitto Lending API running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   CORS origin: ${config.corsOrigin}\n`);
});

module.exports = app;
