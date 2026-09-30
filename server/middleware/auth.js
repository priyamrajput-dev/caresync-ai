import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/response.js';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Proceed unauthenticated; requireAuth will catch if required
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
      };
    }
    next();
  } catch (err) {
    // If token invalid, proceed with no req.user
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return errorResponse(
      res,
      'Authentication required. Please provide a valid Bearer token.',
      401,
      'UNAUTHORIZED'
    );
  }
  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access forbidden: required role [${allowedRoles.join(', ')}], current role '${req.user.role}'`,
        403,
        'FORBIDDEN'
      );
    }
    next();
  };
}
