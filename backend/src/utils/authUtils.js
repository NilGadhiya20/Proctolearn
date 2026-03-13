import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { HTTP_STATUS } from '../config/constants.js';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Get secrets with fallback defaults
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('❌ JWT_SECRET not found in environment variables!');
    console.error('   Checked path:', envPath);
    console.error('   Available JWT keys:', Object.keys(process.env).filter(k => k.includes('JWT')));
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    console.error('❌ REFRESH_TOKEN_SECRET not found in environment variables!');
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not set');
  }
  return secret;
};

// Verify JWT Token
export const verifyToken = (token, secret = null) => {
  try {
    const finalSecret = secret || getJWTSecret();
    return jwt.verify(token, finalSecret);
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
};

// Generate JWT Token
export const generateToken = (userId, secret = null, expiresIn = '7d') => {
  try {
    const finalSecret = secret || getJWTSecret();
    const token = jwt.sign({ userId }, finalSecret, { expiresIn });
    console.log('✅ JWT Token generated successfully');
    return token;
  } catch (error) {
    console.error('❌ Token generation failed:', error.message);
    throw error;
  }
};

// Generate Refresh Token
export const generateRefreshToken = (userId, secret = null, expiresIn = '30d') => {
  try {
    const finalSecret = secret || getRefreshSecret();
    const token = jwt.sign({ userId }, finalSecret, { expiresIn });
    console.log('✅ Refresh Token generated successfully');
    return token;
  } catch (error) {
    console.error('❌ Refresh token generation failed:', error.message);
    throw error;
  }
};

// Authenticate JWT Middleware
export const authenticateJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorize by Role Middleware
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};

// Check if user owns the resource
export const checkResourceOwnership = (resourceOwnerId) => {
  return (req, res, next) => {
    if (req.userId !== resourceOwnerId && req.user?.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};
