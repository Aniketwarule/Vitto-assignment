const response = require('../utils/responseHelper');

/**
 * Global error handling middleware
 * Catches unhandled errors and returns structured responses
 */
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return response.error(res, 'Invalid JSON in request body', 400);
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return response.error(res, 'Request body too large', 413);
  }

  return response.serverError(res, 'Something went wrong. Please try again.');
}

/**
 * 404 handler for unknown routes
 */
function notFoundHandler(req, res) {
  return response.notFound(res, `Route ${req.method} ${req.path}`);
}

module.exports = { errorHandler, notFoundHandler };
