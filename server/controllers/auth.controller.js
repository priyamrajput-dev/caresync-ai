import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'viewer', title = 'Medical Operations Staff', hospitalId = null } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 'User with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      title,
      hospitalId,
    });
    await user.save();

    const token = signToken(user);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatarUrl: user.avatarUrl,
        },
      },
      'User registered successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = signToken(user);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatarUrl: user.avatarUrl,
          hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
        },
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401, 'UNAUTHORIZED');
    }
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatarUrl: user.avatarUrl,
      hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
    });
  } catch (err) {
    next(err);
  }
}
