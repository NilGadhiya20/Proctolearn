import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

// Auth Middleware - Verify JWT
export const auth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🔐 Auth Middleware: Authorization header:', req.headers.authorization?.substring(0, 30) + '...');
    console.log('🔐 Auth Middleware: Token extracted:', token?.substring(0, 30) + '...');

    if (!token) {
      console.log('❌ Auth Middleware: No token provided');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    console.log('🔐 Auth Middleware: Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth Middleware: Token verified! UserId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Auth Middleware: Token verification error:', error.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Check User Role
export const checkRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId);

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  });
};

// Verify Institution Access
export const verifyInstitutionAccess = asyncHandler(async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    req.userRole = user.role;
    req.institutionId = user.institution;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Institution verification failed'
    });
  }
});
