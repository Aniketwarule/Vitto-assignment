/**
 * Standardized API response helpers
 */

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function created(res, data) {
  return success(res, data, 201);
}

function error(res, message, statusCode = 400, errors = null) {
  const response = {
    success: false,
    error: {
      message,
      ...(errors && { details: errors }),
    },
  };
  return res.status(statusCode).json(response);
}

function notFound(res, resource = 'Resource') {
  return error(res, `${resource} not found`, 404);
}

function serverError(res, message = 'Internal server error') {
  return error(res, message, 500);
}

module.exports = { success, created, error, notFound, serverError };
