import { errorResponse } from '../utils/response.js';

export function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return errorResponse(
        res,
        `Missing required request fields: ${missing.join(', ')}`,
        400,
        'VALIDATION_FAILED'
      );
    }
    next();
  };
}
