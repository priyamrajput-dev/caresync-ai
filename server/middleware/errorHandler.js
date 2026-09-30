import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error [${req.method} ${req.originalUrl}]:`, err.message || err);

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id: ${err.value}`, 404, 'NOT_FOUND');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return errorResponse(res, `Validation failed: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `Duplicate entry for ${field}. Value already exists.`, 409, 'DUPLICATE_KEY');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token expired', 401, 'TOKEN_EXPIRED');
  }

  // Explicit HTTP status codes attached to error or business errors
  const statusCode = err.statusCode || (err.message && !err.message.includes('server') ? 400 : 500);
  const message = err.message || 'An internal server error occurred';
  const code = err.code || 'REQUEST_FAILED';

  return errorResponse(res, message, statusCode, code);
}
