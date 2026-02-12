import express from 'express';
import { registerUser, loginUser, refreshAccessToken, getCurrentUser, logoutUser, googleAuthLogin, verifyEmailExists } from '../controllers/authController.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { auth, checkRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import User from '../models/User.js';
import StudentSubmission from '../models/StudentSubmission.js';

const router = express.Router();

// Public Routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/google', googleAuthLogin);
router.post('/verify-email', verifyEmailExists);

// Protected Routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logoutUser);

// Update current user's profile - Available for all authenticated users
router.patch('/profile',
  auth,
  asyncHandler(async (req, res) => {
    const allowed = ['firstName', 'lastName', 'phone', 'profilePicture', 'bio'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password').populate('institution');

    if (!updated) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  })
);

// Get current student's submissions history (students only)
router.get('/me/submissions',
  auth,
  checkRole(USER_ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const submissions = await StudentSubmission.find({ student: req.userId })
      .populate({ path: 'quiz', select: 'title subject startTime endTime' })
      .select('score totalMarks status createdAt updatedAt quiz')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: submissions
    });
  })
);

export default router;
