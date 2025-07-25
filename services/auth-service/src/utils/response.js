// Utility functions for standardized API responses

// Success response
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response
const errorResponse = (res, error, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error.message || error
  });
};

// Validation error response
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors
  });
};

// Not found response
const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// Forbidden response
const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// Conflict response
const conflictResponse = (res, message = 'Conflict') => {
  return res.status(409).json({
    success: false,
    message
  });
};

// Paginated response
const paginatedResponse = (res, data, page, limit, total) => {
  return res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  paginatedResponse
}; 