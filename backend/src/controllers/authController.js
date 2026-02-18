import User from '../models/User.js';
import Institution from '../models/Institution.js';
import { generateToken, generateRefreshToken } from '../utils/authUtils.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = USER_ROLES.STUDENT, institutionCode, department, adminCode } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Validate admin code if registering as admin
  if (role === USER_ROLES.ADMIN) {
    if (!adminCode || adminCode !== 'NIL-PROCTO2912') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or missing admin code. Cannot create admin account.'
      });
    }
  }

  // Find institution by code
  const institution = await Institution.findOne({ code: institutionCode });
  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    institution: institution._id,
    department,
    adminCode: role === USER_ROLES.ADMIN ? adminCode : undefined
  });

  // Generate email verification token
  const emailVerificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

  // Send verification email
  if (process.env.NODE_ENV !== 'test') {
    await sendVerificationEmail(email, emailVerificationToken, firstName);
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      user: user.toJSON(),
      token,
      refreshToken
    }
  });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, adminCode } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check admin code if user is admin
  if (user.role === USER_ROLES.ADMIN) {
    if (!adminCode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Admin code is required for admin login'
      });
    }

    if (user.adminCode !== adminCode) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid admin code'
      });
    }
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Your account has been deactivated'
    });
  }

  // Generate tokens immediately for faster response
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login asynchronously (non-blocking)
  // This improves response time significantly
  User.updateOne(
    { _id: user._id },
    { $set: { lastLogin: new Date() } }
  ).exec().catch(err => console.error('Failed to update lastLogin:', err));

  // Send response immediately without waiting for lastLogin update
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token,
      refreshToken
    }
  });
});

// Google OAuth Login
export const googleAuthLogin = asyncHandler(async (req, res) => {
  const { idToken, accessToken, institutionCode } = req.body;

  if (!idToken && !accessToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'idToken or accessToken is required for Google login'
    });
  }

  if (idToken && (!process.env.GOOGLE_CLIENT_ID || !googleClient)) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID.'
    });
  }

  try {
    let email, firstName, lastName, profilePicture;

    // Prefer ID token verification when provided
    if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      email = payload?.email;
      firstName = payload?.given_name || payload?.name?.split(' ')[0] || 'Google';
      lastName = payload?.family_name || payload?.name?.split(' ').slice(1).join(' ') || 'User';
      profilePicture = payload?.picture;
    } else if (accessToken) {
      // Fallback: validate via Google Userinfo endpoint using OAuth access token (e.g., Supabase provider token)
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profile = userInfoResponse.data;
      email = profile?.email;
      firstName = profile?.given_name || profile?.name?.split(' ')[0] || 'Google';
      lastName = profile?.family_name || profile?.name?.split(' ').slice(1).join(' ') || 'User';
      profilePicture = profile?.picture;
    }

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Email not available from Google profile'
      });
    }

    let user = await User.findOne({ email });

    // If user does not exist, create with default institution and random password
    if (!user) {
      const resolvedInstitutionCode = (institutionCode || process.env.DEFAULT_INSTITUTION_CODE || '').toUpperCase();

      if (!resolvedInstitutionCode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Institution code is required for new Google sign-ins'
        });
      }

      const institution = await Institution.findOne({ code: resolvedInstitutionCode });
      if (!institution) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: `Institution with code ${resolvedInstitutionCode} not found`
        });
      }

      const randomPassword = uuidv4();

      user = await User.create({
        firstName,
        lastName,
        email,
        password: randomPassword,
        role: USER_ROLES.STUDENT,
        institution: institution._id,
        isEmailVerified: true,
        profilePicture,
        lastLogin: new Date()
      });
    }

    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate tokens immediately
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login asynchronously (non-blocking)
    User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    ).exec().catch(err => console.error('Failed to update lastLogin:', err));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Google login successful',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// Refresh Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newToken = generateToken(decoded.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate('institution');

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user.toJSON()
  });
});

// Verify Email Exists (for forgot password)
export const verifyEmailExists = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Email and role are required'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'No account found with this email'
    });
  }

  // Verify user role matches
  if (user.role.toLowerCase() !== role.toLowerCase()) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: `This email is not registered as a ${role}`
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Email verified. Password reset link will be sent.',
    data: { exists: true, email: user.email }
  });
});

// Logout User (Optional - mainly for frontend)
export const logoutUser = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Request Faculty Role
export const requestFacultyRole = asyncHandler(async (req, res) => {
  const { reason, qualifications } = req.body;

  if (!reason || !qualifications) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Reason and qualifications are required'
    });
  }

  const user = await User.findById(req.userId);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is already faculty or admin
  if (user.role === USER_ROLES.FACULTY || user.role === USER_ROLES.ADMIN) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'You already have faculty or admin privileges'
    });
  }

  // Check if there's already a pending request
  if (user.facultyRequest && user.facultyRequest.status === 'pending') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'You already have a pending faculty request'
    });
  }

  // Create faculty request
  user.facultyRequest = {
    status: 'pending',
    requestedAt: new Date(),
    reason,
    qualifications
  };

  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Faculty role request submitted successfully',
    data: user.facultyRequest
  });
});

// Get All Faculty Requests (Admin only)
export const getFacultyRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { 'facultyRequest.status': status || 'pending' };

  const users = await User.find(query)
    .select('firstName lastName email role facultyRequest createdAt')
    .populate('institution', 'name code')
    .sort({ 'facultyRequest.requestedAt': -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: users,
    count: users.length
  });
});

// Approve or Reject Faculty Request (Admin only)
export const reviewFacultyRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid action. Must be "approve" or "reject"'
    });
  }

  if (action === 'reject' && !rejectionReason) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  if (!user.facultyRequest || user.facultyRequest.status !== 'pending') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'No pending faculty request found for this user'
    });
  }

  if (action === 'approve') {
    user.role = USER_ROLES.FACULTY;
    user.facultyRequest.status = 'approved';
    user.facultyRequest.reviewedAt = new Date();
    user.facultyRequest.reviewedBy = req.userId;
  } else {
    user.facultyRequest.status = 'rejected';
    user.facultyRequest.reviewedAt = new Date();
    user.facultyRequest.reviewedBy = req.userId;
    user.facultyRequest.rejectionReason = rejectionReason;
  }

  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Faculty request ${action}d successfully`,
    data: user
  });
});

